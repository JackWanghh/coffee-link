import Foundation

struct TokenDTO: Decodable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
}

struct DrinkDTO: Decodable {
    let id: String
    let code: String
    let name: String
    let nameEn: String
    let priceCents: Int
    let icon: String
    let description: String
    let tag: String?
}

struct ThemeDTO: Decodable {
    let id: String
    let title: String
    let description: String
    let durationMinutes: Int
    let includes: [String]
    let excludes: [String]
}

struct SlotDTO: Decodable {
    let id: String
    let label: String
    let isAvailable: Bool
    let slotAt: Date?
}

struct AvailabilityDayDTO: Decodable {
    let date: String
    let dayOfWeek: String
    let slotsCount: Int
    let isFull: Bool
    let slots: [SlotDTO]
}

struct ReviewDTO: Decodable {
    let id: String
    let authorName: String
    let authorInitials: String
    let rating: Int
    let comment: String
    let date: String
    let isSwapReview: Bool
}

struct SharerDTO: Decodable {
    let id: String
    let name: String
    let title: String
    let company: String
    let avatarUrl: String?
    let industry: String?
    let isVerified: Bool
    let declarationNote: String
    let highlights: [String]
    let signatureDrink: DrinkDTO
    let acceptsTopicSwap: Bool
    let weeklySwapLimit: Int
    let remainingSwapQuota: Int
    let themes: [ThemeDTO]
    let nextAvailableText: String
    let slots: [SlotDTO]
    let availableDays: [AvailabilityDayDTO]
    let meetingLink: String?
    let rating: Double
    let reviewCount: Int
    let swapFeedbackCount: Int
    let onTimeRate: String
    let responseMedianTime: String?
    let reviews: [ReviewDTO]
}

struct SessionThemeDTO: Decodable {
    let id: String
    let title: String
    let description: String?
}

struct SessionDTO: Decodable {
    let id: String
    let type: String
    let orderNumber: String
    let senderID: String
    let senderName: String
    let senderTitle: String
    let senderAvatarURL: String?
    let receiverID: String
    let receiverName: String
    let receiverTitle: String
    let receiverAvatarURL: String?
    let theme: SessionThemeDTO
    let offeredTheme: SessionThemeDTO?
    let question: String
    let offering: String?
    let receiverQuestion: String?
    let candidateSlots: [String]
    let confirmedSlot: String?
    let coffeeDrink: DrinkDTO?
    let priceCents: Int?
    let paymentMethod: String?
    let paymentDeadlineAt: Date?
    let status: String
    let statusLabel: String
    let declineReason: String?
    let meetingType: String
    let meetingLink: String?
    let meetingId: String?
    let createdAt: Date
    let durationMinutes: Int
    let isViewerSender: Bool
}

struct SessionListDTO: Decodable {
    let items: [SessionDTO]
    let nextCursor: String?
}

struct UserDTO: Decodable {
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
    let autoCalendarSync: Bool?
    let defaultMeetingReady: Bool?
    let hapticsEnabled: Bool?
    let meetingLink: String?
    let totalChats: Int?
    let rating: Double?
    let replyRate: String?
    let onTimeRate: String?
    let completedSessionsCount: Int?
    let completedSwapsCount: Int?
    let totalEarningsCents: Int?
    let pendingEarningsCents: Int?
    let settledEarningsCents: Int?
    let signatureDrink: DrinkDTO?
    let myThemes: [ThemeDTO]?
    let availableSlots: [SlotDTO]?
}

struct PagedSharerDTO: Decodable {
    let items: [SharerDTO]
    let nextCursor: String?
}
