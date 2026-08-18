import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklySettlement() {
    const periodStart = this.startOfWeek(new Date());
    const periodEnd = new Date();
    const completed = await this.prisma.session.findMany({
      where: {
        type: 'coffee',
        status: 'completed',
        endsAt: { gte: periodStart, lt: periodEnd },
        priceCents: { not: null },
      },
      select: {
        id: true,
        receiverId: true,
        priceCents: true,
        complaints: { where: { status: { in: ['open', 'refunded'] } } },
      },
    });
    const byReceiver = new Map<string, number>();
    for (const session of completed) {
      if (session.complaints.length > 0) continue;
      byReceiver.set(
        session.receiverId,
        (byReceiver.get(session.receiverId) ?? 0) + (session.priceCents ?? 0),
      );
    }
    let settled = 0;
    for (const [userId, total] of byReceiver) {
      const platformCents = Math.round((total * 15) / 100);
      const sharerCents = Math.round((total * 85) / 100);
      await this.prisma.settlement.upsert({
        where: { userId_periodStart: { userId, periodStart } },
        update: {},
        create: {
          userId,
          periodStart,
          periodEnd,
          platformCents,
          sharerCents,
          status: 'pending',
        },
      });
      await this.notifications.notify(
        userId,
        'settlement_done',
        '本周结算已生成',
        `本周可结算电子咖啡收入 ¥${(sharerCents / 100).toFixed(2)}`,
      );
      settled += 1;
    }
    return { settled };
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d;
  }
}
