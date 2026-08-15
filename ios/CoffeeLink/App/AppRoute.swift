import Foundation

enum AppTab: String, CaseIterable, Hashable, Identifiable {
    case discover
    case chats
    case mine

    var id: String { rawValue }

    var title: String {
        switch self {
        case .discover: "发现"
        case .chats: "对谈管理"
        case .mine: "我的"
        }
    }

    var iconName: String {
        switch self {
        case .discover: "safari"
        case .chats: "bubble.left.and.bubble.right"
        case .mine: "person"
        }
    }
}

enum AppRoute: Hashable {
    case sharerDetail(String)
    case createInvitation(sharerID: String, type: SessionType, themeID: String?)
    case checkout(String)
    case chatDetail(String)
    case sharingCenter
}

enum SheetRoute: Hashable, Identifiable {
    case auth
    case meeting(sessionID: String)
    case settings
    case editProfile
    case manageThemes
    case selectDrink
    case topicSwapSettings
    case manageSlots
    case meetingLinkSettings
    case acceptInvitation(String)
    case declineInvitation(String)
    case review(String)
    case complaint(String)

    var id: String {
        switch self {
        case .auth: "auth"
        case .meeting(let sessionID): "meeting-\(sessionID)"
        case .settings: "settings"
        case .editProfile: "edit-profile"
        case .manageThemes: "manage-themes"
        case .selectDrink: "select-drink"
        case .topicSwapSettings: "topic-swap-settings"
        case .manageSlots: "manage-slots"
        case .meetingLinkSettings: "meeting-link-settings"
        case .acceptInvitation(let id): "accept-\(id)"
        case .declineInvitation(let id): "decline-\(id)"
        case .review(let id): "review-\(id)"
        case .complaint(let id): "complaint-\(id)"
        }
    }

    var title: String {
        switch self {
        case .auth: "登录 CoffeeLink"
        case .meeting: "腾讯会议"
        case .settings: "外观与主题"
        case .editProfile: "编辑公开资料"
        case .manageThemes: "管理分享主题"
        case .selectDrink: "选择签名饮品"
        case .topicSwapSettings: "主题互换设置"
        case .manageSlots: "可预约时段"
        case .meetingLinkSettings: "腾讯会议号配置"
        case .acceptInvitation: "接受邀请"
        case .declineInvitation: "婉拒邀请"
        case .review: "完成反馈"
        case .complaint: "投诉与售后"
        }
    }
}
