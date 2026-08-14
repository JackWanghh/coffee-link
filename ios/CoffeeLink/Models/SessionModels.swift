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

    var label: String {
        switch self {
        case .pendingResponse: "待我回应"
        case .needsNewTime: "待重新确认时间"
        case .acceptedPendingPayment: "已接受，待付款"
        case .swapScheduled: "已排期 (主题互换)"
        case .declined: "已婉拒"
        case .expired: "已过期"
        case .booked: "即将开始"
        case .completed: "已完成"
        case .inAfterSale: "售后处理中"
        case .refunding: "退款中"
        case .cancelled: "已取消"
        }
    }
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
