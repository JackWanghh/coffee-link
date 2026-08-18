import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const drinks = [
  { id: U(101), code: 'americano', name: '美式咖啡', nameEn: 'Americano', priceCents: 1500, icon: '☕', description: '浓缩咖啡萃取加水，清爽明亮，唤醒思路。', tag: '提神经典' },
  { id: U(102), code: 'classic-latte', name: '经典拿铁', nameEn: 'Classic Latte', priceCents: 2200, icon: '🥛', description: '浓缩咖啡融合绵密鲜奶，温润醇厚。', tag: '最受欢迎' },
  { id: U(103), code: 'oat-latte', name: '燕麦拿铁', nameEn: 'Oat Latte', priceCents: 2800, icon: '🌾', description: '选用优质燕麦奶调制，麦香四溢，丝滑轻盈。', tag: '植物基精选' },
  { id: U(104), code: 'flat-white', name: '澳白咖啡', nameEn: 'Flat White', priceCents: 2600, icon: '☕', description: '双份精萃浓缩配薄奶沫，浓郁咖啡香气扑鼻。', tag: '浓醇之选' },
  { id: U(105), code: 'coconut-latte', name: '生椰拿铁', nameEn: 'Raw Coconut Latte', priceCents: 2500, icon: '🥥', description: '清新冷萃生椰乳与意式浓缩碰撞，香甜清润。', tag: '清甜解腻' },
  { id: U(106), code: 'cold-brew', name: '冷萃咖啡', nameEn: 'Cold Brew', priceCents: 2400, icon: '🧊', description: '12小时低温慢速冷萃，低酸柔顺，回甘持久。', tag: '冰爽回甘' },
  { id: U(107), code: 'yirgacheffe-pourover', name: '耶加雪菲手冲', nameEn: 'Yirgacheffe Pour-Over', priceCents: 3200, icon: '🫖', description: '埃塞俄比亚水洗豆手冲，柑橘茉莉花香，风味纯净。', tag: '精品单品' },
  { id: U(108), code: 'matcha-latte', name: '宇治抹茶拿铁', nameEn: 'Matcha Latte', priceCents: 2500, icon: '🍵', description: '精研宇治抹茶配鲜奶，微苦清香，无咖啡因负担。', tag: '茶咖风味' },
];

const themes = {
  alex1: { id: U(201), title: 'AI Native 产品经理转型与 Agent 落地实战', description: '从传统互联网 PM 转型为 AI Native PM 的思维转变与企业级 Agent 项目落地复盘。', includes: ['能力模型拆解', 'AI Agent 实际立项避坑', '提示词与工作流设计'], excludes: ['算法底层数学推导', 'CUDA 硬件算子开发'] },
  alex2: { id: U(202), title: '早期数字产品敏捷迭代与用户增长飞轮', description: '如何用最小成本验证产品假设，打造首批百人种子用户与自传播裂变回路。', includes: ['冷启动增长路径', 'MVP 指标漏斗定义', '用户真实访谈方法'], excludes: ['保证具体的融资或商务对接'] },
  elena1: { id: U(203), title: '产品管理基础与路线图规划', description: '转型为产品经理或提升您当前的技能与商业路线图思考能力。', includes: ['简历修改建议、面试关键策略、业务优先级判断方法。'], excludes: ['深度底层代码编写与具体系统调优。'] },
  elena2: { id: U(204), title: '金融科技出海与合规洞察', description: '应对金融科技产品的复杂性、监管合规要求及多国家商业化增长。', includes: ['监管合规路径、建立用户信任、风控与体验平衡。'], excludes: ['具体金融理财投资建议或荐股。'] },
  david1: { id: U(205), title: '技术人转型管理与组织效能', description: '从骨干程序员转型为 Tech Lead 或技术管理者过程中的思维跃迁与沟通机制。', includes: ['OKR 目标对齐、跨部门技术表达、骨干工程师激励技巧。'], excludes: ['提供具体猎头跳槽推荐。'] },
  david2: { id: U(206), title: '高可用微服务与架构演进', description: '面对业务爆发增长，如何搭建弹性的高可用架构与容灾体系。', includes: ['微服务拆分避坑、流量削峰策略、监控告警闭环。'], excludes: ['现场为您的私有仓库编写代码。'] },
  sophia1: { id: U(207), title: '高级 UI/UX 作品集复盘与重塑', description: '逐页诊断你的设计作品集，突出业务闭环思维与核心设计说服力。', includes: ['作品集排版视觉重点、设计提案叙事逻辑、面试提问预演。'], excludes: ['替用户代做设计稿或直接交付源文件。'] },
  leo1: { id: U(208), title: 'App 出海冷启动与获客增长', description: '梳理海外各市场渠道红利与买量变现 ROI 评估模型，避开出海试错陷阱。', includes: ['投放渠道拆解、素材测试框架、转化漏斗优化。'], excludes: ['承诺具体的下载量或变现金额。'] },
};

