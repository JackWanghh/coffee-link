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
}
