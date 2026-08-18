import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate } from '../common/dto/pagination.dto';
import { notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

const SHARER_INCLUDE = {
  signatureDrink: true,
  themes: {
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  },
  slots: {
    where: { isAvailable: true, slotAt: { gte: new Date() } },
    orderBy: { slotAt: 'asc' },
    take: 30,
  },
  reviewsReceived: {
    where: { isBlindVisible: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { reviewer: true },
  },
} satisfies Prisma.UserInclude;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  drinks() {
    return this.prisma.coffeeDrink.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
    });
  }

  async sharers(query: {
    categoryId?: string;
    industry?: string;
    q?: string;
    afterId?: string;
    limit?: number;
  }) {
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {
      isSharingOpen: true,
      deletedAt: null,
    };
    if (query.categoryId) {
      where.themes = { some: { active: true, categoryId: query.categoryId } };
    }
    if (query.industry) {
      where.industry = query.industry;
    }
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        {
          themes: {
            some: {
              active: true,
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const all = await this.prisma.user.findMany({
      where,
      include: SHARER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
    const page = paginate(all, limit, query.afterId);
    const items = await Promise.all(page.items.map((u) => this.presentSharer(u)));
    return { data: { items, nextCursor: page.nextCursor } };
  }

  async sharerDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ...SHARER_INCLUDE,
        reviewsReceived: {
          where: { isBlindVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { reviewer: true },
        },
      },
    });
    if (!user || !user.isSharingOpen) throw notFound('分享者不存在或未开放分享');
    return { data: await this.presentSharer(user) };
  }

  private async presentSharer(user: Prisma.UserGetPayload<{ include: typeof SHARER_INCLUDE }>) {
    const [reviews, swapFeedback, complaints, responseTimes] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: user.id, isSwapReview: false, isBlindVisible: true },
        select: { rating: true },
      }),
      this.prisma.review.count({
        where: { revieweeId: user.id, isSwapReview: true, isBlindVisible: true },
      }),
      this.prisma.complaint.count({
        where: { reporterId: user.id },
      }),
      this.prisma.session.findMany({
        where: {
          receiverId: user.id,
          status: { notIn: ['pendingResponse', 'needsNewTime', 'declined', 'expired'] },
        },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

    const completed = responseTimes.length;
    const onTimeRate =
      completed === 0 ? '100%' : `${Math.max(0, Math.round(((completed - complaints) / completed) * 100))}%`;
    const medians = responseTimes
      .map((s) => s.updatedAt.getTime() - s.createdAt.getTime())
      .sort((a, b) => a - b);
    const responseMedianTime =
      medians.length === 0
        ? null
        : this.formatMedian(medians[Math.floor(medians.length / 2)]);

    return {
      id: user.id,
      name: user.name,
      title: user.title,
      company: user.company,
      avatarUrl: user.avatarUrl,
      industry: user.industry ?? null,
      isVerified: user.isVerified,
      declarationNote: user.declarationNote,
      highlights: user.highlights,
      signatureDrink: user.signatureDrink,
      acceptsTopicSwap: user.acceptsTopicSwap,
      weeklySwapLimit: user.weeklySwapLimit,
      remainingSwapQuota: await this.remainingSwapQuota(user.id, user.weeklySwapLimit),
      themes: user.themes,
      nextAvailableText:
        user.slots.length > 0 ? `最早可约：${user.slots[0].label}` : '暂无可约时间',
      slots: user.slots,
      availableDays: this.groupAvailableDays(user.slots),
      meetingLink: null,
      rating:
        reviews.length === 0
          ? 0
          : Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)),
      reviewCount: reviews.length,
      swapFeedbackCount: swapFeedback,
      onTimeRate,
      responseMedianTime,
      reviews: user.reviewsReceived.map((r) => ({
        id: r.id,
        authorName: r.reviewer.name,
        authorInitials: this.initials(r.reviewer.name),
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt.toISOString(),
        isSwapReview: r.isSwapReview,
      })),
    };
  }

  private async remainingSwapQuota(userId: string, weeklySwapLimit: number) {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - day + 1);
    const initiated = await this.prisma.session.count({
      where: {
        senderId: userId,
        type: 'topicSwap',
        createdAt: { gte: weekStart },
        status: { notIn: ['declined', 'cancelled', 'expired'] },
      },
    });
    return Math.max(weeklySwapLimit - initiated, 0);
  }

  private groupAvailableDays(
    slots: { id: string; label: string; isAvailable: boolean; slotAt: Date }[],
  ) {
    const groups = new Map<string, { date: string; dayOfWeek: string; slots: { id: string; label: string; isAvailable: boolean }[] }>();
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const demoWeekdayByDate: Record<string, string> = {
      '10月24日': '周四',
      '10月25日': '周五',
      '10月26日': '周六',
      '10月27日': '周日',
    };
    for (const slot of slots) {
      const match = /^(\d+月\d+日)/.exec(slot.label);
      const key = match?.[1] ?? slot.label;
      const dayOfWeek = demoWeekdayByDate[key] ?? weekday[slot.slotAt.getDay()];
      const group = groups.get(key) ?? { date: key, dayOfWeek, slots: [] };
      group.slots.push({ id: slot.id, label: slot.label, isAvailable: slot.isAvailable });
      groups.set(key, group);
    }
    return [...groups.values()].map((g) => ({
      date: g.date,
      dayOfWeek: g.dayOfWeek,
      slotsCount: g.slots.length,
      isFull: g.slots.every((s) => !s.isAvailable),
      slots: g.slots,
    }));
  }

  private initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return words
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  private formatMedian(ms: number): string {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes}分钟`;
    if (minutes < 1440) return `${(minutes / 60).toFixed(1)}小时`;
    return `${(minutes / 1440).toFixed(1)}天`;
  }
}
