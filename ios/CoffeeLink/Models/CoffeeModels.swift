import Foundation

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
        availableSlots: [AvailableSlot]
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
    }

    private enum CodingKeys: String, CodingKey {
        case id, name, title, company, avatarURL, isVerified, totalChats, rating, replyRate, onTimeRate, phone, isLoggedIn, isSharingOpen, signatureDrink, acceptsTopicSwap, weeklySwapLimit, totalEarnings, completedSessionsCount, completedSwapsCount, meetingLink, myThemes, availableSlots
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
    }

    func availableSlot(id: String) -> AvailableSlot? {
        availableSlots.first { $0.id == id && $0.isAvailable }
    }
}
