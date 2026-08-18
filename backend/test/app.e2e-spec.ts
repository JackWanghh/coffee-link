import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';

describe('CoffeeLink Backend (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phoneA = '13800000001';
  const phoneB = '13800000002';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = app.get(PrismaService);
    await app.get(RedisService).client.flushall();

    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.complaint.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.settlement.deleteMany();
    await prisma.session.deleteMany();
    await prisma.slot.deleteMany();
    await prisma.theme.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.smsCode.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(phone: string) {
    const sms = await request(app.getHttpServer())
      .post('/auth/sms/send')
      .send({ phone, purpose: 'register' })
      .expect(201);
    const code = sms.body.data.devCode as string;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ phone, code, password: 'Pass123456', agreed: true })
      .expect(201);
    return res.body.data as { accessToken: string; refreshToken: string };
  }

  function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  it('核心流程：注册 → 分享设置 → 发现 → 邀请 → 接受 → 付款 → 已预约', async () => {
    const userA = await register(phoneA);
    const userB = await register(phoneB);

    await request(app.getHttpServer())
      .put('/me/profile')
      .set(auth(userA.accessToken))
      .send({ name: '张分享', title: 'AI 产品负责人', company: '示例科技' })
      .expect(200);

    // 实名认证 Mock 通过态
    const a = await prisma.user.findUniqueOrThrow({ where: { phone: phoneA } });
    await prisma.user.update({ where: { id: a.id }, data: { isVerified: true } });

    const categories = await request(app.getHttpServer()).get('/categories').expect(200);
    const categoryId = categories.body.data[0].id as string;
    const drinks = await request(app.getHttpServer()).get('/coffee-drinks').expect(200);
    const drinkId = drinks.body.data[0].id as string;

    await request(app.getHttpServer())
      .put('/me/signature-drink')
      .set(auth(userA.accessToken))
      .send({ drinkId })
      .expect(200);
    await request(app.getHttpServer())
      .put('/me/themes')
      .set(auth(userA.accessToken))
      .send({
        themes: [
          {
            title: '大模型产品化实践',
            description: '从需求验证到落地的完整复盘',
            categoryId,
            includes: ['转岗', '模型选型'],
            excludes: ['代码细节'],
          },
        ],
      })
      .expect(200);
    const future = new Date(Date.now() + 3 * 86400_000);
    future.setMinutes(0, 0, 0);
    await request(app.getHttpServer())
      .put('/me/slots')
      .set(auth(userA.accessToken))
      .send({
        slots: [
          {
            slotAt: future.toISOString(),
            label: `3天后 ${future.getHours()}:00-${future.getHours() + 1}:00`,
          },
        ],
      })
      .expect(200);
    await request(app.getHttpServer())
      .put('/me/meeting-link')
      .set(auth(userA.accessToken))
      .send({ meetingLink: 'https://meeting.tencent.com/dm/AbCdEf123' })
      .expect(200);
    await request(app.getHttpServer())
      .put('/me/topic-swap-settings')
      .set(auth(userA.accessToken))
      .send({ accepts: true, weeklyLimit: 3 })
      .expect(200);
    await request(app.getHttpServer())
      .put('/me/sharing')
      .set(auth(userA.accessToken))
      .send({ open: true })
      .expect(200);

    const sharers = await request(app.getHttpServer())
      .get('/sharers')
      .set(auth(userB.accessToken))
      .expect(200);
    const sharer = sharers.body.data.items.find((s: { id: string }) => s.id === a.id);
    expect(sharer).toBeDefined();
    expect(sharer.meetingLink).toBeNull();
    expect(sharer.themes.length).toBe(1);

    const slot = (
      await request(app.getHttpServer())
        .get('/me/slots')
        .set(auth(userA.accessToken))
        .expect(200)
    ).body.data[0];

    const invitation = await request(app.getHttpServer())
      .post('/invitations/coffee')
      .set(auth(userB.accessToken))
      .send({
        sharerId: a.id,
        themeId: sharer.themes[0].id,
        question: '想了解你从传统产品转型 AI 产品的完整经历与关键决策',
        slotIds: [slot.id],
      })
      .expect(201);
    const sessionId = invitation.body.data.id as string;
    expect(invitation.body.data.status).toBe('pendingResponse');

    const accepted = await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/accept`)
      .set(auth(userA.accessToken))
      .send({ confirmedSlotId: slot.id })
      .expect(201);
    expect(accepted.body.data.status).toBe('acceptedPendingPayment');
    expect(accepted.body.data.paymentDeadlineAt).toBeDefined();

    const pay = await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/payments`)
      .set(auth(userB.accessToken))
      .send({ method: 'wechat', idempotencyKey: `test-key-${sessionId}` })
      .expect(201);
    expect(pay.body.data.payment.status).toBe('pending');

    await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/payments/callback`)
      .send({ providerTradeNo: 'MOCK-001', status: 'success', signature: 'mock' })
      .expect(201);
    // 重复回调幂等
    await request(app.getHttpServer())
      .post(`/sessions/${sessionId}/payments/callback`)
      .send({ providerTradeNo: 'MOCK-001', status: 'success', signature: 'mock' })
      .expect(201);

    const detail = await request(app.getHttpServer())
      .get(`/sessions/${sessionId}`)
      .set(auth(userB.accessToken))
      .expect(200);
    expect(detail.body.data.status).toBe('booked');
    expect(detail.body.data.meetingLink).toBe('https://meeting.tencent.com/dm/AbCdEf123');
    expect(detail.body.data.priceCents).toBeGreaterThan(0);

    const list = await request(app.getHttpServer())
      .get('/sessions?direction=sent&filter=scheduled')
      .set(auth(userB.accessToken))
      .expect(200);
    expect(list.body.data.items.some((s: { id: string }) => s.id === sessionId)).toBe(true);
  });

  it('主题互换：配额校验与排期', async () => {
    const phoneC = '13800000003';
    const phoneD = '13800000004';
    const userA = await register(phoneC);
    const userB = await register(phoneD);
    const a = await prisma.user.findUniqueOrThrow({ where: { phone: phoneC } });
    const b = await prisma.user.findUniqueOrThrow({ where: { phone: phoneD } });
    await prisma.user.update({ where: { id: a.id }, data: { isVerified: true } });

    const category = await prisma.category.findFirstOrThrow();
    const drink = await prisma.coffeeDrink.findFirstOrThrow();
    for (const u of [a, b]) {
      const token = u.id === a.id ? userA.accessToken : userB.accessToken;
      await prisma.user.update({
        where: { id: u.id },
        data: { isVerified: true, acceptsTopicSwap: true },
      });
      await request(app.getHttpServer())
        .put('/me/profile')
        .set(auth(token))
        .send({ name: u.id === a.id ? '甲分享' : '乙分享', title: '产品', company: '示例' })
        .expect(200);
      await request(app.getHttpServer())
        .put('/me/signature-drink')
        .set(auth(token))
        .send({ drinkId: drink.id })
        .expect(200);
      await request(app.getHttpServer())
        .put('/me/themes')
        .set(auth(token))
        .send({
          themes: [
            { title: `主题-${u.id.slice(0, 4)}`, description: '主题描述内容', categoryId: category.id },
          ],
        })
        .expect(200);
      const futureA = new Date(Date.now() + 5 * 86400_000);
      futureA.setMinutes(30, 0, 0);
      const futureB = new Date(Date.now() + 6 * 86400_000);
      futureB.setMinutes(0, 0, 0);
      await request(app.getHttpServer())
        .put('/me/slots')
        .set(auth(token))
        .send({
          slots: [
            { slotAt: futureA.toISOString(), label: `5天后时段-${u.id.slice(0, 4)}` },
            { slotAt: futureB.toISOString(), label: `6天后时段-${u.id.slice(0, 4)}` },
          ],
        })
        .expect(200);
      await request(app.getHttpServer())
        .put('/me/meeting-link')
        .set(auth(token))
        .send({ meetingLink: `https://meeting.tencent.com/dm/${u.id.slice(0, 8)}` })
        .expect(200);
      await request(app.getHttpServer())
        .put('/me/sharing')
        .set(auth(token))
        .send({ open: true })
        .expect(200);
    }

    const aThemes = await prisma.theme.findMany({ where: { userId: a.id, active: true } });
    const bThemes = await prisma.theme.findMany({ where: { userId: b.id, active: true } });
    const aSlots = await prisma.slot.findMany({ where: { userId: a.id, isAvailable: true } });
    const aSlot = aSlots[0];
    const spareSlot = aSlots[1];

    const swap = await request(app.getHttpServer())
      .post('/invitations/topic-swaps')
      .set(auth(userB.accessToken))
      .send({
        sharerId: a.id,
        requestedThemeId: aThemes[0].id,
        offeredThemeId: bThemes[0].id,
        question: '想了解你的产品方法论与可迁移的经验',
        offering: '我可以分享增长实验与数据驱动的经验',
        slotIds: [aSlot.id],
      })
      .expect(201);
    expect(swap.body.data.status).toBe('pendingResponse');

    const accepted = await request(app.getHttpServer())
      .post(`/sessions/${swap.body.data.id}/accept`)
      .set(auth(userA.accessToken))
      .send({ confirmedSlotId: aSlot.id, receiverQuestion: '想听听你最近一次失败案例的复盘' })
      .expect(201);
    expect(accepted.body.data.status).toBe('swapScheduled');

    for (let i = 0; i < 4; i += 1) {
      const again = await request(app.getHttpServer())
        .post('/invitations/topic-swaps')
        .set(auth(userB.accessToken))
        .send({
          sharerId: a.id,
          requestedThemeId: aThemes[0].id,
          offeredThemeId: bThemes[0].id,
          question: `第 ${i} 次尝试了解你的经验`,
          offering: '我可以分享相关经验与案例',
          slotIds: [spareSlot.id],
        });
      if (i >= 2) {
        expect(again.status).toBe(429);
        expect(again.body.error.code).toBe('QUOTA_EXCEEDED');
      }
    }
  });
});
