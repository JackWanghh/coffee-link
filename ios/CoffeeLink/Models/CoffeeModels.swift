import Foundation

enum AppearanceThemeID: String, Codable, CaseIterable, Identifiable, Sendable {
    case obsidian
    case latte
    case cyber
    case emerald
    case nordic
    case rose

    var id: String { rawValue }

    var name: String {
        switch self {
        case .obsidian: "暗夜流光 (默认)"
        case .latte: "暖阳燕麦 (经典浅色)"
        case .cyber: "赛博霓虹 (极客紫青)"
        case .emerald: "翡翠松林 (雅致绿意)"
        case .nordic: "极简雪原 (北欧亮色)"
        case .rose: "落日暮霞 (暗夜玫瑰)"
        }
    }

    var subtitle: String {
        switch self {
        case .obsidian: "高奢曜黑与橙红流光"
        case .latte: "温润燕麦米白与原木焦糖"
        case .cyber: "深空魅影与霓虹电光流光"
        case .emerald: "墨玉深绿与晶莹薄荷青"
        case .nordic: "纯净冰原白与科技湛蓝"
        case .rose: "深邃魅红与晚霞罗兰粉"
        }
    }

    var isLight: Bool { self == .latte || self == .nordic }
}

struct CoffeeDrink: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var name: String
    var nameEn: String
    var price: Decimal
    var icon: String
    var description: String
    var tag: String?
}

struct ChatTheme: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var title: String
    var description: String
    var durationMinutes: Int
    var includes: [String]
    var excludes: [String]
}

struct Review: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var authorName: String
    var authorInitials: String
    var rating: Int
    var comment: String
    var date: String
    var isSwapReview: Bool

    init(
        id: String,
        authorName: String,
        authorInitials: String,
        rating: Int,
        comment: String,
        date: String,
        isSwapReview: Bool = false
    ) {
        self.id = id
        self.authorName = authorName
        self.authorInitials = authorInitials
        self.rating = rating
        self.comment = comment
        self.date = date
        self.isSwapReview = isSwapReview
    }
}

struct AvailableSlot: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var label: String
    var isAvailable: Bool

    init(id: String, label: String, isAvailable: Bool = true) {
        self.id = id
        self.label = label
        self.isAvailable = isAvailable
    }

    private enum CodingKeys: String, CodingKey { case id, label, isAvailable }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        label = try container.decode(String.self, forKey: .label)
        isAvailable = try container.decodeIfPresent(Bool.self, forKey: .isAvailable) ?? true
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(label, forKey: .label)
        try container.encode(isAvailable, forKey: .isAvailable)
    }
}

struct AvailabilityDay: Codable, Hashable, Identifiable, Sendable {
    var id: String { date }
    var date: String
    var dayOfWeek: String
    var slotsCount: Int
    var isFull: Bool
    var slots: [AvailableSlot]
}

struct Sharer: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var name: String
    var title: String
    var company: String
    var avatarURL: URL?
    var industry: String?
    var isVerified: Bool
    var declarationNote: String
    var highlights: [String]
    var signatureDrink: CoffeeDrink
    var acceptsTopicSwap: Bool
    var weeklySwapLimit: Int
    var remainingSwapQuota: Int
    var themes: [ChatTheme]
    var nextAvailableText: String
    var availableDays: [AvailabilityDay]
    var reviews: [Review]
    var rating: Double
    var reviewCount: Int
    var swapFeedbackCount: Int
    var meetingLink: URL?
    var onTimeRate: String
    var responseMedianTime: String

    func slot(id: String) -> AvailableSlot? {
        availableDays.lazy.flatMap(\.slots).first { $0.id == id }
    }
}

