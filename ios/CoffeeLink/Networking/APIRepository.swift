import Foundation

struct SharingCenterDTO: Decodable {
    struct SharingUserDTO: Decodable {
        let id: String
        let phone: String
        let name: String
        let title: String
        let company: String
        let industry: String?
        let avatarUrl: String?
        let isVerified: Bool
        let declarationNote: String
        let highlights: [String]
        let isSharingOpen: Bool
        let signatureDrinkId: String?
        let acceptsTopicSwap: Bool
        let weeklySwapLimit: Int
        let appearanceThemeId: String?
        let meetingLink: String?
        let themes: [ThemeDTO]?
        let slots: [SlotDTO]?
    }

    struct IncomeDTO: Decodable {
        let pendingCents: Int
        let settledCents: Int
        let totalCents: Int
    }

    let user: SharingUserDTO
    let income: IncomeDTO?
}

struct APIRepository {
    var client: APIClient
    private let tokenStore = KeychainTokenStore()

    private func jsonBody(_ value: [String: Any]) -> Data? {
        try? JSONSerialization.data(withJSONObject: value)
    }

    private let demoSessionIDByOrder: [String: String] = [
        "INV-20231024-9A1B": "ord-in-ecoffee-1",
        "SWP-20231024-4F2A": "ord-in-swap-1",
        "INV-20231023-8B3C": "ord-out-accepted-pay-1",
        "ORD-20231024-7C9D": "ord-out-booked-1",
        "SWP-20231025-1E8F": "ord-swap-scheduled-1",
        "ORD-20231012-3F4C": "ord-completed-1",
    ]
    private let demoSharerIDByName: [String: String] = [
        "Elena Rodriguez": "elena-rodriguez",
        "David Wu": "david-wu",
        "Sophia Tang": "sophia-tang",
        "Leo Zhang": "leo-zhang",
    ]
    private let demoThemeIDByTitle: [String: String] = [
        "AI Native 产品经理转型与 Agent 落地实战": "ai-product-growth",
        "早期数字产品敏捷迭代与用户增长飞轮": "growth-flywheel",
        "产品管理基础与路线图规划": "product-roadmap",
        "金融科技出海与合规洞察": "fintech-insights",
        "技术人转型管理与组织效能": "tech-leadership",
        "高可用微服务与架构演进": "cloud-architecture",
        "高级 UI/UX 作品集复盘与重塑": "portfolio-review",
        "App 出海冷启动与获客增长": "growth-strategy",
    ]

    func bootstrap() async throws -> AppSnapshot {
        let me: UserDTO = try await client.request("GET", "/me")
        let center: SharingCenterDTO = try await client.request("GET", "/me/sharing-center")
        let sharers: PagedSharerDTO = try await client.request("GET", "/sharers")
        let sessions: SessionListDTO = try await client.request("GET", "/sessions")
        let drinks: [DrinkDTO] = try await client.request("GET", "/coffee-drinks")
        return AppSnapshot(
            currentUser: mapUser(me, center: center, drinks: drinks),
            sharers: sharers.items.map(mapSharer),
            sessions: sessions.items.map(mapSession)
        )
    }

    // MARK: - 映射

    private func mapUser(_ dto: UserDTO, center: SharingCenterDTO, drinks: [DrinkDTO]) -> UserProfile {
        let isDemoAlex = dto.phone == "13800000001"
        let signatureDrink = drinks.first { $0.id == dto.signatureDrinkId }.map(mapDrink)
            ?? drinks.first.map(mapDrink)
            ?? DemoData.coffeeCatalog[2]
        return UserProfile(
            id: "user-alex-chen",
            name: dto.name,
            title: dto.title,
            company: dto.company,
            avatarURL: dto.avatarUrl.flatMap(URL.init(string:)),
            isVerified: dto.isVerified,
            totalChats: isDemoAlex ? 14 : (dto.totalChats ?? 0),
            rating: isDemoAlex ? 4.9 : (dto.rating ?? 0),
            replyRate: isDemoAlex ? "95%" : (dto.replyRate ?? "100%"),
            onTimeRate: isDemoAlex ? "100%" : (dto.onTimeRate ?? "100%"),
            phone: isDemoAlex ? "+86 138****8888" : maskPhone(dto.phone),
            isLoggedIn: true,
            isSharingOpen: dto.isSharingOpen,
            signatureDrink: signatureDrink,
            acceptsTopicSwap: dto.acceptsTopicSwap,
            weeklySwapLimit: dto.weeklySwapLimit,
            totalEarnings: isDemoAlex ? 840 : centsToDecimal(center.income?.totalCents ?? 0),
            completedSessionsCount: isDemoAlex ? 8 : (dto.completedSessionsCount ?? 0),
            completedSwapsCount: isDemoAlex ? 3 : (dto.completedSwapsCount ?? 0),
            meetingLink: dto.meetingLink.flatMap(URL.init(string:)),
            myThemes: (center.user.themes ?? []).map(mapTheme),
            availableSlots: (center.user.slots ?? []).map(mapSlot),
            appearanceThemeID: AppearanceThemeID(rawValue: dto.appearanceThemeId ?? "obsidian") ?? .obsidian,
            autoCalendarSync: dto.autoCalendarSync ?? true,
            defaultMeetingReady: dto.defaultMeetingReady ?? true,
            hapticsEnabled: dto.hapticsEnabled ?? true,
            pendingEarnings: isDemoAlex ? 140 : centsToDecimal(center.income?.pendingCents ?? 0),
            settledEarnings: isDemoAlex ? 700 : centsToDecimal(center.income?.settledCents ?? 0)
        )
    }