const avatar = {
  alex: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  elena: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  david: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  sophia: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  leo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  lin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  marcus: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
};

async function main() {
  const now = Date.now();
  const day = 86400_000;
  const passwordHash = await argon2.hash('Pass123456');

  // 全量清理，保证种子幂等、可重复执行
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

  await prisma.coffeeDrink.deleteMany();
  for (const d of drinks) {
    await prisma.coffeeDrink.create({ data: d });
  }

  const career = await prisma.category.findUniqueOrThrow({ where: { code: 'career' } });
  const skill = await prisma.category.findUniqueOrThrow({ where: { code: 'skill' } });

  async function user(id, { name, title, company, industry, phone, drinkCode, verified = true, sharing = true, swapLimit = 3, acceptsSwap = true, link, highlights = [] }) {
    return prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        phone,
        passwordHash,
        name,
        title,
        company,
        industry,
        avatarUrl: avatar[name.split(' ')[0].toLowerCase()] ?? null,
        isVerified: verified,
        isSharingOpen: sharing,
        acceptsTopicSwap: acceptsSwap,
        weeklySwapLimit: swapLimit,
        signatureDrinkId: drinkCode,
        meetingLink: link,
        highlights,
        declarationNote: '职业信息由用户自行填写，平台未核验',
      },
    });
  }

  const alex = await user(U(1), { name: 'Alex Chen', title: 'AI 产品经理', company: 'TechFlow Lab', industry: 'AI 与算法', phone: '13800000001', drinkCode: U(103), swapLimit: 3, link: 'https://meeting.tencent.com/dm/832910293' });
  const elena = await user(U(2), { name: 'Elena Rodriguez', title: '产品副总裁', company: 'FinTech Global', industry: '互联网产品', phone: '13800000002', drinkCode: U(102), swapLimit: 2, link: 'https://meeting.tencent.com/dm/832910293', highlights: ['领导旗舰移动银行应用的产品战略，扩展至超过1000万活跃用户。', '前顶级咨询公司高级产品经理，专注于数字化转型与支付产品创新。', '热衷于指导早期产品经理和建立包容性、高敏捷度的技术与业务团队。'] });
  const david = await user(U(3), { name: 'David Wu', title: '首席架构师 / 技术总监', company: 'NextGen Cloud', industry: '研发与架构', phone: '13800000003', drinkCode: U(106), swapLimit: 3, link: 'https://meeting.tencent.com/dm/772190321', highlights: ['主导亿级流量高并发云原生底座架构演进，支撑千万级实时长连接。', '从资深后端工程师向技术管理转型的十余年实操经验与团队组织思考。', '热衷于微服务治理、分布式容灾以及技术人的职业阶梯成长探讨。'] });
  const sophia = await user(U(4), { name: 'Sophia Tang', title: '设计主管 & 体验策略师', company: 'Aura Studio', industry: '设计与体验', phone: '13800000004', drinkCode: U(103), swapLimit: 0, acceptsSwap: false, link: 'https://meeting.tencent.com/dm/902148201', highlights: ['多次荣获德国红点奖及 iF 设计大奖，主导过数个全球级 B端及消费级体验系统。', '精通设计系统 (Design System) 搭建、跨平台交互规范及设计价值商业化量化。', '乐于与设计师探讨作品集破局、大厂设计晋升逻辑与出海本地化体验。'] });
  const leo = await user(U(5), { name: 'Leo Zhang', title: '出海增长负责人', company: 'Global Scale Lab', industry: '出海与商业化', phone: '13800000005', drinkCode: U(105), swapLimit: 3, link: 'https://meeting.tencent.com/dm/198302145', highlights: ['操盘过 2 款日活数百万级出海应用在欧美及东南亚的冷启动与获客增长。', '擅长 ASO、海外买量投放与本地化变现矩阵搭建。', '提供关于海外市场选品、本地化合规及投放 ROI 优化的深度交流。'] });
  const lin = await user(U(6), { name: '林可 (Lin Ke)', title: '资深互联网产品经理', company: '字节跳动', industry: '互联网产品', phone: '13800000006', drinkCode: U(102), sharing: false });
  const marcus = await user(U(7), { name: 'Marcus Vance', title: '产品负责人 / 敏捷教练', company: 'AgileTech', industry: '互联网产品', phone: '13800000007', drinkCode: U(102), sharing: false });
  await user(U(8), { name: 'James D.', title: '分享者', company: '示例', industry: null, phone: '13800000008', drinkCode: U(102), sharing: false, verified: false });
  await user(U(9), { name: 'Lin K.', title: '分享者', company: '示例', industry: null, phone: '13800000009', drinkCode: U(102), sharing: false, verified: false });
  await user(U(10), { name: 'Ethan Zhang', title: '分享者', company: '示例', industry: null, phone: '13800000010', drinkCode: U(102), sharing: false, verified: false });
  await user(U(11), { name: 'Mia W.', title: '分享者', company: '示例', industry: null, phone: '13800000011', drinkCode: U(102), sharing: false, verified: false });
  await user(U(12), { name: 'Austin C.', title: '分享者', company: '示例', industry: null, phone: '13800000012', drinkCode: U(102), sharing: false, verified: false });

  async function theme(key, userId) {
    const t = themes[key];
    return prisma.theme.upsert({
      where: { userId_title: { userId, title: t.title } },
      update: {},
      create: {
        id: t.id,
        userId,
        categoryId: key.startsWith('alex') || key.startsWith('david') ? skill.id : career.id,
        title: t.title,
        description: t.description,
        durationMinutes: 30,
        includes: t.includes,
        excludes: t.excludes,
      },
    });
  }

  const alexTheme1 = await theme('alex1', alex.id);
  const alexTheme2 = await theme('alex2', alex.id);
  await theme('elena1', elena.id);
  await theme('elena2', elena.id);
  await theme('david1', david.id);
  await theme('david2', david.id);
  await theme('sophia1', sophia.id);
  await theme('leo1', leo.id);

  const demoSlots = [
    [U(301), elena.id, '10月24日 09:00 上午', now + 1 * day],
    [U(302), elena.id, '10月24日 10:30 上午', now + 1 * day + 90 * 60000],
    [U(303), elena.id, '10月24日 02:00 下午', now + 1 * day + 5 * 3600_000],
    [U(304), elena.id, '10月25日 03:30 下午', now + 2 * day + 7.5 * 3600_000],
    [U(305), elena.id, '10月26日 10:00 上午', now + 3 * day + 2 * 3600_000],
    [U(306), elena.id, '10月27日 04:00 下午', now + 4 * day + 8 * 3600_000],
    [U(307), david.id, '10月25日 10:00 上午', now + 2 * day + 2 * 3600_000],
    [U(308), david.id, '10月25日 02:30 下午', now + 2 * day + 6.5 * 3600_000],
    [U(309), david.id, '10月27日 03:00 下午', now + 4 * day + 7 * 3600_000],
    [U(310), sophia.id, '10月25日 11:00 上午', now + 2 * day + 3 * 3600_000],
    [U(311), sophia.id, '10月25日 04:00 下午', now + 2 * day + 8 * 3600_000],
    [U(312), leo.id, '10月24日 08:00 晚上', now + 1 * day + 12 * 3600_000],
    [U(313), leo.id, '10月26日 02:00 下午', now + 3 * day + 6 * 3600_000],
    [U(314), leo.id, '10月26日 07:30 晚上', now + 3 * day + 11.5 * 3600_000],
    [U(315), alex.id, '10月25日 10:30 上午', now + 2 * day + 2.5 * 3600_000],
    [U(316), alex.id, '10月25日 03:30 下午', now + 2 * day + 7.5 * 3600_000],
    [U(317), alex.id, '10月26日 02:00 下午', now + 3 * day + 6 * 3600_000],
    [U(318), alex.id, '10月26日 04:00 下午', now + 3 * day + 8 * 3600_000],
    [U(319), alex.id, '10月27日 10:00 上午', now + 4 * day + 2 * 3600_000],
  ];
  await prisma.slot.deleteMany();
  await prisma.slot.createMany({
    data: demoSlots.map(([id, userId, label, slotAt]) => ({ id, userId, label, slotAt: new Date(slotAt) })),
  });

  const drinkSnapshot = (code) => {
    const d = drinks.find((x) => x.code === code);
    return { id: d.id, name: d.name, nameEn: d.nameEn, priceCents: d.priceCents, icon: d.icon, description: d.description, tag: d.tag };
  };
  const slotsByLabel = (labels) => labels.map((label) => {
    const row = demoSlots.find((s) => s[2] === label);
    return { id: row[0], label };
  });

  const sessions = [
    {
      id: U(401), type: 'coffee', orderNumber: 'INV-20231024-9A1B', senderId: lin.id, receiverId: alex.id,
      themeId: alexTheme1.id, question: '目前在大厂做电商推荐端产品3年，想在未来半年内转入大模型AI Agent方向。想请教在无深厚算法背景的情况下，如何从日常业务中发掘大模型落地场景并构建有说服力的实战作品集？',
      candidateSlots: slotsByLabel(['10月25日 10:30 上午', '10月25日 03:30 下午', '10月26日 02:00 下午']),
      drinkSnapshot: drinkSnapshot('oat-latte'), priceCents: 2800, status: 'pendingResponse',
      meetingLink: 'https://meeting.tencent.com/dm/832910293', createdAt: new Date('2023-10-24T09:15:00Z'),
      expiresAt: new Date(now + 12 * 3600_000),
    },
    {
      id: U(402), type: 'topicSwap', orderNumber: 'SWP-20231024-4F2A', senderId: marcus.id, receiverId: alex.id,
      themeId: alexTheme1.id, offeredThemeId: alexTheme2.id,
      question: '想了解企业内部 Agent 自动化落地时，产品如何衡量真实提效指标并与后端工程团队定义评估基准 (Evaluation Benchmark)？',
      offering: '可全面分享 50 人产研团队如何建立双周敏捷发版机制与跨职能回顾会议 (Retrospective) 的落地方案。',
      candidateSlots: slotsByLabel(['10月26日 04:00 下午', '10月27日 10:00 上午']),
      status: 'pendingResponse', meetingLink: 'https://meeting.tencent.com/dm/832910293',
      createdAt: new Date('2023-10-24T10:40:00Z'), expiresAt: new Date(now + 12 * 3600_000),
    },
    {
      id: U(403), type: 'coffee', orderNumber: 'INV-20231023-8B3C', senderId: alex.id, receiverId: elena.id,
      themeId: U(203),
      question: '想请教如何向高管层清晰阐述中长期产品路线图，并在资源受限的情况下平衡核心技术债务与新商业功能交付？',
      candidateSlots: slotsByLabel(['10月24日 02:00 下午']), confirmedSlotLabel: '10月24日 (明天) 14:00 - 14:30',
      drinkSnapshot: drinkSnapshot('classic-latte'), priceCents: 2200, status: 'acceptedPendingPayment',
      paymentDeadlineAt: new Date(now + 102 * 60000), meetingLink: 'https://meeting.tencent.com/dm/832910293',
      createdAt: new Date('2023-10-23T18:20:00Z'),
    },
    {
      id: U(404), type: 'coffee', orderNumber: 'ORD-20231024-7C9D', senderId: alex.id, receiverId: leo.id,
      themeId: U(208),
      question: '我们正计划将一款生产力 AI 移动端应用推向北美市场，想了解在预算有限的情况下，如何利用 TikTok / ProductHunt 做好初期的冷启动与 ASO 关键词布局？',
      candidateSlots: slotsByLabel(['10月24日 08:00 晚上']), confirmedSlotLabel: '10月24日 20:00 - 20:30 (30分钟)',
      drinkSnapshot: drinkSnapshot('coconut-latte'), priceCents: 2500, status: 'booked', paymentMethod: 'wechat',
      meetingLink: 'https://meeting.tencent.com/dm/198302145', startsAt: new Date(now + 1 * day), endsAt: new Date(now + 1 * day + 30 * 60000),
      createdAt: new Date('2023-10-23T14:10:00Z'),
    },
    {
      id: U(405), type: 'topicSwap', orderNumber: 'SWP-20231025-1E8F', senderId: alex.id, receiverId: david.id,
      themeId: U(205), offeredThemeId: alexTheme1.id,
      question: '想向 David 探讨技术总监如何评估 AI 新技术对团队研发效能的真实影响，以及如何说服管理层分配探索预算？',
      offering: '为 David 分享当前业界主流 AI Coding 工具在前端与测试流程中的落地量化数据。',
      receiverQuestion: '想听 Alex 分享团队引入大模型 Agent 时最容易踩的前 3 个产品预期陷阱。',
      candidateSlots: slotsByLabel(['10月25日 02:30 下午']), confirmedSlotLabel: '10月25日 14:30 - 15:00 (双方各约15分钟)',
      status: 'swapScheduled', meetingLink: 'https://meeting.tencent.com/dm/772190321',
      startsAt: new Date(now + 2 * day), endsAt: new Date(now + 2 * day + 30 * 60000),
      createdAt: new Date('2023-10-22T11:30:00Z'),
    },
    {
      id: U(406), type: 'coffee', orderNumber: 'ORD-20231012-3F4C', senderId: alex.id, receiverId: sophia.id,
      themeId: U(207),
      question: '想请 Sophia 看看我负责的 AI Agent 对话界面的交互原型，探讨如何降低用户的首屏认知负荷。',
      candidateSlots: slotsByLabel(['10月25日 11:00 上午']), confirmedSlotLabel: '10月12日 10:00 - 10:30 (30分钟)',
      drinkSnapshot: drinkSnapshot('oat-latte'), priceCents: 2800, status: 'completed', paymentMethod: 'wechat',
      meetingLink: 'https://meeting.tencent.com/dm/902148201',
      startsAt: new Date(now - 2 * day), endsAt: new Date(now - 2 * day + 30 * 60000),
      createdAt: new Date('2023-10-10T14:12:00Z'),
    },
  ];
  await prisma.session.deleteMany();
  for (const s of sessions) {
    await prisma.session.create({ data: s });
  }

  await prisma.review.deleteMany();
  await prisma.review.create({
    data: { id: U(501), sessionId: U(406), reviewerId: alex.id, revieweeId: sophia.id, rating: 5, comment: '非常有收获的 30 分钟！Sophia 从认知负荷和渐进披露角度给出了极具穿透力的修改建议，直击痛点。', tag: '话题契合·收获满满', isSwapReview: false, isBlindVisible: true },
  });
  await prisma.review.create({
    data: { id: U(502), sessionId: U(406), reviewerId: U(11), revieweeId: sophia.id, rating: 5, comment: '针对我作品集里的 2 个 B 端案例提了非常犀利的改进点，改完之后面试通过率明显提升！', tag: '话题符合描述', isSwapReview: false, isBlindVisible: true, createdAt: new Date(now - 2 * day + 3600_000) },
  });
  const sharerReviews = [
    { id: U(503), revieweeId: elena.id, reviewerId: U(8), comment: '非常有见地的对谈！Elena 从一线面试官角度梳理了产品经理思维，给出的 3 点建议极其实用。' },
    { id: U(504), revieweeId: elena.id, reviewerId: U(9), comment: '30分钟聊得很透，对海外 FinTech 监管体系和产品增长框架拆解得非常清晰。' },
    { id: U(505), revieweeId: david.id, reviewerId: U(10), comment: 'David 老师从真实大厂系统故障复盘讲起，对我们正在重构的微服务网关启发很大！' },
    { id: U(506), revieweeId: leo.id, reviewerId: U(12), comment: '海外投放数据模型讲得非常透彻，帮我们避开了东南亚支付本地化的几个大坑。' },
  ];
  for (const r of sharerReviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        sessionId: U(406),
        reviewerId: r.reviewerId,
        revieweeId: r.revieweeId,
        rating: 5,
        comment: r.comment,
        isSwapReview: false,
        isBlindVisible: true,
        createdAt: new Date(now - 3 * day),
      },
    });
  }

  console.log(`seeded demo: drinks=${drinks.length} users=12 themes=8 slots=${demoSlots.length} sessions=${sessions.length} reviews=6`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
