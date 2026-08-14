import Foundation

enum DemoData {
    static let snapshot = AppSnapshot(
        currentUser: currentUser,
        sharers: sharers,
        sessions: sessions
    )

    static let coffeeCatalog: [CoffeeDrink] = [
        drink("americano", "美式咖啡", "Americano", 15, "☕", "浓缩咖啡萃取加水，清爽明亮，唤醒思路。", "提神经典"),
        drink("classic-latte", "经典拿铁", "Classic Latte", 22, "🥛", "浓缩咖啡融合绵密鲜奶，温润醇厚。", "最受欢迎"),
        drink("oat-latte", "燕麦拿铁", "Oat Latte", 28, "🌾", "选用优质燕麦奶调制，麦香四溢，丝滑轻盈。", "植物基精选"),
        drink("flat-white", "澳白咖啡", "Flat White", 26, "☕", "双份精萃浓缩配薄奶沫，浓郁咖啡香气扑鼻。", "浓醇之选"),
        drink("coconut-latte", "生椰拿铁", "Raw Coconut Latte", 25, "🥥", "清新冷萃生椰乳与意式浓缩碰撞，香甜清润。", "清甜解腻"),
        drink("cold-brew", "冷萃咖啡", "Cold Brew", 24, "🧊", "12小时低温慢速冷萃，低酸柔顺，回甘持久。", "冰爽回甘"),
        drink("yirgacheffe-pourover", "耶加雪菲手冲", "Yirgacheffe Pour-Over", 32, "🫖", "埃塞俄比亚水洗豆手冲，柑橘茉莉花香，风味纯净。", "精品单品"),
        drink("matcha-latte", "宇治抹茶拿铁", "Matcha Latte", 25, "🍵", "精研宇治抹茶配鲜奶，微苦清香，无咖啡因负担。", "茶咖风味")
    ]

    static let currentUser = UserProfile(
        id: "user-alex-chen",
        name: "Alex Chen",
        title: "AI 产品经理",
        company: "TechFlow Lab",
        avatarURL: url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"),
        isVerified: true,
        totalChats: 14,
        rating: 4.9,
        replyRate: "95%",
        onTimeRate: "100%",
        phone: "+86 138****8888",
        isLoggedIn: true,
        isSharingOpen: true,
        signatureDrink: coffeeCatalog[2],
        acceptsTopicSwap: true,
        weeklySwapLimit: 3,
        totalEarnings: 840,
        completedSessionsCount: 8,
        completedSwapsCount: 3,
        meetingLink: url("https://meeting.tencent.com/dm/832910293"),
        myThemes: [
            theme("ai-product-growth", "AI Native 产品经理转型与 Agent 落地实战", "从传统互联网 PM 转型为 AI Native PM 的思维转变与企业级 Agent 项目落地复盘。", ["能力模型拆解", "AI Agent 实际立项避坑", "提示词与工作流设计"], ["算法底层数学推导", "CUDA 硬件算子开发"]),
            theme("growth-flywheel", "早期数字产品敏捷迭代与用户增长飞轮", "如何用最小成本验证产品假设，打造首批百人种子用户与自传播裂变回路。", ["冷启动增长路径", "MVP 指标漏斗定义", "用户真实访谈方法"], ["保证具体的融资或商务对接"])
        ]
    )

