import { Injectable } from '@nestjs/common';
import { notFound, stateInvalid } from '../common/errors';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async submitReview(
    sessionId: string,
    reviewerId: string,
    dto: { rating: number; comment: string; tag?: string },
  ) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || (session.senderId !== reviewerId && session.receiverId !== reviewerId)) {
      throw notFound('对谈不存在');
    }
    if (session.status !== 'completed') {
      throw stateInvalid('对谈完成后才能评价');
    }
    const revieweeId = session.senderId === reviewerId ? session.receiverId : session.senderId;
    const isSwapReview = session.type === 'topicSwap';
    const existing = await this.prisma.review.findUnique({
      where: { sessionId_reviewerId: { sessionId, reviewerId } },
    });
    if (existing) throw stateInvalid('你已评价过本次对谈');

    const visibleAt = new Date((session.endsAt ?? new Date()).getTime() + 24 * 3600_000);
    const review = await this.prisma.review.create({
      data: {
        sessionId,
        reviewerId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment,
        tag: dto.tag,
        isSwapReview,
        isBlindVisible: !isSwapReview,
        visibleAt: isSwapReview ? visibleAt : null,
      },
    });

    if (isSwapReview) {
      const counterpart = await this.prisma.review.findUnique({
        where: { sessionId_reviewerId: { sessionId, reviewerId: revieweeId } },
      });
      if (counterpart) {
        await this.prisma.review.updateMany({
          where: { sessionId },
          data: { isBlindVisible: true },
        });
      }
      await this.notifications.notify(
        revieweeId,
        'swap_feedback',
        '收到新的互换反馈',
        '对方已提交本次主题互换反馈',
        sessionId,
      );
    }
    return review;
  }

  async submitComplaint(
    sessionId: string,
    reporterId: string,
    dto: { category: string; description: string },
  ) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || (session.senderId !== reporterId && session.receiverId !== reporterId)) {
      throw notFound('对谈不存在');
    }
    if (session.status !== 'completed') {
      throw stateInvalid('仅完成后 24 小时内可投诉');
    }
    const windowEnd = new Date((session.endsAt ?? new Date()).getTime() + 24 * 3600_000);
    if (windowEnd < new Date()) {
      throw stateInvalid('售后窗口已关闭');
    }
    const complaint = await this.prisma.complaint.create({
      data: {
        sessionId,
        reporterId,
        category: dto.category,
        description: dto.description,
      },
    });
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'inAfterSale' },
    });
    return complaint;
  }

  async resolveComplaint(
    complaintId: string,
    dto: { approved: 'true' | 'false'; note?: string },
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) throw notFound('投诉不存在');
    const approved = dto.approved === 'true';
    return this.prisma.$transaction(async (tx) => {
      await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: approved ? 'refunded' : 'resolved',
          adminNote: dto.note,
        },
      });
      const session = await tx.session.findUnique({ where: { id: complaint.sessionId } });
      if (approved && session) {
        if (session.confirmedSlotId) {
          await tx.slot.updateMany({
            where: { id: session.confirmedSlotId, isAvailable: false },
            data: { isAvailable: true },
          });
        }
        await tx.payment.updateMany({
          where: { sessionId: session.id, status: 'success' },
          data: { status: 'refunded' },
        });
        await tx.session.update({
          where: { id: session.id },
          data: { status: 'refunding' },
        });
        await this.notifications.notify(
          session.senderId,
          'cancel_refund',
          '投诉已受理',
          '运营已批准全额退款，退款将原路返回',
          session.id,
        );
      } else if (session) {
        await tx.session.update({
          where: { id: session.id },
          data: { status: 'completed' },
        });
      }
      return { ok: true };
    });
  }

  async revealBlindReviews() {
    await this.prisma.review.updateMany({
      where: {
        isSwapReview: true,
        isBlindVisible: false,
        visibleAt: { lt: new Date() },
      },
      data: { isBlindVisible: true },
    });
  }
}
