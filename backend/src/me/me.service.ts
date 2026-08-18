import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError, notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import {
  SetSignatureDrinkDto,
  SlotItemDto,
  UpdateMeetingLinkDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  UpdateSharingDto,
  UpdateSlotsDto,
  UpdateThemesDto,
  UpdateTopicSwapSettingsDto,
} from './dto/me.dto';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.requireUser(userId);
    const stats = await this.stats(userId);
    return { data: { ...user, ...stats } };
  }

  async verifyIdentity(userId: string) {
    // 实名认证 Mock 接口：标记实名通过；真实实名（运营商/证件核验）后续接入
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return { data: user };
  }

  async updateThemes(userId: string, dto: UpdateThemesDto) {
    if (dto.themes.length > 3) {
      throw new AppError(400, 'VALIDATION_ERROR', '最多可上架 3 个分享主题');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.theme.updateMany({
        where: { userId, active: true },
        data: { active: false },
      });
      for (const item of dto.themes) {
        const category = await tx.category.findUnique({ where: { id: item.categoryId } });
        if (!category) throw notFound('经验品类不存在');
        await tx.theme.create({
          data: {
            userId,
            categoryId: item.categoryId,
            title: item.title,
            description: item.description,
            durationMinutes: item.durationMinutes ?? 30,
            includes: item.includes ?? [],
            excludes: item.excludes ?? [],
          },
        });
      }
      return this.requireUser(userId, tx);
    });
  }

  async setSignatureDrink(userId: string, dto: SetSignatureDrinkDto) {
    const drink = await this.prisma.coffeeDrink.findUnique({
      where: { id: dto.drinkId },
    });
    if (!drink || !drink.active) throw notFound('未找到签名饮品');
    return this.prisma.user.update({
      where: { id: userId },
      data: { signatureDrinkId: drink.id },
    });
  }

  async updateTopicSwapSettings(userId: string, dto: UpdateTopicSwapSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { acceptsTopicSwap: dto.accepts, weeklySwapLimit: dto.weeklyLimit },
    });
  }

  async updateSlots(userId: string, dto: UpdateSlotsDto) {
    const user = await this.requireUser(userId);
    const parsed = dto.slots.map((s) => this.parseSlot(s, user.phone));
    const now = Date.now();
    for (const slot of parsed) {
      if (slot.slotAt.getTime() < now) {
        throw new AppError(400, 'VALIDATION_ERROR', '时段不能早于当前时间');
      }
      if (slot.slotAt.getTime() > now + 30 * 86400_000) {
        throw new AppError(400, 'VALIDATION_ERROR', '时段仅支持未来 30 天');
      }
    }
    if (user.isSharingOpen && !parsed.some((s) => s.isAvailable)) {
      throw new AppError(400, 'VALIDATION_ERROR', '开放分享期间请至少保留一个可预约时段');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.slot.deleteMany({ where: { userId } });
      await tx.slot.createMany({
        data: parsed.map((s) => ({
          userId,
          slotAt: s.slotAt,
          label: s.label,
          isAvailable: s.isAvailable,
        })),
      });
      return tx.slot.findMany({ where: { userId }, orderBy: { slotAt: 'asc' } });
    });
  }

  async updateMeetingLink(userId: string, dto: UpdateMeetingLinkDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { meetingLink: dto.meetingLink },
    });
  }

  async updateSharing(userId: string, dto: UpdateSharingDto) {
    const user = await this.requireUser(userId, undefined, {
      themes: { where: { active: true } },
      slots: { where: { isAvailable: true } },
    });
    if (dto.open) {
      const readiness = this.readiness(user);
      if (!readiness.ready) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          `请先完成：${readiness.missing.join('、')}`,
        );
      }
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSharingOpen: dto.open },
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async sharingCenter(userId: string) {
    const user = await this.requireUser(userId, undefined, {
      themes: { where: { active: true }, include: { category: true } },
      slots: { orderBy: { slotAt: 'asc' } },
    });
    const stats = await this.stats(userId);
    return {
      data: {
        user,
        readiness: this.readiness(user),
        income: {
          pendingCents: stats.pendingEarningsCents,
          settledCents: stats.settledEarningsCents,
          totalCents: stats.totalEarningsCents,
        },
      },
    };
  }

  async getSlots(userId: string) {
    const slots = await this.prisma.slot.findMany({
      where: { userId },
      orderBy: { slotAt: 'asc' },
    });
    return { data: slots };
  }

  private parseSlot(input: SlotItemDto, phone: string) {
    const slotAt = new Date(input.slotAt);
    if (Number.isNaN(slotAt.getTime())) {
      throw new AppError(400, 'VALIDATION_ERROR', '时段时间格式不正确');
    }
    const label = input.label.trim();
    if (!label) throw new AppError(400, 'VALIDATION_ERROR', '时段名称不能为空');
    return { slotAt, label, isAvailable: input.isAvailable ?? true };
  }

  private readiness(user: {
    isVerified: boolean;
    name: string;
    title: string;
    company: string;
    signatureDrinkId: string | null;
    meetingLink: string | null;
    themes?: unknown[];
    slots?: { isAvailable: boolean }[];
  }): { ready: boolean; missing: string[] } {
    const missing: string[] = [];
    if (!user.isVerified) missing.push('实名认证');
    if (
      !user.name.trim() ||
      !user.title.trim() ||
      !user.company.trim()
    ) {
      missing.push('公开资料');
    }
    if (!user.themes || user.themes.length === 0) missing.push('分享主题');
    if (!user.signatureDrinkId) missing.push('签名饮品');
    if (!user.slots || !user.slots.some((s) => s.isAvailable)) missing.push('可约时段');
    if (
      !user.meetingLink ||
      !/^https:\/\/meeting\.tencent\.com\/.+/.test(user.meetingLink)
    ) {
      missing.push('腾讯会议链接');
    }
    return { ready: missing.length === 0, missing };
  }

  private async requireUser(
    userId: string,
    tx?: Prisma.TransactionClient,
    include?: Prisma.UserInclude,
  ) {
    const client = tx ?? this.prisma;
    const user = await client.user.findUnique({ where: { id: userId }, include });
    if (!user) throw notFound('用户不存在');
    return user;
  }

  private async stats(userId: string) {
    const [completedCoffee, completedSwap, reviews, received, settlementAgg, earnings] =
      await Promise.all([
        this.prisma.session.count({
          where: { receiverId: userId, type: 'coffee', status: 'completed' },
        }),
        this.prisma.session.count({
          where: { receiverId: userId, type: 'topicSwap', status: 'completed' },
        }),
        this.prisma.review.findMany({
          where: { revieweeId: userId, isSwapReview: false },
          select: { rating: true },
        }),
        this.prisma.session.count({
          where: { receiverId: userId, status: { not: 'pendingResponse' } },
        }),
        this.prisma.settlement.aggregate({
          where: { userId },
          _sum: { sharerCents: true },
        }),
        this.prisma.session.findMany({
          where: {
            receiverId: userId,
            type: 'coffee',
            status: 'completed',
            priceCents: { not: null },
          },
          select: { priceCents: true },
        }),
      ]);

    const completedEarnings = earnings.reduce(
      (sum, s) => sum + Math.round(((s.priceCents ?? 0) * 85) / 100),
      0,
    );
    const settled = settlementAgg._sum.sharerCents ?? 0;
    const rating =
      reviews.length === 0
        ? 0
        : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const totalChats = await this.prisma.session.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: { in: ['booked', 'swapScheduled', 'completed'] },
      },
    });
    return {
      totalChats,
      rating: Number(rating.toFixed(1)),
      replyRate: received === 0 ? '100%' : `${Math.round((received / Math.max(1, received)) * 100)}%`,
      onTimeRate: '100%',
      completedSessionsCount: completedCoffee,
      completedSwapsCount: completedSwap,
      totalEarningsCents: completedEarnings,
      pendingEarningsCents: Math.max(completedEarnings - settled, 0),
      settledEarningsCents: settled,
    };
  }
}
