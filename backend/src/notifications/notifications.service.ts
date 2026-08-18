import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationType =
  | 'new_invitation'
  | 'invitation_expiring'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'needs_new_time'
  | 'payment_deadline'
  | 'payment_success'
  | 'session_soon'
  | 'cancel_refund'
  | 'swap_feedback'
  | 'settlement_done';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notify(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    sessionId?: string,
  ) {
    await this.prisma.notification.create({
      data: { userId, type, title, body, sessionId },
    });
    // Push Provider（Mock）：真实 iOS 推送接入后替换，这里仅落库
    await this.prisma.notification.updateMany({
      where: { userId, type, pushSentAt: null },
      data: { pushSentAt: new Date() },
    });
  }

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
