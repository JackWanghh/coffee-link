import { Sharer, Order, UserProfile, SharingCenterConfig, CoffeeDrink } from '../types';

export const COFFEE_CATALOG: CoffeeDrink[] = [
  {
    id: 'americano',
    name: '美式咖啡',
    nameEn: 'Americano',
    price: 15,
    icon: '☕',
    description: '浓缩咖啡萃取加水，清爽明亮，唤醒思路。',
    tag: '提神经典'
  },
  {
    id: 'classic-latte',
    name: '经典拿铁',
    nameEn: 'Classic Latte',
    price: 22,
    icon: '🥛',
    description: '浓缩咖啡融合绵密鲜奶，温润醇厚。',
    tag: '最受欢迎'
  },
  {
    id: 'oat-latte',
    name: '燕麦拿铁',
    nameEn: 'Oat Latte',
    price: 28,
    icon: '🌾',
    description: '选用优质燕麦奶调制，麦香四溢，丝滑轻盈。',
    tag: '植物基精选'
  },
  {
    id: 'flat-white',
    name: '澳白咖啡',
    nameEn: 'Flat White',
    price: 26,
    icon: '☕',
    description: '双份精萃浓缩配薄奶沫，浓郁咖啡香气扑鼻。',
    tag: '浓醇之选'
  },
  {
    id: 'coconut-latte',
    name: '生椰拿铁',
    nameEn: 'Raw Coconut Latte',
    price: 25,
    icon: '🥥',
    description: '清新冷萃生椰乳与意式浓缩碰撞，香甜清润。',
    tag: '清甜解腻'
  },
  {
    id: 'cold-brew',
    name: '冷萃咖啡',
    nameEn: 'Cold Brew',
    price: 24,
    icon: '🧊',
    description: '12小时低温慢速冷萃，低酸柔顺，回甘持久。',
    tag: '冰爽回甘'
  },
  {
    id: 'yirgacheffe-pourover',
    name: '耶加雪菲手冲',
    nameEn: 'Yirgacheffe Pour-Over',
    price: 32,
    icon: '🫖',
    description: '埃塞俄比亚水洗豆手冲，柑橘茉莉花香，风味纯净。',
    tag: '精品单品'
  },
  {
    id: 'matcha-latte',
    name: '宇治抹茶拿铁',
    nameEn: 'Matcha Latte',
    price: 25,
    icon: '🍵',
    description: '精研宇治抹茶配鲜奶，微苦清香，无咖啡因负担。',
    tag: '茶咖风味'
  }
];

export const INITIAL_USER: UserProfile = {
  id: 'user-alex-chen',
  name: 'Alex Chen',
  title: 'AI 产品经理',
  company: 'TechFlow Lab',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  isVerified: true,
  totalChats: 14,
  rating: 4.9,
  replyRate: '95%',
  onTimeRate: '100%',
  phone: '+86 138****8888',
  isLoggedIn: true,
  isSharingOpen: true,
  signatureDrink: COFFEE_CATALOG[2], // 燕麦拿铁 ¥28
  acceptsTopicSwap: true,
  weeklySwapLimit: 3,
  totalEarnings: 840.00,
  completedSessionsCount: 8,
  completedSwapsCount: 3,
  meetingLink: 'https://meeting.tencent.com/dm/832910293',
  myThemes: [
    {
      id: 'my-theme-1',
      title: 'AI Native 产品经理转型与 Agent 落地实战',
      description: '从传统互联网 PM 转型为 AI Native PM 的思维转变与企业级 Agent 项目落地复盘。',
      durationMinutes: 30,
      includes: ['能力模型拆解', 'AI Agent 实际立项避坑', '提示词与工作流设计'],
      excludes: ['算法底层数学推导', 'CUDA 硬件算子开发']
    },
    {
      id: 'my-theme-2',
      title: '早期数字产品敏捷迭代与用户增长飞轮',
      description: '如何用最小成本验证产品假设，打造首批百人种子用户与自传播裂变回路。',
      durationMinutes: 30,
      includes: ['冷启动增长路径', 'MVP 指标漏斗定义', '用户真实访谈方法'],
      excludes: ['保证具体的融资或商务对接']
    }
  ]
};