    static let sharers: [Sharer] = [
        Sharer(
            id: "elena-rodriguez", name: "Elena Rodriguez", title: "产品副总裁", company: "FinTech Global",
            avatarURL: url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"), industry: "互联网产品", isVerified: true,
            declarationNote: "职业信息由用户自行填写，平台未核验",
            highlights: ["领导旗舰移动银行应用的产品战略，扩展至超过1000万活跃用户。", "前顶级咨询公司高级产品经理，专注于数字化转型与支付产品创新。", "热衷于指导早期产品经理和建立包容性、高敏捷度的技术与业务团队。"],
            signatureDrink: coffeeCatalog[1], acceptsTopicSwap: true, weeklySwapLimit: 2, remainingSwapQuota: 2,
            themes: [
                theme("product-roadmap", "产品管理基础与路线图规划", "转型为产品经理或提升您当前的技能与商业路线图思考能力。", ["简历修改建议、面试关键策略、业务优先级判断方法。"], ["深度底层代码编写与具体系统调优。"]),
                theme("fintech-insights", "金融科技出海与合规洞察", "应对金融科技产品的复杂性、监管合规要求及多国家商业化增长。", ["监管合规路径、建立用户信任、风控与体验平衡。"], ["具体金融理财投资建议或荐股。"])
            ],
            nextAvailableText: "最早可约：明天 下午2点",
            availableDays: [
                day("10月24日", "周四", [slot("slot-elena-1", "09:00 上午"), slot("slot-elena-2", "10:30 上午"), slot("slot-elena-3", "02:00 下午")]),
                day("10月25日", "周五", [slot("slot-elena-4", "03:30 下午")]),
                day("10月26日", "周六", [], isFull: true),
                day("10月27日", "周日", [slot("slot-elena-5", "10:00 上午"), slot("slot-elena-6", "04:00 下午")])
            ],
            reviews: [review("rev-1", "James D.", "JD", "非常有见地的对谈！Elena 从一线面试官角度梳理了产品经理思维，给出的 3 点建议极其实用。", "3天前"), review("rev-2", "Lin K.", "LK", "30分钟聊得很透，对海外 FinTech 监管体系和产品增长框架拆解得非常清晰。", "1周前")],
            rating: 4.9, reviewCount: 12, swapFeedbackCount: 4, meetingLink: url("https://meeting.tencent.com/dm/832910293"), onTimeRate: "100%", responseMedianTime: "1.2小时"
        ),
        Sharer(
            id: "david-wu", name: "David Wu", title: "首席架构师 / 技术总监", company: "NextGen Cloud",
            avatarURL: url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"), industry: "研发与架构", isVerified: true,
            declarationNote: "职业信息由用户自行填写，平台未核验",
            highlights: ["主导亿级流量高并发云原生底座架构演进，支撑千万级实时长连接。", "从资深后端工程师向技术管理转型的十余年实操经验与团队组织思考。", "热衷于微服务治理、分布式容灾以及技术人的职业阶梯成长探讨。"],
            signatureDrink: coffeeCatalog[5], acceptsTopicSwap: true, weeklySwapLimit: 3, remainingSwapQuota: 1,
            themes: [
                theme("tech-leadership", "技术人转型管理与组织效能", "从骨干程序员转型为 Tech Lead 或技术管理者过程中的思维跃迁与沟通机制。", ["OKR 目标对齐、跨部门技术表达、骨干工程师激励技巧。"], ["提供具体猎头跳槽推荐。"]),
                theme("cloud-architecture", "高可用微服务与架构演进", "面对业务爆发增长，如何搭建弹性的高可用架构与容灾体系。", ["微服务拆分避坑、流量削峰策略、监控告警闭环。"], ["现场为您的私有仓库编写代码。"])
            ],
            nextAvailableText: "最早可约：后天 上午10点",
            availableDays: [day("10月25日", "周五", [slot("slot-david-1", "10:00 上午"), slot("slot-david-2", "02:30 下午")]), day("10月27日", "周日", [slot("slot-david-3", "03:00 下午")])],
            reviews: [review("rev-3", "Ethan Zhang", "EZ", "David 老师从真实大厂系统故障复盘讲起，对我们正在重构的微服务网关启发很大！", "5天前")],
            rating: 5, reviewCount: 8, swapFeedbackCount: 3, meetingLink: url("https://meeting.tencent.com/dm/772190321"), onTimeRate: "98%", responseMedianTime: "2.0小时"
        ),
        Sharer(
            id: "sophia-tang", name: "Sophia Tang", title: "设计主管 & 体验策略师", company: "Aura Studio",
            avatarURL: url("https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"), industry: "设计与体验", isVerified: true,
            declarationNote: "职业信息由用户自行填写，平台未核验",
            highlights: ["多次荣获德国红点奖及 iF 设计大奖，主导过数个全球级 B端及消费级体验系统。", "精通设计系统 (Design System) 搭建、跨平台交互规范及设计价值商业化量化。", "乐于与设计师探讨作品集破局、大厂设计晋升逻辑与出海本地化体验。"],
            signatureDrink: coffeeCatalog[2], acceptsTopicSwap: false, weeklySwapLimit: 0, remainingSwapQuota: 0,
            themes: [theme("portfolio-review", "高级 UI/UX 作品集复盘与重塑", "逐页诊断你的设计作品集，突出业务闭环思维与核心设计说服力。", ["作品集排版视觉重点、设计提案叙事逻辑、面试提问预演。"], ["替用户代做设计稿或直接交付源文件。"])],
            nextAvailableText: "最早可约：周五 上午11点", availableDays: [day("10月25日", "周五", [slot("slot-sophia-1", "11:00 上午"), slot("slot-sophia-2", "04:00 下午")])],
            reviews: [review("rev-4", "Mia W.", "MW", "针对我作品集里的 2 个 B 端案例提了非常犀利的改进点，改完之后面试通过率明显提升！", "2周前")],
            rating: 4.9, reviewCount: 15, swapFeedbackCount: 0, meetingLink: url("https://meeting.tencent.com/dm/902148201"), onTimeRate: "100%", responseMedianTime: "0.8小时"
        ),
        Sharer(
            id: "leo-zhang", name: "Leo Zhang", title: "出海增长负责人", company: "Global Scale Lab",
            avatarURL: url("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"), industry: "出海与商业化", isVerified: true,
            declarationNote: "职业信息由用户自行填写，平台未核验",
            highlights: ["操盘过 2 款日活数百万级出海应用在欧美及东南亚的冷启动与获客增长。", "擅长 ASO、海外买量投放与本地化变现矩阵搭建。", "提供关于海外市场选品、本地化合规及投放 ROI 优化的深度交流。"],
            signatureDrink: coffeeCatalog[4], acceptsTopicSwap: true, weeklySwapLimit: 3, remainingSwapQuota: 2,
            themes: [theme("growth-strategy", "App 出海冷启动与获客增长", "梳理海外各市场渠道红利与买量变现 ROI 评估模型，避开出海试错陷阱。", ["投放渠道拆解、素材测试框架、转化漏斗优化。"], ["承诺具体的下载量或变现金额。"])],
            nextAvailableText: "最早可约：周四 晚上8点", availableDays: [day("10月24日", "周四", [slot("slot-leo-1", "08:00 晚上")]), day("10月26日", "周六", [slot("slot-leo-2", "02:00 下午"), slot("slot-leo-3", "07:30 晚上")])],
            reviews: [review("rev-7", "Austin C.", "AC", "海外投放数据模型讲得非常透彻，帮我们避开了东南亚支付本地化的几个大坑。", "1周前")],
            rating: 5, reviewCount: 9, swapFeedbackCount: 2, meetingLink: url("https://meeting.tencent.com/dm/198302145"), onTimeRate: "96%", responseMedianTime: "1.8小时"
        )
    ]

