import { createHash, randomInt } from 'crypto';
import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CODE_TTL_SECONDS = 5 * 60;
const RESEND_TTL_SECONDS = 60;
const MAX_ATTEMPTS = 5;

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async send(phone: string, purpose: 'register' | 'reset'): Promise<string | undefined> {
    const rateKey = `sms:rate:${phone}`;
    const sent = await this.redis.setIfAbsent(rateKey, '1', RESEND_TTL_SECONDS);
    if (!sent) {
      throw new AppError(429, 'AUTH_RATE_LIMITED', '请 60 秒后重新获取验证码');
    }

    const dailyKey = `sms:daily:${phone}:${new Date().toISOString().slice(0, 10)}`;
    const daily = Number((await this.redis.get(dailyKey)) ?? '0');
    if (daily >= 10) {
      throw new AppError(429, 'AUTH_RATE_LIMITED', '今日验证码发送次数已达上限');
    }
    await this.redis.client.incr(dailyKey);
    await this.redis.client.expire(dailyKey, 86400);

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000);
    await this.prisma.smsCode.create({
      data: {
        phone,
        purpose,
        codeHash: createHash('sha256').update(code).digest('hex'),
        expiresAt,
      },
    });

    const provider = process.env.SMS_PROVIDER ?? 'mock';
    if (provider === 'mock') {
      // Mock Provider：直接返回验证码供本地/联调使用，真实 Provider 接入后移除
      return code;
    }
    return undefined;
  }

  async verify(phone: string, purpose: string, code: string): Promise<void> {
    const record = await this.prisma.smsCode.findFirst({
      where: { phone, purpose },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) {
      throw new AppError(400, 'AUTH_CODE_MISMATCH', '验证码不正确');
    }
    if (record.expiresAt < new Date()) {
      throw new AppError(400, 'AUTH_CODE_EXPIRED', '验证码已过期，请重新获取');
    }
    const expected = createHash('sha256').update(code).digest('hex');
    if (expected !== record.codeHash) {
      await this.prisma.smsCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      if (record.attempts + 1 >= MAX_ATTEMPTS) {
        throw new AppError(429, 'AUTH_CODE_ATTEMPT_LIMIT', '验证码错误次数过多，请重新获取');
      }
      throw new AppError(400, 'AUTH_CODE_MISMATCH', '验证码不正确');
    }
  }
}
