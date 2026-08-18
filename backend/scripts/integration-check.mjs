import { writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const prisma = new PrismaClient();
const log = [];
let passed = 0;
let failed = 0;

function record(step, ok, detail = '') {
  const line = `[${ok ? 'PASS' : 'FAIL'}] ${step}${detail ? ` :: ${detail}` : ''}`;
  log.push(line);
  console.log(line);
  if (ok) passed += 1;
  else failed += 1;
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

async function register(phone) {
  const sms = await req('POST', '/auth/sms/send', { phone, purpose: 'register' });
  if (sms.status !== 201) throw new Error(`sms send failed: ${sms.status}`);
  const code = sms.json?.data?.devCode;
  const res = await req('POST', '/auth/register', {
    phone,
    code,
    password: 'Pass123456',
    agreed: true,
  });
  if (res.status !== 201) throw new Error(`register failed: ${res.status}`);
  return res.json.data;
}

async function setupSharer(token, userId, name) {
  await req('PUT', '/me/profile', { name, title: 'AI 产品负责人', company: '示例科技' }, token);
  const drinks = await req('GET', '/coffee-drinks');
  const drinkId = drinks.json.data[0].id;
  await req('PUT', '/me/signature-drink', { drinkId }, token);
  const categories = await req('GET', '/categories');
  const categoryId = categories.json.data[0].id;
  await req(
    'PUT',
    '/me/themes',
    {
      themes: [
        {
          title: '大模型产品化实践',
          description: '从需求验证到落地的完整复盘',
          categoryId,
          includes: ['转岗', '模型选型'],
          excludes: ['代码细节'],
        },
      ],
    },
    token,
  );
  const base = Date.now() + 3 * 86400_000;
  const slotA = new Date(base);
  slotA.setMinutes(0, 0, 0);
  const slotB = new Date(base + 86400_000);
  slotB.setMinutes(30, 0, 0);
  await req(
    'PUT',
    '/me/slots',
    {
      slots: [
        { slotAt: slotA.toISOString(), label: `联调时段A ${slotA.toISOString()}` },
        { slotAt: slotB.toISOString(), label: `联调时段B ${slotB.toISOString()}` },
      ],
    },
    token,
  );
  await req('PUT', '/me/meeting-link', { meetingLink: 'https://meeting.tencent.com/dm/ITG12345' }, token);
  await req('PUT', '/me/topic-swap-settings', { accepts: true, weeklyLimit: 3 }, token);
  await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
  const sharing = await req('PUT', '/me/sharing', { open: true }, token);
  return { sharing };
}

async function main() {
  const suffix = String(Date.now()).slice(-8);
  const phoneA = `138${suffix}`;
  const phoneB = `139${suffix}`;

  const health = await req('GET', '/health');
  record('GET /health', health.status === 200 && health.json?.status === 'ok');

  const docs = await req('GET', '/docs-json');
  const pathCount = docs.json ? Object.keys(docs.json.paths ?? {}).length : 0;
  record('GET /docs-json OpenAPI 契约', docs.status === 200 && pathCount > 0, `paths=${pathCount}`);

  const userA = await register(phoneA);
  const userB = await register(phoneB);
  record('POST /auth/register x2', Boolean(userA.accessToken && userB.accessToken));
  const a = await prisma.user.findUniqueOrThrow({ where: { phone: phoneA } });
  const b = await prisma.user.findUniqueOrThrow({ where: { phone: phoneB } });

  const setup = await setupSharer(userA.accessToken, a.id, '张分享');
  record('A 分享设置与开放分享', setup.sharing.status === 200);

  const sharers = await req('GET', '/sharers', undefined, userB.accessToken);
  const sharer = sharers.json?.data?.items?.find((s) => s.id === a.id);
  record('GET /sharers 发现列表含 A', Boolean(sharer), `count=${sharers.json?.data?.items?.length ?? 0}`);
  const sharerDetail = await req('GET', `/sharers/${a.id}`, undefined, userB.accessToken);
  record('GET /sharers/:id 不暴露会议链接', sharerDetail.json?.data?.meetingLink === null);
  record('GET /sharers/:id 主题与时段完整', sharerDetail.json?.data?.themes?.length === 1 && sharerDetail.json?.data?.slots?.length === 2);

  const theme = sharerDetail.json.data.themes[0];
  const slot = (await req('GET', '/me/slots', undefined, userA.accessToken)).json.data[0];
  const invite = await req(
    'POST',
    '/invitations/coffee',
    {
      sharerId: a.id,
      themeId: theme.id,
      question: '想了解你从传统产品转型 AI 产品的完整经历与关键决策',
      slotIds: [slot.id],
    },
    userB.accessToken,
  );
  const sessionId = invite.json?.data?.id;
  record('POST /invitations/coffee 创建邀请', invite.status === 201 && invite.json?.data?.status === 'pendingResponse');

  const accepted = await req('POST', `/sessions/${sessionId}/accept`, { confirmedSlotId: slot.id }, userA.accessToken);
  record(
    'POST /sessions/:id/accept 接受并锁定时段',
    accepted.status === 201 && accepted.json?.data?.status === 'acceptedPendingPayment',
    `paymentDeadlineAt=${Boolean(accepted.json?.data?.paymentDeadlineAt)}`,
  );

  const pay = await req(
    'POST',
    `/sessions/${sessionId}/payments`,
    { method: 'wechat', idempotencyKey: `itg-${sessionId}` },
    userB.accessToken,
  );
  record('POST /sessions/:id/payments 下单', pay.status === 201 && pay.json?.data?.payment?.status === 'pending');
  const cbBody = { providerTradeNo: `MOCK-${suffix}`, status: 'success', signature: 'mock' };
  const cb = await req('POST', `/sessions/${sessionId}/payments/callback`, cbBody);
  const cb2 = await req('POST', `/sessions/${sessionId}/payments/callback`, cbBody);
  record('支付回调成功且重复回调幂等', cb.status === 201 && cb2.status === 201 && cb2.json?.data?.replay === true);

  const detail = await req('GET', `/sessions/${sessionId}`, undefined, userB.accessToken);
  record(
    'GET /sessions/:id 已预约且会议链接可见',
    detail.json?.data?.status === 'booked' && detail.json?.data?.meetingLink === 'https://meeting.tencent.com/dm/ITG12345',
    `priceCents=${detail.json?.data?.priceCents}`,
  );
  const list = await req('GET', '/sessions?direction=sent&filter=scheduled', undefined, userB.accessToken);
  record('GET /sessions 方向+筛选', list.json?.data?.items?.some((s) => s.id === sessionId));

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'completed', endsAt: new Date(Date.now() - 60000) },
  });
  const review = await req(
    'POST',
    `/sessions/${sessionId}/review`,
    { rating: 5, comment: '分享很实在，收获很大', tag: '话题符合描述' },
    userB.accessToken,
  );
  record('POST /sessions/:id/review 发起人评价', review.status === 201);
  const light = await req(
    'POST',
    `/sessions/${sessionId}/review`,
    { rating: 5, comment: '交流顺畅，准时参与', tag: '按时出现' },
    userA.accessToken,
  );
  record('POST /sessions/:id/review 分享者轻反馈', light.status === 201);
  const complaint = await req(
    'POST',
    `/sessions/${sessionId}/complaint`,
    { category: '会议异常', description: '会议链接无法进入' },
    userB.accessToken,
  );
  record('POST /sessions/:id/complaint 投诉（24h 窗口内）', complaint.status === 201);

  const aThemes = await prisma.theme.findMany({ where: { userId: a.id, active: true } });
  const bSetup = await setupSharer(userB.accessToken, b.id, '李咨询');
  record('B 分享设置完成（互为分享者）', bSetup.sharing.status === 200);
  const bThemeList = await prisma.theme.findMany({ where: { userId: b.id, active: true } });
  const aSlots = (await req('GET', '/me/slots', undefined, userA.accessToken)).json.data;
  const aSlot2 = aSlots.find((s) => s.isAvailable);
  const swap = await req(
    'POST',
    '/invitations/topic-swaps',
    {
      sharerId: a.id,
      requestedThemeId: aThemes[0].id,
      offeredThemeId: bThemeList[0].id,
      question: '想了解你的产品方法论与可迁移的经验',
      offering: '我可以分享增长实验与数据驱动的经验',
      slotIds: [aSlot2.id],
    },
    userB.accessToken,
  );
  const swapAccepted = await req(
    'POST',
    `/sessions/${swap.json?.data?.id}/accept`,
    { confirmedSlotId: aSlot2.id, receiverQuestion: '想听听你最近一次失败案例的复盘' },
    userA.accessToken,
  );
  record('主题互换 发起→接受→已排期', swap.status === 201 && swapAccepted.json?.data?.status === 'swapScheduled');

  const notif = await req('GET', '/me/notifications', undefined, userB.accessToken);
  record('GET /me/notifications 通知与未读', notif.status === 200 && notif.json?.data?.unread > 0, `unread=${notif.json?.data?.unread}`);

  const me = await req('GET', '/me', undefined, userA.accessToken);
  record('GET /me 统计字段', me.status === 200 && typeof me.json?.data?.rating === 'number');

  const summary = [
    '',
    `===== 联调结果：PASS=${passed} FAIL=${failed} =====`,
    `时间：${new Date().toISOString()}`,
    `用户A=${phoneA} 用户B=${phoneB} 会话=${sessionId}`,
  ];
  log.push(...summary);
  console.log(summary.join('\n'));
  writeFileSync(`/private/tmp/coffeelink-integration-${Date.now()}.log`, `${log.join('\n')}\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  log.push(`[ERROR] ${e?.message ?? e}`);
  writeFileSync(`/private/tmp/coffeelink-integration-${Date.now()}.log`, `${log.join('\n')}\n`);
  await prisma.$disconnect();
  process.exit(1);
});