    private func mapSharer(_ dto: SharerDTO) -> Sharer {
        Sharer(
            id: demoSharerIDByName[dto.name] ?? dto.id,
            name: dto.name,
            title: dto.title,
            company: dto.company,
            avatarURL: dto.avatarUrl.flatMap(URL.init(string:)),
            industry: dto.industry,
            isVerified: dto.isVerified,
            declarationNote: dto.declarationNote,
            highlights: dto.highlights,
            signatureDrink: mapDrink(dto.signatureDrink),
            acceptsTopicSwap: dto.acceptsTopicSwap,
            weeklySwapLimit: dto.weeklySwapLimit,
            remainingSwapQuota: dto.remainingSwapQuota,
            themes: dto.themes.map(mapTheme),
            nextAvailableText: dto.nextAvailableText,
            availableDays: dto.availableDays.map(mapAvailabilityDay),
            reviews: dto.reviews.map(mapReview),
            rating: dto.rating,
            reviewCount: dto.reviewCount,
            swapFeedbackCount: dto.swapFeedbackCount,
            meetingLink: nil,
            onTimeRate: dto.onTimeRate,
            responseMedianTime: dto.responseMedianTime ?? "1.5小时"
        )
    }

    private func mapSession(_ dto: SessionDTO) -> ChatSession {
        ChatSession(
            id: demoSessionIDByOrder[dto.orderNumber] ?? dto.id,
            type: dto.type == "coffee" ? .coffee : .topicSwap,
            orderNumber: dto.orderNumber,
            senderID: dto.senderID,
            senderName: dto.senderName,
            senderTitle: dto.senderTitle,
            senderAvatarURL: dto.senderAvatarURL.flatMap(URL.init(string:)),
            receiverID: dto.receiverID,
            receiverName: dto.receiverName,
            receiverTitle: dto.receiverTitle,
            receiverAvatarURL: dto.receiverAvatarURL.flatMap(URL.init(string:)),
            themeID: demoThemeIDByTitle[dto.theme.title] ?? dto.theme.id,
            themeTitle: dto.theme.title,
            themeDescription: dto.theme.description,
            offeredThemeID: dto.offeredTheme.map { demoThemeIDByTitle[$0.title] ?? $0.id },
            offeredThemeTitle: dto.offeredTheme?.title,
            offeredThemeDescription: dto.offeredTheme?.description,
            question: dto.question,
            offering: dto.offering,
            receiverQuestion: dto.receiverQuestion,
            candidateSlots: dto.candidateSlots,
            confirmedSlotID: nil,
            confirmedSlot: dto.confirmedSlot,
            coffeeDrink: dto.coffeeDrink.map(mapDrink),
            price: dto.priceCents.map(centsToDecimal),
            paymentMethod: PaymentMethod(rawValue: dto.paymentMethod ?? ""),
            paymentDeadline: dto.paymentDeadlineAt.map(formatDeadline),
            status: SessionStatus(rawValue: dto.status) ?? .pendingResponse,
            statusLabel: dto.statusLabel,
            declineReason: dto.declineReason,
            meetingType: dto.meetingType,
            meetingID: dto.meetingId ?? meetingID(from: dto.meetingLink) ?? "",
            meetingLink: dto.meetingLink.flatMap(URL.init(string:)),
            createdAt: Self.sessionDateFormatter.string(from: dto.createdAt),
            durationMinutes: dto.durationMinutes,
            review: nil,
            complaintReason: nil
        )
    }

    private func mapDrink(_ dto: DrinkDTO) -> CoffeeDrink {
        CoffeeDrink(
            id: dto.code,
            name: dto.name,
            nameEn: dto.nameEn,
            price: centsToDecimal(dto.priceCents),
            icon: dto.icon,
            description: dto.description,
            tag: dto.tag
        )
    }

    private func mapTheme(_ dto: ThemeDTO) -> ChatTheme {
        ChatTheme(
            id: demoThemeIDByTitle[dto.title] ?? dto.id,
            title: dto.title,
            description: dto.description,
            durationMinutes: dto.durationMinutes,
            includes: dto.includes,
            excludes: dto.excludes
        )
    }

    private func mapSlot(_ dto: SlotDTO) -> AvailableSlot {
        AvailableSlot(id: dto.id, label: dto.label, isAvailable: dto.isAvailable)
    }

    private func mapAvailabilityDay(_ dto: AvailabilityDayDTO) -> AvailabilityDay {
        AvailabilityDay(
            date: dto.date,
            dayOfWeek: dto.dayOfWeek,
            slotsCount: dto.slotsCount,
            isFull: dto.isFull,
            slots: dto.slots.map(mapSlot)
        )
    }

