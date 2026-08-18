import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma, SessionStatus } from '@prisma/client';
import {
  conflictSlotTaken,
  notFound,
  quotaExceeded,
  stateInvalid,
} from '../common/errors';
import { paginate } from '../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

const DECLINE_REASONS = ['超出当前分享范围', '信息不足', '时间不合适', '近期暂停接受'];
const SESSION_INCLUDE = {
  sender: true,
  receiver: true,
  theme: { include: { category: true } },
  offeredTheme: true,
} satisfies Prisma.SessionInclude;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createCoffeeInvitation(
    senderId: string,
    dto: { sharerId: string; themeId: string; question: string; slotIds: string[] },
  ) {
    if (dto.slotIds.length > 3) {
      throw stateInvalid('最多选择 3 个期望时段');
    }
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.sharerId },
      include: { signatureDrink: true },
    });
    if (!receiver || !receiver.isSharingOpen) throw notFound('分享者不存在或未开放分享');
    const theme = await this.prisma.theme.findFirst({
      where: { id: dto.themeId, userId: receiver.id, active: true },
    });
    if (!theme) throw notFound('主题不存在');
    const slots = await this.validCandidateSlots(receiver.id, dto.slotIds);
    const created = await this.prisma.session.create({
      data: {
        type: 'coffee',
        orderNumber: this.orderNumber('INV'),
        senderId,
        receiverId: receiver.id,
        themeId: theme.id,
        question: dto.question,
        candidateSlots: slots,
        priceCents: receiver.signatureDrink?.priceCents ?? 0,
        ...(receiver.signatureDrink
          ? {
              drinkSnapshot: {
                id: receiver.signatureDrink.id,
                name: receiver.signatureDrink.name,
                nameEn: receiver.signatureDrink.nameEn,
                priceCents: receiver.signatureDrink.priceCents,
                icon: receiver.signatureDrink.icon,
                description: receiver.signatureDrink.description,
                tag: receiver.signatureDrink.tag,
              },
            }
          : {}),
        status: 'pendingResponse',
        expiresAt: new Date(Date.now() + 12 * 3600_000),
      },
    });
    const session = await this.prisma.session.findUniqueOrThrow({
      where: { id: created.id },
      include: SESSION_INCLUDE,
    });
    await this.notifications.notify(
      receiver.id,
      'new_invitation',
      '收到新的电子咖啡邀请',
      `${session.sender.name} 向你发起主题「${theme.title}」的邀请`,
      session.id,
    );
    return session;
  }

  async createTopicSwapInvitation(
    senderId: string,
    dto: {
      sharerId: string;
      requestedThemeId: string;
      offeredThemeId: string;
      question: string;
      offering: string;
      slotIds: string[];
    },
  ) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.sharerId },
    });
    if (!receiver || !receiver.isSharingOpen) throw notFound('分享者不存在或未开放分享');
    if (!receiver.acceptsTopicSwap) {
      throw stateInvalid('对方暂未开启主题互换');
    }
    const requestedTheme = await this.prisma.theme.findFirst({
      where: { id: dto.requestedThemeId, userId: receiver.id, active: true },
    });
    if (!requestedTheme) throw notFound('对方主题不存在');
    const offeredTheme = await this.prisma.theme.findFirst({
      where: { id: dto.offeredThemeId, userId: senderId, active: true },
    });
    if (!offeredTheme) throw notFound('你的交换主题不存在或未上架');

    await this.assertSwapQuota(senderId, receiver.id);
    const slots = await this.validCandidateSlots(receiver.id, dto.slotIds);
    const created = await this.prisma.session.create({
      data: {
        type: 'topicSwap',
        orderNumber: this.orderNumber('SWP'),
        senderId,
        receiverId: receiver.id,
        themeId: requestedTheme.id,
        offeredThemeId: offeredTheme.id,
        question: dto.question,
        offering: dto.offering,
        candidateSlots: slots,
        status: 'pendingResponse',
        expiresAt: new Date(Date.now() + 12 * 3600_000),
      },
    });
    const session = await this.prisma.session.findUniqueOrThrow({
      where: { id: created.id },
      include: SESSION_INCLUDE,
    });
    await this.notifications.notify(
      receiver.id,
      'new_invitation',
      '收到新的主题互换邀请',
      `${session.sender.name} 想与你互换主题「${requestedTheme.title}」`,
      session.id,
    );
    return session;
  }

  async list(
    userId: string,
    query: { direction?: 'sent' | 'incoming'; filter?: string; afterId?: string; limit?: number },
  ) {
    const where: Prisma.SessionWhereInput =
      query.direction === 'incoming'
        ? { receiverId: userId }
        : query.direction === 'sent'
          ? { senderId: userId }
          : { OR: [{ senderId: userId }, { receiverId: userId }] };
    if (query.filter && query.filter !== 'all') {
      const statuses: SessionStatus[] =
        query.filter === 'pending'
          ? ['pendingResponse', 'needsNewTime']
          : query.filter === 'payment'
            ? ['acceptedPendingPayment']
            : query.filter === 'scheduled'
              ? ['booked', 'swapScheduled']
              : ['completed'];
      where.status = { in: statuses };
    }
    const all = await this.prisma.session.findMany({
      where,
      include: SESSION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    const limit = Math.min(query.limit ?? 20, 50);
    const page = paginate(all, limit, query.afterId);
    return {
      data: {
        items: page.items.map((s) => this.present(s, userId)),
        nextCursor: page.nextCursor,
      },
    };
  }

  async detail(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: SESSION_INCLUDE,
    });
    if (!session || (session.senderId !== userId && session.receiverId !== userId)) {
      throw notFound('对谈不存在');
    }
    return { data: this.present(session, userId, true) };
  }

  async accept(
    sessionId: string,
    receiverId: string,
    dto: { confirmedSlotId: string; receiverQuestion?: string },
  ) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.receiverId !== receiverId) throw notFound('邀请不存在');
    if (!['pendingResponse', 'needsNewTime'].includes(session.status)) {
      throw stateInvalid();
    }
    if (session.type === 'topicSwap') {
      const q = dto.receiverQuestion?.trim() ?? '';
      if (q.length < 8) throw stateInvalid('主题互换请补充不少于 8 个字的问题');
    }
    const slots = session.candidateSlots as { id: string; label: string }[];
    const candidate = slots.find((s) => s.id === dto.confirmedSlotId);
    if (!candidate) throw conflictSlotTaken();

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const reserved = await tx.slot.updateMany({
        where: {
          id: candidate.id,
          userId: receiverId,
          isAvailable: true,
        },
        data: { isAvailable: false },
      });
      if (reserved.count !== 1) throw conflictSlotTaken();

      const receiver = await tx.user.findUnique({ where: { id: receiverId } });
      const slotRow = await tx.slot.findUnique({ where: { id: candidate.id } });
      const status: SessionStatus =
        session.type === 'coffee' ? 'acceptedPendingPayment' : 'swapScheduled';
      const startsAt = slotRow?.slotAt ?? now;
      const updated = await tx.session.update({
        where: { id: session.id },
        data: {
          status,
          confirmedSlotId: candidate.id,
          confirmedSlotLabel: candidate.label,
          receiverQuestion: dto.receiverQuestion?.trim() || null,
          paymentDeadlineAt:
            session.type === 'coffee' ? new Date(now.getTime() + 2 * 3600_000) : null,
          meetingLink: session.type === 'coffee' ? receiver?.meetingLink ?? null : null,
          startsAt,
          endsAt: new Date(startsAt.getTime() + 30 * 60000),
        },
        include: SESSION_INCLUDE,
      });
      await this.notifications.notify(
        session.senderId,
        'invitation_accepted',
        status === 'acceptedPendingPayment' ? '邀请已接受，请付款' : '主题互换已排期',
        status === 'acceptedPendingPayment' ? '对方已接受，请在 2 小时内完成付款' : '互换对谈已确认时间',
        session.id,
      );
      return updated;
    });
  }

  async decline(sessionId: string, receiverId: string, reason: string) {
    if (!DECLINE_REASONS.includes(reason)) {
      throw stateInvalid('请选择有效的婉拒原因');
    }
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.receiverId !== receiverId) throw notFound('邀请不存在');
    if (!['pendingResponse', 'needsNewTime'].includes(session.status)) {
      throw stateInvalid();
    }
    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: { status: 'declined', declineReason: reason },
      include: SESSION_INCLUDE,
    });
    await this.notifications.notify(
      session.senderId,
      'invitation_declined',
      '邀请被婉拒',
      reason,
      session.id,
    );
    return updated;
  }

  async resubmitSlots(sessionId: string, senderId: string, slotIds: string[]) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.senderId !== senderId) throw notFound('邀请不存在');
    if (session.status !== 'needsNewTime') throw stateInvalid();
    const slots = await this.validCandidateSlots(session.receiverId, slotIds);
    return this.prisma.session.update({
      where: { id: session.id },
      data: {
        candidateSlots: slots,
        status: 'pendingResponse',
        expiresAt: new Date(Date.now() + 12 * 3600_000),
      },
      include: SESSION_INCLUDE,
    });
  }

  async cancel(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { payment: true },
    });
    if (!session || (session.senderId !== userId && session.receiverId !== userId)) {
      throw notFound('对谈不存在');
    }
    if (!['pendingResponse', 'needsNewTime', 'booked', 'swapScheduled'].includes(session.status)) {
      throw stateInvalid('当前状态不能取消');
    }
    const refund = session.type === 'coffee' && session.status === 'booked';
    return this.prisma.$transaction(async (tx) => {
      if (session.confirmedSlotId) {
        await tx.slot.updateMany({
          where: { id: session.confirmedSlotId, isAvailable: false },
          data: { isAvailable: true },
        });
      }
      if (refund && session.payment) {
        await tx.payment.update({
          where: { id: session.payment.id },
          data: { status: 'refunded' },
        });
      }
      const updated = await tx.session.update({
        where: { id: session.id },
        data: { status: 'cancelled' },
        include: SESSION_INCLUDE,
      });
      await this.notifications.notify(
        userId === session.senderId ? session.receiverId : session.senderId,
        'cancel_refund',
        refund ? '订单已取消并退款' : '对谈已取消',
        refund ? '已按规则全额原路退款' : '对谈已取消',
        session.id,
      );
      return updated;
    });
  }

  private async validCandidateSlots(userId: string, slotIds: string[]) {
    const slots = await this.prisma.slot.findMany({
      where: { id: { in: slotIds }, userId, isAvailable: true },
    });
    if (slots.length !== new Set(slotIds).size || slots.length !== slotIds.length) {
      throw conflictSlotTaken('所选时段不可用');
    }
    return slots.map((s) => ({ id: s.id, label: s.label }));
  }

  private async assertSwapQuota(senderId: string, receiverId: string) {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - day + 1);

    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    const limit = sender?.weeklySwapLimit ?? 3;
    const [weekly, pending, cooldown] = await Promise.all([
      this.prisma.session.count({
        where: {
          senderId,
          type: 'topicSwap',
          createdAt: { gte: weekStart },
          status: { notIn: ['declined', 'cancelled', 'expired'] },
        },
      }),
      this.prisma.session.count({
        where: {
          senderId,
          type: 'topicSwap',
          status: { in: ['pendingResponse', 'needsNewTime'] },
        },
      }),
      this.prisma.session.count({
        where: {
          senderId,
          receiverId,
          type: 'topicSwap',
          status: 'declined',
          createdAt: { gte: new Date(Date.now() - 7 * 86400_000) },
        },
      }),
    ]);
    if (weekly >= limit) throw quotaExceeded('本周主题互换发起次数已达上限');
    if (pending >= 2) throw quotaExceeded('同时待处理的主题互换邀请已达上限（2 个）');
    if (cooldown > 0) throw quotaExceeded('对方婉拒后 7 天内不能再次发起互换邀请');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTimeouts() {
    const now = new Date();
    const expired = await this.prisma.session.findMany({
      where: {
        status: 'pendingResponse',
        expiresAt: { lt: now },
      },
      select: { id: true, receiverId: true, senderId: true },
    });
    if (expired.length > 0) {
      await this.prisma.session.updateMany({
        where: { id: { in: expired.map((s) => s.id) } },
        data: { status: 'expired' },
      });
      for (const s of expired) {
        await this.notifications.notify(
          s.senderId,
          'invitation_expiring',
          '邀请已过期',
          '邀请超过 12 小时未回应，已自动过期',
          s.id,
        );
      }
    }

    const unpaid = await this.prisma.session.findMany({
      where: {
        status: 'acceptedPendingPayment',
        paymentDeadlineAt: { lt: now },
      },
      select: { id: true, confirmedSlotId: true, senderId: true },
    });
    for (const s of unpaid) {
      await this.prisma.$transaction(async (tx) => {
        if (s.confirmedSlotId) {
          await tx.slot.updateMany({
            where: { id: s.confirmedSlotId, isAvailable: false },
            data: { isAvailable: true },
          });
        }
        await tx.session.update({
          where: { id: s.id },
          data: { status: 'expired' },
        });
      });
      await this.notifications.notify(
        s.senderId,
        'payment_deadline',
        '付款已超时',
        '2 小时付款期限已过，邀请已关闭',
        s.id,
      );
    }

    const finished = await this.prisma.session.findMany({
      where: {
        status: { in: ['booked', 'swapScheduled'] },
        endsAt: { lt: now },
      },
      select: { id: true, senderId: true, receiverId: true },
    });
    if (finished.length > 0) {
      await this.prisma.session.updateMany({
        where: { id: { in: finished.map((s) => s.id) } },
        data: { status: 'completed' },
      });
    }
  }

  private orderNumber(prefix: 'INV' | 'SWP'): string {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private present(
    session: Prisma.SessionGetPayload<{ include: typeof SESSION_INCLUDE }>,
    viewerId: string,
    includeMeeting = false,
  ) {
    const showMeeting =
      includeMeeting &&
      ['booked', 'swapScheduled', 'completed', 'inAfterSale', 'refunding'].includes(
        session.status,
      );
    return {
      id: session.id,
      type: session.type,
      orderNumber: session.orderNumber,
      senderID: session.sender.id,
      senderName: session.sender.name,
      senderTitle: session.sender.title,
      senderCompany: session.sender.company,
      senderAvatarURL: session.sender.avatarUrl,
      receiverID: session.receiver.id,
      receiverName: session.receiver.name,
      receiverTitle: session.receiver.title,
      receiverCompany: session.receiver.company,
      receiverAvatarURL: session.receiver.avatarUrl,
      sender: {
        id: session.sender.id,
        name: session.sender.name,
        title: session.sender.title,
        company: session.sender.company,
        avatarUrl: session.sender.avatarUrl,
      },
      receiver: {
        id: session.receiver.id,
        name: session.receiver.name,
        title: session.receiver.title,
        company: session.receiver.company,
        avatarUrl: session.receiver.avatarUrl,
      },
      theme: {
        id: session.theme.id,
        title: session.theme.title,
        description: session.theme.description,
        category: session.theme.category?.name ?? null,
      },
      offeredTheme: session.offeredTheme
        ? { id: session.offeredTheme.id, title: session.offeredTheme.title }
        : null,
      question: session.question,
      offering: session.offering,
      receiverQuestion: session.receiverQuestion,
      candidateSlots: (session.candidateSlots as { id: string; label: string }[]).map((s) => s.label),
      confirmedSlot: session.confirmedSlotLabel,
      coffeeDrink: session.drinkSnapshot,
      priceCents: session.priceCents,
      paymentMethod: session.paymentMethod,
      paymentDeadlineAt: session.paymentDeadlineAt,
      status: session.status,
      statusLabel: this.statusLabel(session.status, session.senderId === viewerId),
      declineReason: session.declineReason,
      meetingType: '腾讯会议',
      meetingLink: showMeeting ? session.meetingLink : null,
      meetingId: showMeeting ? this.meetingId(session.meetingLink) : null,
      createdAt: session.createdAt,
      durationMinutes: session.theme.durationMinutes ?? 30,
      isViewerSender: session.senderId === viewerId,
    };
  }

  private statusLabel(status: SessionStatus, isViewerSender: boolean): string {
    switch (status) {
      case 'pendingResponse':
        return isViewerSender ? '待对方回应' : '待您回应';
      case 'needsNewTime':
        return '待重选时间';
      case 'acceptedPendingPayment':
        return isViewerSender ? '对方已接受 · 待您付款' : '您已接受 · 待对方付款';
      case 'swapScheduled':
        return '已排期';
      case 'booked':
        return '即将开始';
      case 'completed':
        return '已完成';
      case 'declined':
        return '已婉拒';
      case 'expired':
        return '已过期';
      case 'inAfterSale':
        return '售后中';
      case 'refunding':
        return '退款中';
      case 'cancelled':
        return '已取消';
    }
  }

  private meetingId(link: string | null): string | null {
    if (!link) return null;
    return link.split('/').filter(Boolean).pop() ?? null;
  }
}
