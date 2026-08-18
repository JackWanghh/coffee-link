import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('postgres', this.prisma),
      async () => {
        await this.redis.client.ping();
        return { redis: { status: 'up' } };
      },
    ]);
  }

  @Get('metrics')
  async metrics(@Res() res: Response) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