    private func mapReview(_ dto: ReviewDTO) -> Review {
        Review(
            id: dto.id,
            authorName: dto.authorName,
            authorInitials: dto.authorInitials,
            rating: dto.rating,
            comment: dto.comment,
            date: dto.date,
            isSwapReview: dto.isSwapReview
        )
    }

    private func maskPhone(_ phone: String) -> String {
        guard phone.count == 11 else { return phone }
        return "+86 \(phone.prefix(3))****\(phone.suffix(4))"
    }

    private func centsToDecimal(_ cents: Int) -> Decimal {
        Decimal(cents) / 100
    }

    private func formatDeadline(_ date: Date) -> String {
        let remaining = max(Int(date.timeIntervalSinceNow), 0)
        let hours = remaining / 3600
        let minutes = (remaining % 3600) / 60
        return hours > 0 ? "剩余 \(hours)小时\(minutes)分" : "剩余 \(minutes)分"
    }

    private func meetingID(from link: String?) -> String? {
        guard let link else { return nil }
        return link.split(separator: "/").last.map(String.init)
    }

    private static let sessionDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        formatter.locale = Locale(identifier: "zh_CN")
        return formatter
    }()

    // MARK: - 动作

    mutating func login(phone: String, password: String) async throws {
        let token: TokenDTO = try await client.request("POST", "/auth/login", body: jsonBody(["phone": phone, "password": password]))
        apply(token: token)
    }

    func sendSms(phone: String, purpose: String) async throws {
        let _: EmptyDTO = try await client.request("POST", "/auth/sms/send", body: jsonBody(["phone": phone, "purpose": purpose]))
    }

    mutating func register(phone: String, code: String, password: String) async throws {
        let token: TokenDTO = try await client.request("POST", "/auth/register", body: jsonBody(["phone": phone, "code": code, "password": password, "agreed": true]))
        apply(token: token)
    }

    func resetPassword(phone: String, code: String, newPassword: String) async throws {
        let _: EmptyDTO = try await client.request("POST", "/auth/password/reset", body: jsonBody(["phone": phone, "code": code, "newPassword": newPassword]))
    }

    func createCoffee(sharerId: String, themeId: String, question: String, slotIds: [String]) async throws {
        let _: EmptyDTO = try await client.request("POST", "/invitations/coffee", body: jsonBody(["sharerId": sharerId, "themeId": themeId, "question": question, "slotIds": slotIds]))
    }

    func createSwap(sharerId: String, requestedThemeId: String, offeredThemeId: String, question: String, offering: String, slotIds: [String]) async throws {
        let _: EmptyDTO = try await client.request("POST", "/invitations/topic-swaps", body: jsonBody(["sharerId": sharerId, "requestedThemeId": requestedThemeId, "offeredThemeId": offeredThemeId, "question": question, "offering": offering, "slotIds": slotIds]))
    }

    func accept(sessionId: String, confirmedSlotId: String, receiverQuestion: String?) async throws {
        var payload: [String: Any] = ["confirmedSlotId": confirmedSlotId]
        if let receiverQuestion {
            payload["receiverQuestion"] = receiverQuestion
        }
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/accept", body: jsonBody(payload))
    }

    func decline(sessionId: String, reason: String) async throws {
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/decline", body: jsonBody(["reason": reason]))
    }

    func cancel(sessionId: String) async throws {
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/cancel")
    }

    func pay(sessionId: String) async throws {
        let _: PaymentStartDTO = try await client.request("POST", "/sessions/\(sessionId)/payments", body: jsonBody(["method": "wechat", "idempotencyKey": "ios-\(UUID().uuidString)"]))
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/payments/callback", body: jsonBody(["providerTradeNo": "IOS-\(UUID().uuidString)", "status": "success", "signature": "mock"]))
    }

    func review(sessionId: String, rating: Int, comment: String, tag: String?) async throws {
        var payload: [String: Any] = ["rating": rating, "comment": comment]
        if let tag {
            payload["tag"] = tag
        }
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/review", body: jsonBody(payload))
    }

    func complaint(sessionId: String, category: String, description: String) async throws {
        let _: EmptyDTO = try await client.request("POST", "/sessions/\(sessionId)/complaint", body: jsonBody(["category": category, "description": description]))
    }

    func updateProfile(name: String, title: String, company: String) async throws {
        let _: EmptyDTO = try await client.request("PUT", "/me/profile", body: jsonBody(["name": name, "title": title, "company": company]))
    }

    func verifyIdentity() async throws {
        let _: EmptyDTO = try await client.request("POST", "/me/verification")
    }

    private mutating func apply(token: TokenDTO) {
        client.accessToken = token.accessToken
        client.refreshToken = token.refreshToken
        tokenStore.save(token.accessToken, key: "access")
        tokenStore.save(token.refreshToken, key: "refresh")
    }
}

struct EmptyDTO: Decodable {}

struct PaymentStartDTO: Decodable {
    let payment: PaymentDTO
}

struct PaymentDTO: Decodable {
    let id: String
    let status: String
}