struct UserProfile: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var name: String
    var title: String
    var company: String
    var avatarURL: URL?
    var isVerified: Bool
    var totalChats: Int
    var rating: Double
    var replyRate: String
    var onTimeRate: String
    var phone: String
    var isLoggedIn: Bool
    var isSharingOpen: Bool
    var signatureDrink: CoffeeDrink
    var acceptsTopicSwap: Bool
    var weeklySwapLimit: Int
    var totalEarnings: Decimal
    var completedSessionsCount: Int
    var completedSwapsCount: Int
    var meetingLink: URL?
    var myThemes: [ChatTheme]
    var availableSlots: [AvailableSlot]
    var availableSlotsFieldWasPresent: Bool
    var appearanceThemeID: AppearanceThemeID
    var autoCalendarSync: Bool
    var defaultMeetingReady: Bool
    var hapticsEnabled: Bool
    var pendingEarnings: Decimal
    var settledEarnings: Decimal

    init(
        id: String,
        name: String,
        title: String,
        company: String,
        avatarURL: URL?,
        isVerified: Bool,
        totalChats: Int,
        rating: Double,
        replyRate: String,
        onTimeRate: String,
        phone: String,
        isLoggedIn: Bool,
        isSharingOpen: Bool,
        signatureDrink: CoffeeDrink,
        acceptsTopicSwap: Bool,
        weeklySwapLimit: Int,
        totalEarnings: Decimal,
        completedSessionsCount: Int,
        completedSwapsCount: Int,
        meetingLink: URL?,
        myThemes: [ChatTheme],
        availableSlots: [AvailableSlot],
        appearanceThemeID: AppearanceThemeID = .obsidian,
        autoCalendarSync: Bool = true,
        defaultMeetingReady: Bool = true,
        hapticsEnabled: Bool = true,
        pendingEarnings: Decimal = 140,
        settledEarnings: Decimal = 700
    ) {
        self.id = id
        self.name = name
        self.title = title
        self.company = company
        self.avatarURL = avatarURL
        self.isVerified = isVerified
        self.totalChats = totalChats
        self.rating = rating
        self.replyRate = replyRate
        self.onTimeRate = onTimeRate
        self.phone = phone
        self.isLoggedIn = isLoggedIn
        self.isSharingOpen = isSharingOpen
        self.signatureDrink = signatureDrink
        self.acceptsTopicSwap = acceptsTopicSwap
        self.weeklySwapLimit = weeklySwapLimit
        self.totalEarnings = totalEarnings
        self.completedSessionsCount = completedSessionsCount
        self.completedSwapsCount = completedSwapsCount
        self.meetingLink = meetingLink
        self.myThemes = myThemes
        self.availableSlots = availableSlots
        self.availableSlotsFieldWasPresent = true
        self.appearanceThemeID = appearanceThemeID
        self.autoCalendarSync = autoCalendarSync
        self.defaultMeetingReady = defaultMeetingReady
        self.hapticsEnabled = hapticsEnabled
        self.pendingEarnings = pendingEarnings
        self.settledEarnings = settledEarnings
    }

    private enum CodingKeys: String, CodingKey {
        case id, name, title, company, avatarURL, isVerified, totalChats, rating, replyRate, onTimeRate, phone, isLoggedIn, isSharingOpen, signatureDrink, acceptsTopicSwap, weeklySwapLimit, totalEarnings, completedSessionsCount, completedSwapsCount, meetingLink, myThemes, availableSlots, appearanceThemeID, autoCalendarSync, defaultMeetingReady, hapticsEnabled, pendingEarnings, settledEarnings
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        title = try container.decode(String.self, forKey: .title)
        company = try container.decode(String.self, forKey: .company)
        avatarURL = try container.decodeIfPresent(URL.self, forKey: .avatarURL)
        isVerified = try container.decode(Bool.self, forKey: .isVerified)
        totalChats = try container.decode(Int.self, forKey: .totalChats)
        rating = try container.decode(Double.self, forKey: .rating)
        replyRate = try container.decode(String.self, forKey: .replyRate)
        onTimeRate = try container.decode(String.self, forKey: .onTimeRate)
        phone = try container.decode(String.self, forKey: .phone)
        isLoggedIn = try container.decode(Bool.self, forKey: .isLoggedIn)
        isSharingOpen = try container.decode(Bool.self, forKey: .isSharingOpen)
        signatureDrink = try container.decode(CoffeeDrink.self, forKey: .signatureDrink)
        acceptsTopicSwap = try container.decode(Bool.self, forKey: .acceptsTopicSwap)
        weeklySwapLimit = try container.decode(Int.self, forKey: .weeklySwapLimit)
        totalEarnings = try container.decode(Decimal.self, forKey: .totalEarnings)
        completedSessionsCount = try container.decode(Int.self, forKey: .completedSessionsCount)
        completedSwapsCount = try container.decode(Int.self, forKey: .completedSwapsCount)
        meetingLink = try container.decodeIfPresent(URL.self, forKey: .meetingLink)
        myThemes = try container.decode([ChatTheme].self, forKey: .myThemes)
        availableSlotsFieldWasPresent = container.contains(.availableSlots)
        availableSlots = try container.decodeIfPresent([AvailableSlot].self, forKey: .availableSlots) ?? []
        appearanceThemeID = try container.decodeIfPresent(AppearanceThemeID.self, forKey: .appearanceThemeID) ?? .obsidian
        autoCalendarSync = try container.decodeIfPresent(Bool.self, forKey: .autoCalendarSync) ?? true
        defaultMeetingReady = try container.decodeIfPresent(Bool.self, forKey: .defaultMeetingReady) ?? true
        hapticsEnabled = try container.decodeIfPresent(Bool.self, forKey: .hapticsEnabled) ?? true
        pendingEarnings = try container.decodeIfPresent(Decimal.self, forKey: .pendingEarnings) ?? 140
        settledEarnings = try container.decodeIfPresent(Decimal.self, forKey: .settledEarnings) ?? 700
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(title, forKey: .title)
        try container.encode(company, forKey: .company)
        try container.encodeIfPresent(avatarURL, forKey: .avatarURL)
        try container.encode(isVerified, forKey: .isVerified)
        try container.encode(totalChats, forKey: .totalChats)
        try container.encode(rating, forKey: .rating)
        try container.encode(replyRate, forKey: .replyRate)
        try container.encode(onTimeRate, forKey: .onTimeRate)
        try container.encode(phone, forKey: .phone)
        try container.encode(isLoggedIn, forKey: .isLoggedIn)
        try container.encode(isSharingOpen, forKey: .isSharingOpen)
        try container.encode(signatureDrink, forKey: .signatureDrink)
        try container.encode(acceptsTopicSwap, forKey: .acceptsTopicSwap)
        try container.encode(weeklySwapLimit, forKey: .weeklySwapLimit)
        try container.encode(totalEarnings, forKey: .totalEarnings)
        try container.encode(completedSessionsCount, forKey: .completedSessionsCount)
        try container.encode(completedSwapsCount, forKey: .completedSwapsCount)
        try container.encodeIfPresent(meetingLink, forKey: .meetingLink)
        try container.encode(myThemes, forKey: .myThemes)
        try container.encode(availableSlots, forKey: .availableSlots)
        try container.encode(appearanceThemeID, forKey: .appearanceThemeID)
        try container.encode(autoCalendarSync, forKey: .autoCalendarSync)
        try container.encode(defaultMeetingReady, forKey: .defaultMeetingReady)
        try container.encode(hapticsEnabled, forKey: .hapticsEnabled)
        try container.encode(pendingEarnings, forKey: .pendingEarnings)
        try container.encode(settledEarnings, forKey: .settledEarnings)
    }

    func availableSlot(id: String) -> AvailableSlot? {
        availableSlots.first { $0.id == id && $0.isAvailable }
    }

    var sharingReadinessItems: [(title: String, isComplete: Bool)] {
        [
            ("实名认证", isVerified),
            ("公开资料", !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !company.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty),
            ("分享主题", !myThemes.isEmpty && myThemes.count <= 3),
            ("签名饮品", !signatureDrink.id.isEmpty),
            ("可约时段", availableSlots.contains(where: \.isAvailable)),
            ("腾讯会议", meetingLink?.scheme == "https" && meetingLink?.host == "meeting.tencent.com")
        ]
    }

    var isSharingReady: Bool { sharingReadinessItems.allSatisfy(\.isComplete) }
}