export const INITIAL_SHARING_CONFIG: SharingCenterConfig = {
  isOnline: true,
  signatureDrink: COFFEE_CATALOG[2], // 燕麦拿铁 ¥28
  acceptsTopicSwap: true,
  weeklySwapLimit: 3,
  remainingSwapQuota: 2,
  totalEarnings: 840.00,
  pendingEarnings: 140.00,
  settledEarnings: 700.00,
  platformFeeRate: 0.15,
  defaultMeetingUrl: 'https://meeting.tencent.com/dm/832910293',
  defaultMeetingId: '832 910 293',
  themesCount: 2,
  maxThemes: 3,
};

export const MOCK_SHARERS: Sharer[] = [
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    title: '产品副总裁',
    company: 'FinTech Global',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    industry: '互联网产品',
    isVerified: true,
    declarationNote: '职业信息由用户自行填写，平台未核验',
    signatureDrink: COFFEE_CATALOG[1], // 经典拿铁 ¥22
    acceptsTopicSwap: true,
    weeklySwapLimit: 2,
    remainingSwapQuota: 2,
    highlights: [
      '领导旗舰移动银行应用的产品战略，扩展至超过1000万活跃用户。',
      '前顶级咨询公司高级产品经理，专注于数字化转型与支付产品创新。',
      '热衷于指导早期产品经理和建立包容性、高敏捷度的技术与业务团队。'
    ],
    themes: [
      {
        id: 'pm-basics',
        title: '产品管理基础与路线图规划',
        description: '转型为产品经理或提升您当前的技能与商业路线图思考能力。',
        durationMinutes: 30,
        includes: ['简历修改建议、面试关键策略、业务优先级判断方法。'],
        excludes: ['深度底层代码编写与具体系统调优。']
      },
      {
        id: 'fintech-insights',
        title: '金融科技出海与合规洞察',
        description: '应对金融科技产品的复杂性、监管合规要求及多国家商业化增长。',
        durationMinutes: 30,
        includes: ['监管合规路径、建立用户信任、风控与体验平衡。'],
        excludes: ['具体金融理财投资建议或荐股。']
      }
    ],
    nextAvailableText: '最早可约：明天 下午2点',
    availableDays: [
      {
        date: '10月24日',
        dayOfWeek: '周四',
        slotsCount: 3,
        slots: ['09:00 上午', '10:30 上午', '02:00 下午']
      },
      {
        date: '10月25日',
        dayOfWeek: '周五',
        slotsCount: 1,
        slots: ['03:30 下午']
      },
      {
        date: '10月26日',
        dayOfWeek: '周六',
        slotsCount: 0,
        isFull: true,
        slots: []
      },
      {
        date: '10月27日',
        dayOfWeek: '周日',
        slotsCount: 2,
        slots: ['10:00 上午', '04:00 下午']
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        authorName: 'James D.',
        authorInitials: 'JD',
        rating: 5,
        comment: '非常有见地的对谈！Elena 从一线面试官角度梳理了产品经理思维，给出的 3 点建议极其实用。',
        date: '3天前'
      },
      {
        id: 'rev-2',
        authorName: 'Lin K.',
        authorInitials: 'LK',
        rating: 5,
        comment: '30分钟聊得很透，对海外 FinTech 监管体系和产品增长框架拆解得非常清晰。',
        date: '1周前'
      }
    ],
    rating: 4.9,
    reviewCount: 12,
    swapFeedbackCount: 4,
    meetingLink: 'https://meeting.tencent.com/dm/832910293',
    onTimeRate: '100%',
    responseMedianTime: '1.2小时'
  },
  {
    id: 'david-wu',
    name: 'David Wu',
    title: '首席架构师 / 技术总监',
    company: 'NextGen Cloud',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    industry: '研发与架构',
    isVerified: true,
    declarationNote: '职业信息由用户自行填写，平台未核验',
    signatureDrink: COFFEE_CATALOG[5], // 耶加雪菲手冲 ¥32
    acceptsTopicSwap: true,
    weeklySwapLimit: 3,
    remainingSwapQuota: 1,
    highlights: [
      '主导亿级流量高并发云原生底座架构演进，支撑千万级实时长连接。',
      '从资深后端工程师向技术管理转型的十余年实操经验与团队组织思考。',
      '热衷于微服务治理、分布式容灾以及技术人的职业阶梯成长探讨。'
    ],
    themes: [
      {
        id: 'tech-leadership',
        title: '技术人转型管理与组织效能',
        description: '从骨干程序员转型为 Tech Lead 或技术管理者过程中的思维跃迁与沟通机制。',
        durationMinutes: 30,
        includes: ['OKR 目标对齐、跨部门技术表达、骨干工程师激励技巧。'],
        excludes: ['提供具体猎头跳槽推荐。']
      },
      {
        id: 'cloud-architecture',
        title: '高可用微服务与架构演进',
        description: '面对业务爆发增长，如何搭建弹性的高可用架构与容灾体系。',
        durationMinutes: 30,
        includes: ['微服务拆分避坑、流量削峰策略、监控告警闭环。'],
        excludes: ['现场为您的私有仓库编写代码。']
      }
    ],
    nextAvailableText: '最早可约：后天 上午10点',
    availableDays: [
      {
        date: '10月25日',
        dayOfWeek: '周五',
        slotsCount: 2,
        slots: ['10:00 上午', '02:30 下午']
      },
      {
        date: '10月27日',
        dayOfWeek: '周日',
        slotsCount: 1,
        slots: ['03:00 下午']
      }
    ],
    reviews: [
      {
        id: 'rev-3',
        authorName: 'Ethan Zhang',
        authorInitials: 'EZ',
        rating: 5,
        comment: 'David 老师从真实大厂系统故障复盘讲起，对我们正在重构的微服务网关启发很大！',
        date: '5天前'
      }
    ],
    rating: 5.0,
    reviewCount: 8,
    swapFeedbackCount: 3,
    meetingLink: 'https://meeting.tencent.com/dm/772190321',
    onTimeRate: '98%',
    responseMedianTime: '2.0小时'
  },
  {
    id: 'sophia-tang',
    name: 'Sophia Tang',
    title: '设计主管 & 体验策略师',
    company: 'Aura Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    industry: '设计与体验',
    isVerified: true,
    declarationNote: '职业信息由用户自行填写，平台未核验',
    signatureDrink: COFFEE_CATALOG[2], // 燕麦拿铁 ¥28
    acceptsTopicSwap: false, // 暂未开启主题互换
    weeklySwapLimit: 0,
    remainingSwapQuota: 0,
    highlights: [
      '多次荣获德国红点奖及 iF 设计大奖，主导过数个全球级 B端及消费级体验系统。',
      '精通设计系统 (Design System) 搭建、跨平台交互规范及设计价值商业化量化。',
      '乐于与设计师探讨作品集破局、大厂设计晋升逻辑与出海本地化体验。'
    ],
    themes: [
      {
        id: 'portfolio-review',
        title: '高级 UI/UX 作品集复盘与重塑',
        description: '逐页诊断你的设计作品集，突出业务闭环思维与核心设计说服力。',
        durationMinutes: 30,
        includes: ['作品集排版视觉重点、设计提案叙事逻辑、面试提问预演。'],
        excludes: ['替用户代做设计稿或直接交付源文件。']
      }
    ],
    nextAvailableText: '最早可约：周五 上午11点',
    availableDays: [
      {
        date: '10月25日',
        dayOfWeek: '周五',
        slotsCount: 2,
        slots: ['11:00 上午', '04:00 下午']
      }
    ],
    reviews: [
      {
        id: 'rev-4',
        authorName: 'Mia W.',
        authorInitials: 'MW',
        rating: 5,
        comment: '针对我作品集里的 2 个 B 端案例提了非常犀利的改进点，改完之后面试通过率明显提升！',
        date: '2周前'
      }
    ],
    rating: 4.9,
    reviewCount: 15,
    swapFeedbackCount: 0,
    meetingLink: 'https://meeting.tencent.com/dm/902148201',
    onTimeRate: '100%',
    responseMedianTime: '0.8小时'
  },
  {
    id: 'leo-zhang',
    name: 'Leo Zhang',
    title: '出海增长负责人',
    company: 'Global Scale Lab',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    industry: '出海与商业化',
    isVerified: true,
    declarationNote: '职业信息由用户自行填写，平台未核验',
    signatureDrink: COFFEE_CATALOG[4], // 生椰拿铁 ¥25
    acceptsTopicSwap: true,
    weeklySwapLimit: 3,
    remainingSwapQuota: 2,
    highlights: [
      '操盘过 2 款日活数百万级出海应用在欧美及东南亚的冷启动与获客增长。',
      '擅长 ASO、海外买量投放与本地化变现矩阵搭建。',
      '提供关于海外市场选品、本地化合规及投放 ROI 优化的深度交流。'
    ],
    themes: [
      {
        id: 'growth-strategy',
        title: 'App 出海冷启动与获客增长',
        description: '梳理海外各市场渠道红利与买量变现 ROI 评估模型，避开出海试错陷阱。',
        durationMinutes: 30,
        includes: ['投放渠道拆解、素材测试框架、转化漏斗优化。'],
        excludes: ['承诺具体的下载量或变现金额。']
      }
    ],
    nextAvailableText: '最早可约：周四 晚上8点',
    availableDays: [
      {
        date: '10月24日',
        dayOfWeek: '周四',
        slotsCount: 1,
        slots: ['08:00 晚上']
      },
      {
        date: '10月26日',
        dayOfWeek: '周六',
        slotsCount: 2,
        slots: ['02:00 下午', '07:30 晚上']
      }
    ],
    reviews: [
      {
        id: 'rev-7',
        authorName: 'Austin C.',
        authorInitials: 'AC',
        rating: 5,
        comment: '海外投放数据模型讲得非常透彻，帮我们避开了东南亚支付本地化的几个大坑。',
        date: '1周前'
      }
    ],
    rating: 5.0,
    reviewCount: 9,
    swapFeedbackCount: 2,
    meetingLink: 'https://meeting.tencent.com/dm/198302145',
    onTimeRate: '96%',
    responseMedianTime: '1.8小时'
  }
];