    static let sessions: [ChatSession] = [
        session("ord-in-ecoffee-1", .coffee, "INV-20231024-9A1B", sender: ("user-lin-ke", "林可 (Lin Ke)", "资深互联网产品经理 @ 字节跳动", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"), receiver: currentUser, theme: currentUser.myThemes[0], question: "目前在大厂做电商推荐端产品3年，想在未来半年内转入大模型AI Agent方向。想请教在无深厚算法背景的情况下，如何从日常业务中发掘大模型落地场景并构建有说服力的实战作品集？", slots: ["10月25日 10:30 上午", "10月25日 03:30 下午", "10月26日 02:00 下午"], drink: coffeeCatalog[2], price: 28, status: .pendingResponse, statusLabel: "待我回应", meetingID: "832 910 293", createdAt: "2023-10-24 09:15"),
        session("ord-in-swap-1", .topicSwap, "SWP-20231024-4F2A", sender: ("user-marcus", "Marcus Vance", "产品负责人 / 敏捷教练 @ AgileTech", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"), receiver: currentUser, theme: currentUser.myThemes[0], themeDescription: "想了解 Alex 在实际落地 Agent 自动化流时，产品与工程团队如何拆分需求与指标？", question: "想了解企业内部 Agent 自动化落地时，产品如何衡量真实提效指标并与后端工程团队定义评估基准 (Evaluation Benchmark)？", slots: ["10月26日 04:00 下午", "10月27日 10:00 上午"], status: .pendingResponse, statusLabel: "待我回应 (互换)", meetingID: "832 910 293", createdAt: "2023-10-24 10:40", offeredTheme: ("marcus-theme-1", "扩展敏捷团队敏捷迭代与研发效能落地", "我愿意分享从10人到50人产研团队的敏捷迭代机制、Sprint 节奏把控与OKR双向对齐实操。"), offering: "可全面分享 50 人产研团队如何建立双周敏捷发版机制与跨职能回顾会议 (Retrospective) 的落地方案。"),
        session("ord-out-accepted-pay-1", .coffee, "INV-20231023-8B3C", sender: currentUser, receiver: sharers[0], theme: sharers[0].themes[0], question: "想请教如何向高管层清晰阐述中长期产品路线图，并在资源受限的情况下平衡核心技术债务与新商业功能交付？", slots: ["10月24日 02:00 下午"], confirmedSlot: "10月24日 (明天) 14:00 - 14:30", drink: coffeeCatalog[1], price: 22, status: .acceptedPendingPayment, statusLabel: "已接受，待付款", meetingID: "832 910 293", createdAt: "2023-10-23 18:20", paymentDeadline: "剩余 1小时42分"),
        session("ord-out-booked-1", .coffee, "ORD-20231024-7C9D", sender: currentUser, receiver: sharers[3], theme: sharers[3].themes[0], question: "我们正计划将一款生产力 AI 移动端应用推向北美市场，想了解在预算有限的情况下，如何利用 TikTok / ProductHunt 做好初期的冷启动与 ASO 关键词布局？", slots: ["10月24日 08:00 晚上"], confirmedSlot: "10月24日 20:00 - 20:30 (30分钟)", drink: coffeeCatalog[4], price: 25, status: .booked, statusLabel: "即将开始", meetingID: "198 302 145", createdAt: "2023-10-23 14:10", paymentMethod: .wechat),
        session("ord-swap-scheduled-1", .topicSwap, "SWP-20231025-1E8F", sender: currentUser, receiver: sharers[1], theme: sharers[1].themes[0], question: "想向 David 探讨技术总监如何评估 AI 新技术对团队研发效能的真实影响，以及如何说服管理层分配探索预算？", slots: ["10月25日 02:30 下午"], confirmedSlot: "10月25日 14:30 - 15:00 (双方各约15分钟)", status: .swapScheduled, statusLabel: "已排期 (主题互换)", meetingID: "772 190 321", createdAt: "2023-10-22 11:30", offeredTheme: (currentUser.myThemes[0].id, currentUser.myThemes[0].title, nil), offering: "为 David 分享当前业界主流 AI Coding 工具在前端与测试流程中的落地量化数据。", receiverQuestion: "想听 Alex 分享团队引入大模型 Agent 时最容易踩的前 3 个产品预期陷阱。"),
        session("ord-completed-1", .coffee, "ORD-20231012-3F4C", sender: currentUser, receiver: sharers[2], theme: sharers[2].themes[0], question: "想请 Sophia 看看我负责的 AI Agent 对话界面的交互原型，探讨如何降低用户的首屏认知负荷。", slots: ["10月12日 10:00 上午"], confirmedSlot: "10月12日 10:00 - 10:30 (30分钟)", drink: coffeeCatalog[2], price: 28, status: .completed, statusLabel: "已完成", meetingID: "902 148 201", createdAt: "2023-10-10 14:12", paymentMethod: .wechat, review: SessionReview(rating: 5, comment: "非常有收获的 30 分钟！Sophia 从认知负荷和渐进披露角度给出了极具穿透力的修改建议，直击痛点。", tag: "话题契合·收获满满", createdAt: "2023-10-12 11:15"))
    ]

    private static func drink(_ id: String, _ name: String, _ nameEn: String, _ price: Decimal, _ icon: String, _ description: String, _ tag: String) -> CoffeeDrink {
        CoffeeDrink(id: id, name: name, nameEn: nameEn, price: price, icon: icon, description: description, tag: tag)
    }

    private static func theme(_ id: String, _ title: String, _ description: String, _ includes: [String], _ excludes: [String]) -> ChatTheme {
        ChatTheme(id: id, title: title, description: description, durationMinutes: 30, includes: includes, excludes: excludes)
    }

    private static func slot(_ id: String, _ label: String) -> AvailableSlot { AvailableSlot(id: id, label: label) }

    private static func day(_ date: String, _ dayOfWeek: String, _ slots: [AvailableSlot], isFull: Bool = false) -> AvailabilityDay {
        AvailabilityDay(date: date, dayOfWeek: dayOfWeek, slotsCount: slots.count, isFull: isFull, slots: slots)
    }

    private static func review(_ id: String, _ authorName: String, _ initials: String, _ comment: String, _ date: String) -> Review {
        Review(id: id, authorName: authorName, authorInitials: initials, rating: 5, comment: comment, date: date)
    }

    private static func url(_ string: String) -> URL? { URL(string: string) }

    private static func session(
        _ id: String, _ type: SessionType, _ orderNumber: String,
        sender: (String, String, String, String), receiver: UserProfile, theme: ChatTheme, themeDescription: String? = nil, question: String, slots: [String],
        confirmedSlot: String? = nil, drink: CoffeeDrink? = nil, price: Decimal? = nil, status: SessionStatus, statusLabel: String,
        meetingID: String, createdAt: String, paymentDeadline: String? = nil, paymentMethod: PaymentMethod? = nil,
        offeredTheme: (String, String, String?)? = nil, offering: String? = nil, receiverQuestion: String? = nil, review: SessionReview? = nil
    ) -> ChatSession {
        ChatSession(id: id, type: type, orderNumber: orderNumber, senderID: sender.0, senderName: sender.1, senderTitle: sender.2, senderAvatarURL: url(sender.3), receiverID: receiver.id, receiverName: receiver.name, receiverTitle: "\(receiver.title) @ \(receiver.company)", receiverAvatarURL: receiver.avatarURL, themeID: theme.id, themeTitle: theme.title, themeDescription: themeDescription ?? theme.description, offeredThemeID: offeredTheme?.0, offeredThemeTitle: offeredTheme?.1, offeredThemeDescription: offeredTheme?.2, question: question, offering: offering, receiverQuestion: receiverQuestion, candidateSlots: slots, confirmedSlot: confirmedSlot, coffeeDrink: drink, price: price, paymentMethod: paymentMethod, paymentDeadline: paymentDeadline, status: status, statusLabel: statusLabel, declineReason: nil, meetingType: "腾讯会议", meetingID: meetingID, meetingLink: receiver.meetingLink, createdAt: createdAt, durationMinutes: 30, review: review, complaintReason: nil)
    }

    private static func session(
        _ id: String, _ type: SessionType, _ orderNumber: String,
        sender: UserProfile, receiver: Sharer, theme: ChatTheme, question: String, slots: [String],
        confirmedSlot: String? = nil, drink: CoffeeDrink? = nil, price: Decimal? = nil, status: SessionStatus, statusLabel: String,
        meetingID: String, createdAt: String, paymentDeadline: String? = nil, paymentMethod: PaymentMethod? = nil,
        offeredTheme: (String, String, String?)? = nil, offering: String? = nil, receiverQuestion: String? = nil, review: SessionReview? = nil
    ) -> ChatSession {
        ChatSession(id: id, type: type, orderNumber: orderNumber, senderID: sender.id, senderName: sender.name, senderTitle: "\(sender.title) @ \(sender.company)", senderAvatarURL: sender.avatarURL, receiverID: receiver.id, receiverName: receiver.name, receiverTitle: "\(receiver.title) @ \(receiver.company)", receiverAvatarURL: receiver.avatarURL, themeID: theme.id, themeTitle: theme.title, themeDescription: theme.description, offeredThemeID: offeredTheme?.0, offeredThemeTitle: offeredTheme?.1, offeredThemeDescription: offeredTheme?.2, question: question, offering: offering, receiverQuestion: receiverQuestion, candidateSlots: slots, confirmedSlot: confirmedSlot, coffeeDrink: drink, price: price, paymentMethod: paymentMethod, paymentDeadline: paymentDeadline, status: status, statusLabel: statusLabel, declineReason: nil, meetingType: "腾讯会议", meetingID: meetingID, meetingLink: receiver.meetingLink, createdAt: createdAt, durationMinutes: 30, review: review, complaintReason: nil)
    }
}
