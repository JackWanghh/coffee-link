import { createHash, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AppError, ErrorCode, unauthorized } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly sms: SmsService,
  ) {}

  async sendSms(phone: string, purpose: 'register' | 'reset') {
    return this.sms.send(phone, purpose);
  }

  async register(phone: string, code: string, password: string, agreed: boolean) {
    if (!agreed) {
      throw new AppError(400, 'VALIDATION_ERROR', '请先同意用户协议与隐私政策');
    }
    await this.sms.verify(phone, 'register', code);
    const exists = await this.prisma.user.findUnique({ where: { phone } });
    if (exists) {
      throw new AppError(409, 'AUTH_PHONE_TAKEN', '该手机号已注册');
    }
    const user = await this.prisma.user.create({
      data: {
        phone,
        passwordHash: await argon2.hash(password),
      },
    });
    return this.issueTokens(user.id, user.phone);
  }

  async login(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    const fail = () =>
      new AppError(401, 'AUTH_INVALID_CREDENTIALS', '手机号或密码不正确');
    if (!user) throw fail();
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw fail();
    return this.issueTokens(user.id, user.phone);
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    await this.sms.verify(phone, 'reset', code);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', '该手机号未注册');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await argon2.hash(newPassword) },
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; phone: string; type: string };
    try {
      payload = this.jwt.verify<{ sub: string; phone: string; type: string }>(
        rawRefreshToken,
        { secret: process.env.JWT_SECRET },
      );
    } catch {
      throw new AppError(401, 'AUTH_TOKEN_EXPIRED', '登录已过期，请重新登录');
    }
    if (payload.type !== 'refresh') {
      throw new AppError(401, 'AUTH_TOKEN_EXPIRED', '登录已过期，请重新登录');
    }
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new AppError(401, 'AUTH_TOKEN_EXPIRED', '登录已过期，请重新登录');
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) throw unauthorized();
    return this.issueTokens(user.id, user.phone);
  }

  async logout(rawRefreshToken: string): Promise<{ ok: boolean }> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  private async issueTokens(userId: string, phone: string): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, phone, type: 'access' },
      { secret: process.env.JWT_SECRET, expiresIn: this.ttlSeconds(process.env.JWT_ACCESS_TTL ?? '2h') },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, phone, type: 'refresh' },
      { secret: process.env.JWT_SECRET, expiresIn: this.ttlSeconds(process.env.JWT_REFRESH_TTL ?? '14d') },
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + this.ttlSeconds(process.env.JWT_REFRESH_TTL ?? '14d') * 1000),
      },
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: this.ttlSeconds(process.env.JWT_ACCESS_TTL ?? '2h'),
    };
  }

  private ttlSeconds(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) return 7200;
    const n = Number(match[1]);
    const unit = match[2];
    return n * (unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400);
  }
}
