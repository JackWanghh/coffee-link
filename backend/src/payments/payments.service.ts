import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { notFound, stateInvalid } from '../common/errors';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

export interface PaymentProvider {
  prepare(method: PaymentMethod, amountCents: number, orderId: string): Promise<Record<string, unknown>>;
  verifySignature(body: unknown, signature: string): boolean;
}

export class MockPaymentProvider implements PaymentProvider {
  async prepare(method: PaymentMethod, amountCents: number, orderId: string) {
    return {
      provider: 'mock',
      method,
      amountCents,
      orderId,
      payUrl: `mock://pay/${orderId}`,
      notice: 'Mock 支付：直接调用回调接口完成支付',
    };
  }

  verifySignature(_body: unknown, _signature: string): boolean {
    return true;
  }
}

@Injectable()
export class PaymentsService {
  private readonly provider: PaymentProvider = new MockPaymentProvider();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async start(sessionId: string, payerId: string, method: PaymentMethod, idempotencyKey?: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.senderId !== payerId) throw notFound('订单不存在');
    if (session.type !== 'coffee' || session.status !== 'acceptedPendingPayment') {
      throw stateInvalid('当前状态不能发起支付');
    }
    if (session.paymentDeadlineAt && session.paymentDeadlineAt < new Date()) {
      throw stateInvalid('付款期限已过');
    }
    if (idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        if (existing.sessionId !== session.id) {
          throw stateInvalid('幂等键已用于其他订单');
        }
        return existing;
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        sessionId: session.id,
        amountCents: session.priceCents ?? 0,
        method,
        idempotencyKey: idempotencyKey ?? `pay-${session.id}-${Date.now()}`,
      },
    });
    const checkout = await this.provider.prepare(method, payment.amountCents, payment.id);
    return { payment, checkout };
  }

  async callback(sessionId: string, dto: { providerTradeNo: string; status: 'success' | 'failed'; signature: string }) {
    if (!this.provider.verifySignature(dto, dto.signature)) {
      throw stateInvalid('支付签名校验失败');
    }
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { sessionId } });
      if (!payment) throw notFound('支付单不存在');
      if (payment.status === 'success' || payment.status === 'refunded') {
        return { replay: true, payment }; // 幂等：重复回调直接返回
      }
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: dto.status === 'success' ? 'success' : 'failed',
          providerTradeNo: dto.providerTradeNo,
        },
      });
      if (dto.status === 'success') {
        const session = await tx.session.findUnique({ where: { id: sessionId } });
        if (!session || session.status !== 'acceptedPendingPayment') {
          throw stateInvalid('会话状态不允许确认支付');
        }
        await tx.session.update({
          where: { id: sessionId },
          data: { status: 'booked' },
        });
        await this.notifications.notify(
          session.senderId,
          'payment_success',
          '支付成功',
          '电子咖啡订单已确认，对谈已预约',
          session.id,
        );
      }
      return { replay: false, payment: updatedPayment };
    });
  }
}