export const INITIAL_ORDERS: Order[] = [
  // 1. 发给我的待处理：电子咖啡邀请 (Lin Ke 请 Alex Chen 喝燕麦拿铁)
  {
    id: 'ord-in-ecoffee-1',
    sessionType: 'ECOFFEE',
    orderNumber: 'INV-20231024-9A1B',
    senderId: 'user-lin-ke',
    senderName: '林可 (Lin Ke)',
    senderTitle: '资深互联网产品经理 @ 字节跳动',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    receiverId: 'user-alex-chen',
    receiverName: 'Alex Chen',
    receiverTitle: 'AI 产品经理 @ TechFlow Lab',
    receiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    themeId: 'my-theme-1',
    themeTitle: 'AI Native 产品经理转型与 Agent 落地实战',
    themeDescription: '从传统互联网 PM 转型为 AI Native PM 的思维转变与企业级 Agent 项目落地复盘。',
    inquirerQuestion: '目前在大厂做电商推荐端产品3年，想在未来半年内转入大模型AI Agent方向。想请教在无深厚算法背景的情况下，如何从日常业务中发掘大模型落地场景并构建有说服力的实战作品集？',
    candidateSlots: ['10月25日 10:30 上午', '10月25日 03:30 下午', '10月26日 02:00 下午'],
    coffeeDrink: COFFEE_CATALOG[2], // 燕麦拿铁
    price: 28.00,
    status: 'PENDING_RESPONSE',
    statusText: '待我回应',
    meetingType: '腾讯会议',
    meetingId: '832 910 293',
    meetingUrl: 'https://meeting.tencent.com/dm/832910293',
    createdAt: '2023-10-24 09:15',
    durationMinutes: 30
  },

  // 2. 发给我的待处理：主题互换邀请 (Marcus Vance 想要与 Alex Chen 互换)
  {
    id: 'ord-in-swap-1',
    sessionType: 'TOPIC_SWAP',
    orderNumber: 'SWP-20231024-4F2A',
    senderId: 'user-marcus',
    senderName: 'Marcus Vance',
    senderTitle: '产品负责人 / 敏捷教练 @ AgileTech',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    receiverId: 'user-alex-chen',
    receiverName: 'Alex Chen',
    receiverTitle: 'AI 产品经理 @ TechFlow Lab',
    receiverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    themeId: 'my-theme-1',
    themeTitle: 'AI Native 产品经理转型与 Agent 落地实战',
    themeDescription: '想了解 Alex 在实际落地 Agent 自动化流时，产品与工程团队如何拆分需求与指标？',
    swapThemeId: 'marcus-theme-1',
    swapThemeTitle: '扩展敏捷团队敏捷迭代与研发效能落地',
    swapThemeDescription: '我愿意分享从10人到50人产研团队的敏捷迭代机制、Sprint 节奏把控与OKR双向对齐实操。',
    inquirerQuestion: '想了解企业内部 Agent 自动化落地时，产品如何衡量真实提效指标并与后端工程团队定义评估基准 (Evaluation Benchmark)？',
    whatInquirerCanShare: '可全面分享 50 人产研团队如何建立双周敏捷发版机制与跨职能回顾会议 (Retrospective) 的落地方案。',
    candidateSlots: ['10月26日 04:00 下午', '10月27日 10:00 上午'],
    status: 'PENDING_RESPONSE',
    statusText: '待我回应 (互换)',
    meetingType: '腾讯会议',
    meetingId: '832 910 293',
    meetingUrl: 'https://meeting.tencent.com/dm/832910293',
    createdAt: '2023-10-24 10:40',
    durationMinutes: 30
  },

  // 3. 我发起的：对方已接受，待我付款 (Alex Chen 请 Elena Rodriguez 喝经典拿铁)
  {
    id: 'ord-out-accepted-pay-1',
    sessionType: 'ECOFFEE',
    orderNumber: 'INV-20231023-8B3C',
    senderId: 'user-alex-chen',
    senderName: 'Alex Chen',
    senderTitle: 'AI 产品经理 @ TechFlow Lab',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    receiverId: 'elena-rodriguez',
    receiverName: 'Elena Rodriguez',
    receiverTitle: '产品副总裁 @ FinTech Global',
    receiverAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    themeId: 'pm-basics',
    themeTitle: '产品管理基础与路线图规划',
    themeDescription: '转型为产品经理或提升您当前的技能与商业路线图思考能力。',
    inquirerQuestion: '想请教如何向高管层清晰阐述中长期产品路线图，并在资源受限的情况下平衡核心技术债务与新商业功能交付？',
    candidateSlots: ['10月24日 02:00 下午'],
    confirmedSlot: '10月24日 (明天) 14:00 - 14:30',
    coffeeDrink: COFFEE_CATALOG[1], // 经典拿铁
    price: 22.00,
    status: 'ACCEPTED_PENDING_PAYMENT',
    statusText: '已接受，待付款',
    paymentDeadline: '剩余 1小时42分',
    meetingType: '腾讯会议',
    meetingId: '832 910 293',
    meetingUrl: 'https://meeting.tencent.com/dm/832910293',
    createdAt: '2023-10-23 18:20',
    durationMinutes: 30
  },

  // 4. 我发起的：电子咖啡已预约 (已付款成功，即将开始)
  {
    id: 'ord-out-booked-1',
    sessionType: 'ECOFFEE',
    orderNumber: 'ORD-20231024-7C9D',
    senderId: 'user-alex-chen',
    senderName: 'Alex Chen',
    senderTitle: 'AI 产品经理 @ TechFlow Lab',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    receiverId: 'leo-zhang',
    receiverName: 'Leo Zhang',
    receiverTitle: '出海增长负责人 @ Global Scale Lab',
    receiverAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    themeId: 'growth-strategy',
    themeTitle: 'App 出海冷启动与获客增长',
    themeDescription: '梳理海外各市场渠道红利与买量变现 ROI 评估模型，避开出海试错陷阱。',
    inquirerQuestion: '我们正计划将一款生产力 AI 移动端应用推向北美市场，想了解在预算有限的情况下，如何利用 TikTok / ProductHunt 做好初期的冷启动与 ASO 关键词布局？',
    candidateSlots: ['10月24日 08:00 晚上'],
    confirmedSlot: '10月24日 20:00 - 20:30 (30分钟)',
    coffeeDrink: COFFEE_CATALOG[4], // 生椰拿铁
    price: 25.00,
    paymentMethod: '微信支付',
    status: 'BOOKED',
    statusText: '即将开始',
    meetingType: '腾讯会议',
    meetingId: '198 302 145',
    meetingUrl: 'https://meeting.tencent.com/dm/198302145',
    createdAt: '2023-10-23 14:10',
    durationMinutes: 30
  },

  // 5. 主题互换已排期成立 (双方各约15分钟)
  {
    id: 'ord-swap-scheduled-1',
    sessionType: 'TOPIC_SWAP',
    orderNumber: 'SWP-20231025-1E8F',
    senderId: 'user-alex-chen',
    senderName: 'Alex Chen',
    senderTitle: 'AI 产品经理 @ TechFlow Lab',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    receiverId: 'david-wu',
    receiverName: 'David Wu',
    receiverTitle: '首席架构师 @ NextGen Cloud',
    receiverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    themeId: 'tech-leadership',
    themeTitle: '技术人转型管理与组织效能',
    themeDescription: '从骨干程序员转型为 Tech Lead 或技术管理者过程中的思维跃迁与沟通机制。',
    swapThemeId: 'my-theme-1',
    swapThemeTitle: 'AI Native 产品经理转型与 Agent 落地实战',
    inquirerQuestion: '想向 David 探讨技术总监如何评估 AI 新技术对团队研发效能的真实影响，以及如何说服管理层分配探索预算？',
    whatInquirerCanShare: '为 David 分享当前业界主流 AI Coding 工具在前端与测试流程中的落地量化数据。',
    receiverQuestion: '想听 Alex 分享团队引入大模型 Agent 时最容易踩的前 3 个产品预期陷阱。',
    candidateSlots: ['10月25日 02:30 下午'],
    confirmedSlot: '10月25日 14:30 - 15:00 (双方各约15分钟)',
    status: 'SWAP_SCHEDULED',
    statusText: '已排期 (主题互换)',
    meetingType: '腾讯会议',
    meetingId: '772 190 321',
    meetingUrl: 'https://meeting.tencent.com/dm/772190321',
    createdAt: '2023-10-22 11:30',
    durationMinutes: 30
  },

  // 6. 已完成对谈 (带评价)
  {
    id: 'ord-completed-1',
    sessionType: 'ECOFFEE',
    orderNumber: 'ORD-20231012-3F4C',
    senderId: 'user-alex-chen',
    senderName: 'Alex Chen',
    senderTitle: 'AI 产品经理',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    receiverId: 'sophia-tang',
    receiverName: 'Sophia Tang',
    receiverTitle: '设计主管 & 体验策略师 @ Aura Studio',
    receiverAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    themeId: 'portfolio-review',
    themeTitle: '高级 UI/UX 作品集复盘与重塑',
    themeDescription: '逐页诊断你的设计作品集，突出业务闭环思维与核心设计说服力。',
    inquirerQuestion: '想请 Sophia 看看我负责的 AI Agent 对话界面的交互原型，探讨如何降低用户的首屏认知负荷。',
    confirmedSlot: '10月12日 10:00 - 10:30 (30分钟)',
    candidateSlots: ['10月12日 10:00 上午'],
    coffeeDrink: COFFEE_CATALOG[2], // 燕麦拿铁
    price: 28.00,
    paymentMethod: '微信支付',
    status: 'COMPLETED',
    statusText: '已完成',
    meetingType: '腾讯会议',
    meetingId: '902 148 201',
    meetingUrl: 'https://meeting.tencent.com/dm/902148201',
    createdAt: '2023-10-10 14:12',
    durationMinutes: 30,
    review: {
      rating: 5,
      comment: '非常有收获的 30 分钟！Sophia 从认知负荷和渐进披露角度给出了极具穿透力的修改建议，直击痛点。',
      tag: '话题契合·收获满满',
      createdAt: '2023-10-12 11:15'
    }
  }
];

export const INITIAL_SESSIONS: Order[] = INITIAL_ORDERS;
