import Foundation

enum SessionType: String, Codable, CaseIterable, Sendable {
    case coffee
    case topicSwap
}

enum SessionStatus: String, Codable, CaseIterable, Sendable {
    case pendingResponse
    case needsNewTime
    case acceptedPendingPayment
    case swapScheduled
    case declined
    case expired
    case booked
    case completed
    case inAfterSale
    case refunding
    case cancelled
}

enum PaymentMethod: String, Codable, CaseIterable, Sendable {
    case wechat
    case alipay

    var label: String {
        switch self {
        case .wechat: "微信支付"
        case .alipay: "支付宝"
        }
    }
}

struct SessionReview: Codable, Hashable, Sendable {
    var rating: Int
    var comment: String
    var tag: String?
    var createdAt: String
}

struct ChatSession: Codable, Hashable, Identifiable, Sendable {
    let id: String
    var type: SessionType
    var orderNumber: String
    var senderID: String
    var senderName: String
    var senderTitle: String
    var senderAvatarURL: URL?
    var receiverID: String
    var receiverName: String
    var receiverTitle: String
    var receiverAvatarURL: URL?
    var themeID: String
    var themeTitle: String
    var themeDescription: String?
    var offeredThemeID: String?
    var offeredThemeTitle: String?
    var offeredThemeDescription: String?
    var question: String
    var offering: String?
    var receiverQuestion: String?
    var candidateSlots: [String]
    var confirmedSlot: String?
    var coffeeDrink: CoffeeDrink?
    var price: Decimal?
    var paymentMethod: PaymentMethod?
    var paymentDeadline: String?
    var status: SessionStatus
    var statusLabel: String
    var declineReason: String?
    var meetingType: String
    var meetingID: String
    var meetingLink: URL?
    var createdAt: String
    var durationMinutes: Int
    var review: SessionReview?
    var complaintReason: String?
}
