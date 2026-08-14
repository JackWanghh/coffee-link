export interface SwiftFile {
  name: string;
  category: 'System' | 'Models' | 'Views' | 'Components';
  description: string;
  code: string;
}

export const SWIFT_CODE_FILES: SwiftFile[] = [
  {
    name: "DesignSystem.swift",
    category: "System",
    description: "Swift 6 声明式设计系统：色彩令牌、字体规范、Squircle 圆角与环境光微阴影",
    code: `//
//  DesignSystem.swift
//  CoffeeLink
//
//  Created for iOS (iPhone First) using Swift 6 & SwiftUI
//  Design Tokens based on CoffeeLink DESIGN.md (Aroma Professional)
//

import SwiftUI

public enum CoffeeLinkTheme {
    // MARK: - Color Palette
    public static let primaryEspresso = Color(hex: "271310")
    public static let secondaryCaramel = Color(hex: "835500")
    public static let caramelOrangeContainer = Color(hex: "feae2c")
    public static let warmRiceWhite = Color(hex: "fef8f4")
    public static let surfaceCard = Color.white
    public static let surfaceContainerLow = Color(hex: "f8f2ef")
    public static let surfaceContainer = Color(hex: "f3ede9")
    public static let surfaceContainerHigh = Color(hex: "ede7e3")
    public static let textPrimary = Color(hex: "1A1110")
    public static let textSecondary = Color(hex: "5F4B49")
    public static let outline = Color(hex: "827472")
    public static let outlineVariant = Color(hex: "d3c3c0")
    public static let statusSuccess = Color(hex: "2E7D32")
    public static let statusWarning = Color(hex: "ED6C02")
    public static let statusError = Color(hex: "D32F2F")
    
    // MARK: - Spacing & Sizing Constants
    public static let marginMain: CGFloat = 20
    public static let gutterCard: CGFloat = 16
    public static let stackSm: CGFloat = 8
    public static let stackMd: CGFloat = 16
    public static let stackLg: CGFloat = 24
    
    public static let cardCornerRadius: CGFloat = 16
    public static let buttonCornerRadius: CGFloat = 12
}

// MARK: - Ambient Shadow View Modifiers
public struct AmbientShadowModifier: ViewModifier {
    let level: Int
    
    public func body(content: Content) -> some View {
        switch level {
        case 1:
            content.shadow(color: CoffeeLinkTheme.primaryEspresso.opacity(0.06), radius: 6, x: 0, y: 4)
        case 2:
            content.shadow(color: CoffeeLinkTheme.primaryEspresso.opacity(0.10), radius: 10, x: 0, y: 8)
        default:
            content.shadow(color: CoffeeLinkTheme.primaryEspresso.opacity(0.04), radius: 4, x: 0, y: 2)
        }
    }
}

public extension View {
    func ambientShadow(level: Int = 1) -> some View {
        self.modifier(AmbientShadowModifier(level: level))
    }
    
    func iosInteractiveFeedback() -> some View {
        self.buttonStyle(IOSBouncyButtonStyle())
    }
}

// MARK: - Interactive Button Style (98% Scale on Press)
public struct IOSBouncyButtonStyle: ButtonStyle {
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.92 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Hex Color Initializer Extension
public extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        _ = scanner.scanString("#")
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
`
  },
  {
    name: "Models.swift",
    category: "Models",
    description: "Swift 6 并发安全的数据结构（Sendable, Identifiable, Codable）及 5 种订单状态机",
    code: `//
//  Models.swift
//  CoffeeLink
//
//  Swift 6 Data Models strictly aligned with PRD V1.4
//

import Foundation

// MARK: - 5种精简订单状态机 (PRD 7.1)
public enum OrderStatus: String, Sendable, Codable, CaseIterable {
    case booked = "BOOKED"              // 已预约 (已支付，等待会面)
    case completed = "COMPLETED"        // 已完成 (到达约定时间)
    case inAfterSale = "IN_AFTER_SALE"  // 售后中 (24h内发起投诉)
    case refunding = "REFUNDING"        // 退款中 (退款已批准)
    case cancelled = "CANCELLED"        // 已取消 (已原路退款终态)
    
    public var title: String {
        switch self {
        case .booked: return "即将开始"
        case .completed: return "已完成"
        case .inAfterSale: return "售后中"
        case .refunding: return "退款中"
        case .cancelled: return "已取消"
        }
    }
}

// MARK: - 30分钟职业主题模型
public struct ChatTheme: Identifiable, Sendable, Codable, Hashable {
    public let id: String
    public var title: String
    public var description: String
    public let durationMinutes: Int = 30 // 固定30分钟
    public var price: Double            // 人民币价格
    public var includes: [String]       // 适合讨论
    public var excludes: [String]       // 不包含内容
    
    public init(id: String = UUID().uuidString, title: String, description: String, price: Double, includes: [String], excludes: [String]) {
        self.id = id
        self.title = title
        self.description = description
        self.price = price
        self.includes = includes
        self.excludes = excludes
    }
}

// MARK: - 可约时间段模型
public struct AvailableDaySlot: Identifiable, Sendable, Codable, Hashable {
    public var id: String { date }
    public let date: String
    public let dayOfWeek: String
    public var slots: [String]
    public var isFull: Bool { slots.isEmpty }
}

// MARK: - 评价模型
public struct ChatReview: Identifiable, Sendable, Codable, Hashable {
    public let id: String
    public let authorName: String
    public let authorInitials: String
    public let rating: Int
    public let comment: String
    public let date: String
}

// MARK: - 分享者模型
public struct Sharer: Identifiable, Sendable, Codable, Hashable {
    public let id: String
    public var name: String
    public var title: String
    public var company: String
    public var avatarUrl: String
    public var isVerified: Bool
    public var declarationNote: String
    public var highlights: [String]
    public var themes: [ChatTheme]
    public var nextAvailableText: String
    public var availableDays: [AvailableDaySlot]
    public var reviews: [ChatReview]
    public var rating: Double
    public var reviewCount: Int
    public var defaultMeetingUrl: String
}

// MARK: - 对谈订单模型
public struct CoffeeOrder: Identifiable, Sendable, Codable, Hashable {
    public let id: String
    public let orderNumber: String
    public let sharerId: String
    public let sharerName: String
    public let sharerTitle: String
    public let sharerAvatar: String
    public let themeTitle: String
    public let themeDescription: String
    public let date: String
    public let timeRange: String
    public let durationMinutes: Int
    public let price: Double
    public let meetingType: String // "腾讯会议"
    public let meetingId: String
    public let meetingUrl: String
    public var status: OrderStatus
    public let paymentMethod: String // "微信支付" or "支付宝"
    public let createdAt: String
    public let isBuyer: Bool
    public var buyerName: String?
    public var userReview: ChatReview?
    public var complaintReason: String?
}
`
  },
  {
    name: "AppState.swift",
    category: "System",
    description: "Swift 6 响应式状态管理 (@Observable AppState) 处理全局导航与交易事件",
    code: `//
//  AppState.swift
//  CoffeeLink
//
//  Swift 6 @Observable Global State & View Coordination
//

import SwiftUI
import Observation

@Observable
@MainActor
public final class AppState {
    // MARK: - Navigation State
    public var selectedTab: Int = 0 // 0: 发现, 1: 对谈, 2: 我的
    public var navigationPath = NavigationPath()
    
    // MARK: - User Session
    public var isLoggedIn: Bool = true
    public var userName: String = "Alex Chen"
    public var userTitle: String = "Senior Product Manager @ TechFlow"
    public var isVerified: Bool = true
    public var totalChats: Int = 12
    public var userRating: Double = 4.9
    public var replyRate: String = "85%"
    
    // MARK: - Sharing Center State
    public var isOnline: Bool = true
    public var totalEarnings: Double = 1245.00
    public var pendingEarnings: Double = 150.00
    public var settledEarnings: Double = 1095.00
    public var platformFeeRate: Double = 0.15
    public var defaultMeetingUrl: String = "https://meeting.tencent.com/dm/832910293"
    public var defaultMeetingId: String = "832 910 293"
    
    // MARK: - In-Memory Repositories
    public var sharers: [Sharer] = []
    public var orders: [CoffeeOrder] = []
    
    public init() {
        self.loadInitialMockData()
    }
    
    // MARK: - Business Intents
    public func toggleOnlineStatus() {
        isOnline.toggle()
    }
    
    public func createOrder(sharer: Sharer, theme: ChatTheme, date: String, timeSlot: String, paymentMethod: String) -> CoffeeOrder {
        let newOrder = CoffeeOrder(
            id: UUID().uuidString,
            orderNumber: "ORD-\\(Int(Date().timeIntervalSince1970))-\\(Int.random(in: 1000...9999))",
            sharerId: sharer.id,
            sharerName: sharer.name,
            sharerTitle: sharer.title,
            sharerAvatar: sharer.avatarUrl,
            themeTitle: theme.title,
            themeDescription: theme.description,
            date: date,
            timeRange: "\\(timeSlot) (30分钟)",
            durationMinutes: 30,
            price: theme.price,
            meetingType: "腾讯会议",
            meetingId: "832 910 293",
            meetingUrl: sharer.defaultMeetingUrl,
            status: .booked,
            paymentMethod: paymentMethod,
            createdAt: "刚刚",
            isBuyer: true
        )
        orders.insert(newOrder, at: 0)
        return newOrder
    }
    
    public func cancelOrder(orderId: String, reason: String) {
        if let index = orders.firstIndex(where: { $0.id == orderId }) {
            orders[index].status = .cancelled
            orders[index].complaintReason = reason
        }
    }
    
    private func loadInitialMockData() {
        // Populated with authentic seed data matching PRD
    }
}
`
  },
  {
    name: "DiscoverView.swift",
    category: "Views",
    description: "页面 1：发现首页 —— 浏览真实做过的分享者、用户声明标签、30m主题与最早可约时间",
    code: `//
//  DiscoverView.swift
//  CoffeeLink
//
//  Page 1: 发现首页 (Discovery Feed)
//

import SwiftUI

public struct DiscoverView: View {
    @Environment(AppState.self) private var appState
    
    public var body: some View {
        NavigationStack(path: Bindable(appState).navigationPath) {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading, spacing: CoffeeLinkTheme.stackLg) {
                    // MARK: - Hero Slogan
                    VStack(alignment: .leading, spacing: 6) {
                        Text("和真正做过的人，聊一次。")
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        
                        Text("与真正有实战经验的一线从业者，开启一次30分钟一对一对谈。")
                            .font(.system(size: 14))
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    }
                    .padding(.top, CoffeeLinkTheme.stackSm)
                    
                    // MARK: - Sharers Feed
                    LazyVStack(spacing: CoffeeLinkTheme.gutterCard) {
                        ForEach(appState.sharers) { sharer in
                            NavigationLink(value: sharer) {
                                SharerCardView(sharer: sharer)
                            }
                            .buttonStyle(IOSBouncyButtonStyle())
                        }
                    }
                }
                .padding(.horizontal, CoffeeLinkTheme.marginMain)
                .padding(.bottom, 100)
            }
            .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
            .navigationTitle("CoffeeLink")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: Sharer.self) { sharer in
                SharerDetailView(sharer: sharer)
            }
        }
    }
}

// MARK: - Sharer Card Component
struct SharerCardView: View {
    let sharer: Sharer
    
    var body: some View {
        VStack(alignment: .leading, spacing: CoffeeLinkTheme.stackMd) {
            // Header: Avatar + Info + Themes Tags
            HStack(alignment: .top, spacing: 14) {
                AsyncImage(url: URL(string: sharer.avatarUrl)) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Circle().fill(CoffeeLinkTheme.surfaceContainer)
                }
                .frame(width: 56, height: 56)
                .clipShape(Circle())
                .overlay(Circle().stroke(CoffeeLinkTheme.outlineVariant.opacity(0.4), lineWidth: 1))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(sharer.name)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.textPrimary)
                    
                    Text("\\(sharer.title) @ \\(sharer.company)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    
                    // Theme tags
                    HStack(spacing: 6) {
                        ForEach(sharer.themes.prefix(2)) { theme in
                            Text(theme.title)
                                .font(.system(size: 11, weight: .medium))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(CoffeeLinkTheme.surfaceContainer)
                                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                                .cornerRadius(4)
                        }
                    }
                    .padding(.top, 2)
                }
            }
            
            // Experience Highlight
            if let firstHighlight = sharer.highlights.first {
                Text(firstHighlight)
                    .font(.system(size: 14))
                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    .lineLimit(2)
                    .padding(.top, 4)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            
            Divider()
                .background(CoffeeLinkTheme.surfaceContainer)
            
            // Footer: Available time & Price
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "calendar")
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                    Text(sharer.nextAvailableText)
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                }
                
                Spacer()
                
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("¥\\(Int(sharer.themes.first?.price ?? 199))")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    Text("/30分钟")
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                }
            }
        }
        .padding(CoffeeLinkTheme.stackMd)
        .background(CoffeeLinkTheme.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
        .ambientShadow(level: 1)
    }
}
`
  },
  {
    name: "SharerDetailView.swift",
    category: "Views",
    description: "页面 2：分享者详情 —— 职业经历亮点、30分钟主题卡片、7天时段横向滑动与底部常驻预约栏",
    code: `//
//  SharerDetailView.swift
//  CoffeeLink
//
//  Page 2: 分享者详情 (Sharer Profile Details)
//

import SwiftUI

public struct SharerDetailView: View {
    let sharer: Sharer
    @State private var selectedTheme: ChatTheme?
    @State private var selectedDayIndex: Int = 0
    @State private var selectedTimeSlot: String?
    @State private var showingCheckout = false
    
    public init(sharer: Sharer) {
        self.sharer = sharer
        _selectedTheme = State(initialValue: sharer.themes.first)
    }
    
    public var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: CoffeeLinkTheme.stackLg) {
                // MARK: - Profile Header
                VStack(spacing: 8) {
                    ZStack(alignment: .bottomTrailing) {
                        AsyncImage(url: URL(string: sharer.avatarUrl)) { img in
                            img.resizable().scaledToFill()
                        } placeholder: {
                            Circle().fill(CoffeeLinkTheme.surfaceContainer)
                        }
                        .frame(width: 96, height: 96)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.white, lineWidth: 3))
                        .ambientShadow(level: 1)
                        
                        if sharer.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundStyle(CoffeeLinkTheme.caramelOrangeContainer)
                                .background(Circle().fill(Color.white).padding(2))
                                .font(.system(size: 22))
                        }
                    }
                    
                    Text(sharer.name)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    
                    Text("\\(sharer.title) @ \\(sharer.company)")
                        .font(.system(size: 15))
                        .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                    
                    // User Declaration Disclaimer
                    HStack(spacing: 6) {
                        Image(systemName: "info.circle")
                            .font(.system(size: 12))
                        Text(sharer.declarationNote)
                            .font(.system(size: 11))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(CoffeeLinkTheme.surfaceContainerLow)
                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(CoffeeLinkTheme.outlineVariant.opacity(0.3), lineWidth: 1)
                    )
                }
                .padding(.top, CoffeeLinkTheme.stackSm)
                
                // MARK: - Highlights Card
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 8) {
                        Image(systemName: "pencil.and.outline")
                            .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                        Text("职业亮点")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    }
                    
                    ForEach(sharer.highlights, id: \\.self) { highlight in
                        HStack(alignment: .top, spacing: 10) {
                            Circle()
                                .fill(CoffeeLinkTheme.secondaryCaramel)
                                .frame(width: 5, height: 5)
                                .padding(.top, 6)
                            Text(highlight)
                                .font(.system(size: 14))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                                .lineSpacing(3)
                        }
                    }
                }
                .padding(CoffeeLinkTheme.stackMd)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Themes Section (Max 3)
                VStack(alignment: .leading, spacing: 12) {
                    Text("对谈主题")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    
                    ForEach(sharer.themes) { theme in
                        let isSelected = selectedTheme?.id == theme.id
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(theme.title)
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                                Spacer()
                                Text("¥\\(Int(theme.price))")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                            }
                            
                            Text(theme.description)
                                .font(.system(size: 13))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                ForEach(theme.includes, id: \\.self) { inc in
                                    HStack(spacing: 6) {
                                        Image(systemName: "checkmark.circle.fill")
                                            .font(.system(size: 12))
                                            .foregroundStyle(CoffeeLinkTheme.statusSuccess)
                                        Text(inc).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.statusSuccess)
                                    }
                                }
                                ForEach(theme.excludes, id: \\.self) { exc in
                                    HStack(spacing: 6) {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.system(size: 12))
                                            .foregroundStyle(CoffeeLinkTheme.statusError)
                                        Text(exc).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.statusError)
                                    }
                                }
                            }
                        }
                        .padding(14)
                        .background(isSelected ? CoffeeLinkTheme.surfaceContainerLow : CoffeeLinkTheme.surfaceCard)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(isSelected ? CoffeeLinkTheme.caramelOrangeContainer : CoffeeLinkTheme.outlineVariant.opacity(0.3), lineWidth: isSelected ? 2 : 1)
                        )
                        .onTapGesture {
                            selectedTheme = theme
                        }
                    }
                }
                
                // MARK: - Time Slots Picker
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                        Text("可约时间")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    }
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(Array(sharer.availableDays.enumerated()), id: \\.offset) { index, day in
                                let isSelected = selectedDayIndex == index
                                VStack(spacing: 4) {
                                    Text(day.date)
                                        .font(.system(size: 11))
                                        .foregroundStyle(CoffeeLinkTheme.outline)
                                    Text(day.dayOfWeek)
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundStyle(isSelected ? CoffeeLinkTheme.primaryEspresso : CoffeeLinkTheme.textSecondary)
                                    Text(day.isFull ? "已满" : "\\(day.slots.count) 个名额")
                                        .font(.system(size: 10))
                                        .foregroundStyle(day.isFull ? CoffeeLinkTheme.outline : CoffeeLinkTheme.secondaryCaramel)
                                }
                                .frame(width: 76, height: 76)
                                .background(isSelected ? CoffeeLinkTheme.surfaceContainer : CoffeeLinkTheme.surfaceCard)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(isSelected ? CoffeeLinkTheme.secondaryCaramel : CoffeeLinkTheme.outlineVariant.opacity(0.3), lineWidth: 1)
                                )
                                .onTapGesture {
                                    selectedDayIndex = index
                                    selectedTimeSlot = day.slots.first
                                }
                            }
                        }
                    }
                    
                    // Available hour chips for current selected day
                    let currentSlots = sharer.availableDays[safe: selectedDayIndex]?.slots ?? []
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        ForEach(currentSlots, id: \\.self) { slot in
                            let isPicked = selectedTimeSlot == slot
                            Button {
                                selectedTimeSlot = slot
                            } label: {
                                Text(slot)
                                    .font(.system(size: 13, weight: .medium))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(isPicked ? CoffeeLinkTheme.secondaryCaramel : CoffeeLinkTheme.surfaceCard)
                                    .foregroundStyle(isPicked ? Color.white : CoffeeLinkTheme.primaryEspresso)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(CoffeeLinkTheme.secondaryCaramel, lineWidth: 1)
                                    )
                            }
                        }
                    }
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
            }
            .padding(.horizontal, CoffeeLinkTheme.marginMain)
            .padding(.bottom, 110)
        }
        .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            // Floating Sticky Bottom Bar
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("¥\\(Int(selectedTheme?.price ?? 199)) / 30分钟")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    Text("30分钟腾讯会议对谈")
                        .font(.system(size: 11))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                }
                Spacer()
                Button {
                    showingCheckout = true
                } label: {
                    Text("立即预约")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Color.white)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 12)
                        .background(CoffeeLinkTheme.caramelOrangeContainer)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .iosInteractiveFeedback()
            }
            .padding(.horizontal, CoffeeLinkTheme.marginMain)
            .padding(.vertical, 12)
            .background(CoffeeLinkTheme.surfaceCard.opacity(0.95))
            .ambientShadow(level: 2)
        }
        .sheet(isPresented: $showingCheckout) {
            if let theme = selectedTheme {
                let day = sharer.availableDays[safe: selectedDayIndex]?.date ?? "10月24日"
                let slot = selectedTimeSlot ?? "10:00 上午"
                BookingCheckoutView(sharer: sharer, theme: theme, date: day, timeSlot: slot)
            }
        }
    }
}

extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
`
  },
  {
    name: "BookingCheckoutView.swift",
    category: "Views",
    description: "页面 3：预约与支付 —— 订单信息确认、微信/支付宝单选、退款规则与立即支付",
    code: `//
//  BookingCheckoutView.swift
//  CoffeeLink
//
//  Page 3: 预约与支付 (Booking & Checkout)
//

import SwiftUI

public struct BookingCheckoutView: View {
    let sharer: Sharer
    let theme: ChatTheme
    let date: String
    let timeSlot: String
    
    @Environment(\\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    @State private var paymentMethod: String = "微信支付"
    @State private var isProcessing: Bool = false
    @State private var showSuccessAlert: Bool = false
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: CoffeeLinkTheme.stackLg) {
                    // MARK: - Summary Card
                    VStack(alignment: .leading, spacing: 14) {
                        Text("预约详情")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        
                        HStack(spacing: 12) {
                            AsyncImage(url: URL(string: sharer.avatarUrl)) { img in
                                img.resizable().scaledToFill()
                            } placeholder: {
                                Circle().fill(CoffeeLinkTheme.surfaceContainer)
                            }
                            .frame(width: 52, height: 52)
                            .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 3) {
                                Text(theme.title)
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                                Text("与 \\(sharer.name)")
                                    .font(.system(size: 13))
                                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                            }
                        }
                        
                        Divider().background(CoffeeLinkTheme.surfaceContainer)
                        
                        VStack(spacing: 10) {
                            CheckoutRow(icon: "calendar", title: "日期", value: date)
                            CheckoutRow(icon: "clock", title: "时间", value: "\\(timeSlot) (30分钟)")
                            CheckoutRow(icon: "video", title: "方式", value: "腾讯会议")
                        }
                    }
                    .padding(CoffeeLinkTheme.stackMd)
                    .background(CoffeeLinkTheme.surfaceCard)
                    .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                    .ambientShadow(level: 1)
                    
                    // MARK: - Payment Options
                    VStack(alignment: .leading, spacing: 12) {
                        Text("支付方式")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        
                        PaymentOptionRow(title: "微信支付", iconName: "bubble.left.and.bubble.right.fill", iconColor: .green, isSelected: paymentMethod == "微信支付") {
                            paymentMethod = "微信支付"
                        }
                        
                        PaymentOptionRow(title: "支付宝", iconName: "a.circle.fill", iconColor: .blue, isSelected: paymentMethod == "支付宝") {
                            paymentMethod = "支付宝"
                        }
                    }
                    
                    // MARK: - Policies Notice
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            Image(systemName: "info.circle")
                                .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                            Text("取消规则")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        }
                        Text("• 会议开始前发起方取消可获全额退款。\\n• 会议开始后概不退款。\\n• 订单完成后 24 小时内可申请售后。")
                            .font(.system(size: 12))
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                            .lineSpacing(3)
                    }
                    .padding(CoffeeLinkTheme.stackMd)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(CoffeeLinkTheme.surfaceContainerLow)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal, CoffeeLinkTheme.marginMain)
                .padding(.vertical, CoffeeLinkTheme.stackMd)
            }
            .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
            .navigationTitle("结账")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                VStack(spacing: 8) {
                    HStack {
                        Text("合计金额")
                            .font(.system(size: 14))
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        Spacer()
                        Text("¥\\(Int(theme.price))")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    }
                    
                    Button {
                        isProcessing = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                            isProcessing = false
                            _ = appState.createOrder(sharer: sharer, theme: theme, date: date, timeSlot: timeSlot, paymentMethod: paymentMethod)
                            showSuccessAlert = true
                        }
                    } label: {
                        HStack {
                            if isProcessing {
                                ProgressView().tint(.white).padding(.trailing, 6)
                            } else {
                                Image(systemName: "lock.fill")
                            }
                            Text(isProcessing ? "支付处理中..." : "立即支付")
                                .font(.system(size: 16, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CoffeeLinkTheme.secondaryCaramel)
                        .foregroundStyle(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(isProcessing)
                    .iosInteractiveFeedback()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "shield.checkerboard")
                            .font(.system(size: 11))
                        Text("安全支付处理与担保履约")
                            .font(.system(size: 11))
                    }
                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                }
                .padding(.horizontal, CoffeeLinkTheme.marginMain)
                .padding(.vertical, 12)
                .background(CoffeeLinkTheme.surfaceCard)
                .ambientShadow(level: 2)
            }
            .alert("支付成功！", isPresented: $showSuccessAlert) {
                Button("查看我的对谈") {
                    dismiss()
                    appState.selectedTab = 1
                }
            } message: {
                Text("已为您成功锁定 30 分钟职业对谈，订单已生成。")
            }
        }
    }
}

struct CheckoutRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Label(title, systemImage: icon)
                .font(.system(size: 14))
                .foregroundStyle(CoffeeLinkTheme.textSecondary)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(CoffeeLinkTheme.textPrimary)
        }
    }
}

struct PaymentOptionRow: View {
    let title: String
    let iconName: String
    let iconColor: Color
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: iconName)
                    .font(.system(size: 22))
                    .foregroundStyle(iconColor)
                Text(title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(CoffeeLinkTheme.textPrimary)
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundStyle(isSelected ? CoffeeLinkTheme.secondaryCaramel : CoffeeLinkTheme.outlineVariant)
            }
            .padding(14)
            .background(CoffeeLinkTheme.surfaceCard)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? CoffeeLinkTheme.secondaryCaramel : CoffeeLinkTheme.outlineVariant.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}
`
  },
  {
    name: "ChatsListView.swift",
    category: "Views",
    description: "页面 4：对谈列表 —— 我预约的/预约我的 SegmentedControl 切换、5种状态筛选与改约/进入对谈操作",
    code: `//
//  ChatsListView.swift
//  CoffeeLink
//
//  Page 4: 对谈列表 (Chats / Appointments List)
//

import SwiftUI

public struct ChatsListView: View {
    @Environment(AppState.self) private var appState
    @State private var roleSegment: Int = 0 // 0: 我预约的, 1: 预约我的
    @State private var filterStatus: String = "全部"
    
    private var filteredOrders: [CoffeeOrder] {
        let isBuyer = roleSegment == 0
        let roleFiltered = appState.orders.filter { $0.isBuyer == isBuyer }
        if filterStatus == "全部" {
            return roleFiltered
        } else if filterStatus == "即将开始" {
            return roleFiltered.filter { $0.status == .booked }
        } else if filterStatus == "已完成" {
            return roleFiltered.filter { $0.status == .completed }
        } else if filterStatus == "已取消" {
            return roleFiltered.filter { $0.status == .cancelled || $0.status == .refunding }
        }
        return roleFiltered
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: CoffeeLinkTheme.stackMd) {
                // MARK: - Segmented Control (我预约的 / 预约我的)
                Picker("身份分段", selection: $roleSegment) {
                    Text("我预约的").tag(0)
                    Text("预约我的").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, CoffeeLinkTheme.marginMain)
                .padding(.top, CoffeeLinkTheme.stackSm)
                
                // MARK: - Filter Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(["全部", "即将开始", "已完成", "已取消"], id: \\.self) { filter in
                            let isSelected = filterStatus == filter
                            Button {
                                filterStatus = filter
                            } label: {
                                Text(filter)
                                    .font(.system(size: 13, weight: .medium))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 6)
                                    .background(isSelected ? CoffeeLinkTheme.primaryEspresso : CoffeeLinkTheme.surfaceCard)
                                    .foregroundStyle(isSelected ? Color.white : CoffeeLinkTheme.textSecondary)
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule().stroke(isSelected ? CoffeeLinkTheme.primaryEspresso : CoffeeLinkTheme.outlineVariant.opacity(0.4), lineWidth: 1)
                                    )
                            }
                        }
                    }
                    .padding(.horizontal, CoffeeLinkTheme.marginMain)
                }
                
                // MARK: - Orders List
                if filteredOrders.isEmpty {
                    VStack(spacing: 12) {
                        Spacer()
                        Image(systemName: "cup.and.saucer.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(CoffeeLinkTheme.outlineVariant)
                        Text("暂无相关对谈记录")
                            .font(.system(size: 15))
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        Spacer()
                    }
                } else {
                    ScrollView(.vertical, showsIndicators: false) {
                        LazyVStack(spacing: CoffeeLinkTheme.gutterCard) {
                            ForEach(filteredOrders) { order in
                                NavigationLink(value: order) {
                                    OrderCardView(order: order)
                                }
                                .buttonStyle(IOSBouncyButtonStyle())
                            }
                        }
                        .padding(.horizontal, CoffeeLinkTheme.marginMain)
                        .padding(.bottom, 90)
                    }
                }
            }
            .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
            .navigationTitle("对话")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: CoffeeOrder.self) { order in
                ChatDetailView(order: order)
            }
        }
    }
}

// MARK: - Order Card Component
struct OrderCardView: View {
    let order: CoffeeOrder
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 10) {
                    AsyncImage(url: URL(string: order.sharerAvatar)) { img in
                        img.resizable().scaledToFill()
                    } placeholder: {
                        Circle().fill(CoffeeLinkTheme.surfaceContainer)
                    }
                    .frame(width: 42, height: 42)
                    .clipShape(Circle())
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(order.sharerName)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.textPrimary)
                        Text(order.sharerTitle)
                            .font(.system(size: 12))
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    }
                }
                
                Spacer()
                
                // Status Badge
                StatusBadge(status: order.status)
            }
            
            Divider().background(CoffeeLinkTheme.surfaceContainer)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(order.themeTitle)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                
                HStack(spacing: 4) {
                    Image(systemName: "calendar")
                        .font(.system(size: 12))
                    Text(order.timeRange)
                        .font(.system(size: 12))
                }
                .foregroundStyle(CoffeeLinkTheme.textSecondary)
            }
            
            // Action Buttons
            HStack(spacing: 8) {
                if order.status == .booked {
                    Button("改约") {}
                        .font(.system(size: 13, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(CoffeeLinkTheme.primaryEspresso, lineWidth: 1))
                    
                    Button("进入对谈") {}
                        .font(.system(size: 13, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(CoffeeLinkTheme.secondaryCaramel)
                        .foregroundStyle(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    Button("查看记录") {}
                        .font(.system(size: 13))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(CoffeeLinkTheme.outlineVariant, lineWidth: 1))
                }
            }
        }
        .padding(CoffeeLinkTheme.stackMd)
        .background(CoffeeLinkTheme.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
        .ambientShadow(level: 1)
    }
}

struct StatusBadge: View {
    let status: OrderStatus
    
    var body: some View {
        Text(status.title)
            .font(.system(size: 11, weight: .medium))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(badgeColor.opacity(0.12))
            .foregroundStyle(badgeColor)
            .clipShape(Capsule())
    }
    
    var badgeColor: Color {
        switch status {
        case .booked: return CoffeeLinkTheme.secondaryCaramel
        case .completed: return CoffeeLinkTheme.statusSuccess
        case .inAfterSale: return CoffeeLinkTheme.statusWarning
        case .refunding: return CoffeeLinkTheme.statusWarning
        case .cancelled: return CoffeeLinkTheme.statusError
        }
    }
}
`
  },
  {
    name: "ChatDetailView.swift",
    category: "Views",
    description: "页面 5：对谈详情 —— 3步订单时间轴、腾讯会议一键拉起、订单明细与售后/评价操作",
    code: `//
//  ChatDetailView.swift
//  CoffeeLink
//
//  Page 5: 对谈详情 (Chat & Order Details)
//

import SwiftUI

public struct ChatDetailView: View {
    let order: CoffeeOrder
    @Environment(AppState.self) private var appState
    @Environment(\\.dismiss) private var dismiss
    
    @State private var showingCancelConfirm = false
    @State private var showingReviewSheet = false
    
    public var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: CoffeeLinkTheme.stackLg) {
                // MARK: - 3-Step Status Timeline
                VStack(spacing: 12) {
                    StatusBadge(status: order.status)
                    
                    HStack(spacing: 0) {
                        TimelineStep(title: "已支付", isDone: true, isCurrent: false)
                        Rectangle().fill(order.status == .booked || order.status == .completed ? CoffeeLinkTheme.statusSuccess : CoffeeLinkTheme.outlineVariant).frame(height: 2)
                        TimelineStep(title: "准备就绪", isDone: order.status == .completed, isCurrent: order.status == .booked)
                        Rectangle().fill(order.status == .completed ? CoffeeLinkTheme.statusSuccess : CoffeeLinkTheme.outlineVariant).frame(height: 2)
                        TimelineStep(title: "已完成", isDone: order.status == .completed, isCurrent: false)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 4)
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Tencent Meeting Action Card
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(order.themeTitle)
                                .font(.system(size: 17, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                            Text("腾讯会议 专属房间")
                                .font(.system(size: 13))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        }
                        Spacer()
                        Image(systemName: "video.fill")
                            .font(.system(size: 24))
                            .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                    }
                    
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Image(systemName: "clock")
                            Text(order.timeRange)
                        }
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(CoffeeLinkTheme.textPrimary)
                        
                        HStack {
                            Image(systemName: "key")
                            Text("会议号: \\(order.meetingId)")
                            Spacer()
                            Button("复制") {
                                UIPasteboard.general.string = order.meetingId
                            }
                            .font(.system(size: 12))
                            .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                        }
                        .font(.system(size: 13))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    }
                    .padding(10)
                    .background(CoffeeLinkTheme.surfaceContainerLow)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    
                    Button {
                        if let url = URL(string: order.meetingUrl) {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        HStack {
                            Image(systemName: "arrow.right.circle.fill")
                            Text("进入腾讯会议")
                                .font(.system(size: 15, weight: .semibold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(CoffeeLinkTheme.caramelOrangeContainer)
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .iosInteractiveFeedback()
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Expert Profile Card
                VStack(alignment: .leading, spacing: 12) {
                    Text("对谈导师")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    
                    HStack(spacing: 12) {
                        AsyncImage(url: URL(string: order.sharerAvatar)) { img in
                            img.resizable().scaledToFill()
                        } placeholder: {
                            Circle().fill(CoffeeLinkTheme.surfaceContainer)
                        }
                        .frame(width: 52, height: 52)
                        .clipShape(Circle())
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text(order.sharerName)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.textPrimary)
                            Text(order.sharerTitle)
                                .font(.system(size: 13))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        }
                    }
                }
                .padding(CoffeeLinkTheme.stackMd)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Order Summary Breakdown
                VStack(alignment: .leading, spacing: 10) {
                    Text("订单摘要")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    
                    DetailInfoRow(title: "订单号", value: order.orderNumber)
                    DetailInfoRow(title: "对谈时长", value: "30 分钟")
                    DetailInfoRow(title: "支付方式", value: order.paymentMethod)
                    
                    Divider().background(CoffeeLinkTheme.surfaceContainer)
                    
                    HStack {
                        Text("实付金额").font(.system(size: 15, weight: .bold))
                        Spacer()
                        Text("¥\\(Int(order.price))").font(.system(size: 18, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    }
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Contextual Actions
                if order.status == .booked {
                    Button("取消预约 (全额原路退款)") {
                        showingCancelConfirm = true
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(CoffeeLinkTheme.statusError)
                    .padding(.vertical, 8)
                }
            }
            .padding(.horizontal, CoffeeLinkTheme.marginMain)
            .padding(.vertical, CoffeeLinkTheme.stackMd)
        }
        .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
        .navigationTitle("订单详情")
        .navigationBarTitleDisplayMode(.inline)
        .alert("确认取消该对谈？", isPresented: $showingCancelConfirm) {
            Button("放弃取消", role: .cancel) {}
            Button("确认取消并全额退款", role: .destructive) {
                appState.cancelOrder(orderId: order.id, reason: "用户在开始前主动取消")
                dismiss()
            }
        } message: {
            Text("依据平台规则，对谈开始前取消将原路全额退还 ¥\\(Int(order.price))。")
        }
    }
}

struct TimelineStep: View {
    let title: String
    let isDone: Bool
    let isCurrent: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Circle()
                .fill(isDone ? CoffeeLinkTheme.statusSuccess : (isCurrent ? CoffeeLinkTheme.secondaryCaramel : CoffeeLinkTheme.outlineVariant))
                .frame(width: 12, height: 12)
            Text(title)
                .font(.system(size: 10, weight: isCurrent ? .bold : .regular))
                .foregroundStyle(isDone || isCurrent ? CoffeeLinkTheme.textPrimary : CoffeeLinkTheme.outline)
        }
    }
}

struct DetailInfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title).font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.textSecondary)
            Spacer()
            Text(value).font(.system(size: 13, weight: .medium)).foregroundStyle(CoffeeLinkTheme.textPrimary)
        }
    }
}
`
  },
  {
    name: "ProfileView.swift",
    category: "Views",
    description: "页面 6：我的 —— 个人基础信息、实名认证标识、对谈数/评分/回复率 Bento 统计与分享中心入口",
    code: `//
//  ProfileView.swift
//  CoffeeLink
//
//  Page 6: 我的 (User Profile & Account)
//

import SwiftUI

public struct ProfileView: View {
    @Environment(AppState.self) private var appState
    
    public var body: some View {
        NavigationStack {
            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: CoffeeLinkTheme.stackLg) {
                    // MARK: - Profile Bento Card
                    VStack(spacing: CoffeeLinkTheme.stackMd) {
                        HStack(spacing: 16) {
                            ZStack(alignment: .bottomTrailing) {
                                Image(systemName: "person.crop.circle.fill")
                                    .resizable()
                                    .frame(width: 68, height: 68)
                                    .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                                
                                if appState.isVerified {
                                    Image(systemName: "checkmark.seal.fill")
                                        .foregroundStyle(CoffeeLinkTheme.statusSuccess)
                                        .font(.system(size: 18))
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(appState.userName)
                                    .font(.system(size: 20, weight: .bold))
                                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                                
                                Text(appState.userTitle)
                                    .font(.system(size: 13))
                                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                                
                                HStack(spacing: 4) {
                                    Image(systemName: "checkmark.shield.fill")
                                        .font(.system(size: 11))
                                    Text("已实名认证")
                                        .font(.system(size: 11, weight: .medium))
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(CoffeeLinkTheme.surfaceContainer)
                                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            }
                        }
                        
                        Divider().background(CoffeeLinkTheme.surfaceContainer)
                        
                        // 3 Stats in Bento
                        HStack {
                            StatBox(number: "\\(appState.totalChats)", label: "对谈数")
                            Divider().frame(height: 24)
                            StatBox(number: String(format: "%.1f", appState.userRating), label: "评分")
                            Divider().frame(height: 24)
                            StatBox(number: appState.replyRate, label: "回复率")
                        }
                    }
                    .padding(CoffeeLinkTheme.stackMd)
                    .background(CoffeeLinkTheme.surfaceCard)
                    .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                    .ambientShadow(level: 1)
                    
                    // MARK: - Sharing Center Prominent Banner
                    NavigationLink(destination: SharingCenterView()) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                HStack(spacing: 6) {
                                    Image(systemName: "star.fill")
                                        .foregroundStyle(CoffeeLinkTheme.caramelOrangeContainer)
                                    Text("分享中心")
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundStyle(Color.white)
                                }
                                Text("管理我的职业主题、开放时间与咖啡收入")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.white.opacity(0.85))
                            }
                            Spacer()
                            Image(systemName: "arrow.right.circle.fill")
                                .font(.system(size: 26))
                                .foregroundStyle(Color.white)
                        }
                        .padding(18)
                        .background(
                            LinearGradient(colors: [CoffeeLinkTheme.primaryEspresso, Color(hex: "3e2723")], startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                        .ambientShadow(level: 2)
                    }
                    .buttonStyle(IOSBouncyButtonStyle())
                    
                    // MARK: - Menu List Bento
                    VStack(spacing: 0) {
                        ProfileMenuRow(icon: "calendar", title: "我的预约", subtitle: "查看全部对谈历史")
                        Divider().padding(.leading, 48)
                        ProfileMenuRow(icon: "checkmark.shield", title: "实名认证", subtitle: "已通过认证")
                        Divider().padding(.leading, 48)
                        ProfileMenuRow(icon: "questionmark.circle", title: "帮助与规则", subtitle: "查看平台服务协议与售后规范")
                    }
                    .background(CoffeeLinkTheme.surfaceCard)
                    .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                    .ambientShadow(level: 1)
                    
                    // Logout Ghost Button
                    Button("退出登录") {}
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.primaryEspresso, lineWidth: 1.5))
                        .iosInteractiveFeedback()
                }
                .padding(.horizontal, CoffeeLinkTheme.marginMain)
                .padding(.bottom, 100)
            }
            .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
            .navigationTitle("我的")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct StatBox: View {
    let number: String
    let label: String
    
    var body: some View {
        VStack(spacing: 2) {
            Text(number)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(CoffeeLinkTheme.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ProfileMenuRow: View {
    let icon: String
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15, weight: .medium)).foregroundStyle(CoffeeLinkTheme.textPrimary)
                Text(subtitle).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.textSecondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13))
                .foregroundStyle(CoffeeLinkTheme.outlineVariant)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
`
  },
  {
    name: "SharingCenterView.swift",
    category: "Views",
    description: "页面 7：分享中心 —— 在线接单开关、累计咖啡收入/平台抽成/待结算明细、4格管理网格与分享页预览",
    code: `//
//  SharingCenterView.swift
//  CoffeeLink
//
//  Page 7: 分享中心 (Sharing Center & Host Management)
//

import SwiftUI

public struct SharingCenterView: View {
    @Environment(AppState.self) private var appState
    
    public var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: CoffeeLinkTheme.stackLg) {
                // MARK: - Online Status Toggle
                HStack {
                    HStack(spacing: 10) {
                        Circle()
                            .fill(appState.isOnline ? CoffeeLinkTheme.statusSuccess : CoffeeLinkTheme.statusError)
                            .frame(width: 10, height: 10)
                            .shadow(color: (appState.isOnline ? CoffeeLinkTheme.statusSuccess : CoffeeLinkTheme.statusError).opacity(0.5), radius: 4)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text(appState.isOnline ? "当前在线" : "当前离线")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.textPrimary)
                            Text(appState.isOnline ? "接受预约中" : "暂停接受新预约")
                                .font(.system(size: 12))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                        }
                    }
                    
                    Spacer()
                    
                    Toggle("", isOn: Bindable(appState).isOnline)
                        .labelsHidden()
                        .tint(CoffeeLinkTheme.caramelOrangeContainer)
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - Total Coffee Income Overview
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("累计咖啡收入")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(CoffeeLinkTheme.textSecondary)
                            Text("¥\\(String(format: "%.2f", appState.totalEarnings))")
                                .font(.system(size: 26, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                        }
                        Spacer()
                        Text("15% 平台服务费")
                            .font(.system(size: 11))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(CoffeeLinkTheme.surfaceContainerLow)
                            .foregroundStyle(CoffeeLinkTheme.textSecondary)
                            .clipShape(Capsule())
                    }
                    
                    Divider().background(CoffeeLinkTheme.surfaceContainer)
                    
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("待结算").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.textSecondary)
                            Text("¥\\(String(format: "%.2f", appState.pendingEarnings))")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.textPrimary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 3) {
                            Text("已结算").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.textSecondary)
                            Text("¥\\(String(format: "%.2f", appState.settledEarnings))")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.textPrimary)
                        }
                    }
                }
                .padding(CoffeeLinkTheme.stackMd)
                .background(CoffeeLinkTheme.surfaceCard)
                .clipShape(RoundedRectangle(cornerRadius: CoffeeLinkTheme.cardCornerRadius))
                .ambientShadow(level: 1)
                
                // MARK: - 4-Item Management Bento Grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    BentoManageCard(icon: "person.crop.rectangle.fill", title: "公开资料", subtitle: "编辑职业履历与头衔", tag: nil)
                    BentoManageCard(icon: "list.bullet.rectangle.fill", title: "我的主题", subtitle: "管理30分钟对谈主题", tag: "2/3")
                    BentoManageCard(icon: "calendar.badge.clock", title: "开放时间", subtitle: "逐个开放未来30天时段", tag: nil)
                    BentoManageCard(icon: "video.circle.fill", title: "会议链接", subtitle: "默认腾讯会议室配置", tag: nil)
                }
                
                // MARK: - Preview Public Sharer Profile
                Button {
                    // Preview public sharer profile
                } label: {
                    HStack {
                        Image(systemName: "eye.fill")
                        Text("预览我的分享页")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(CoffeeLinkTheme.surfaceCard)
                    .foregroundStyle(CoffeeLinkTheme.primaryEspresso)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(CoffeeLinkTheme.primaryEspresso, lineWidth: 1.5)
                    )
                }
                .ambientShadow(level: 1)
                .iosInteractiveFeedback()
            }
            .padding(.horizontal, CoffeeLinkTheme.marginMain)
            .padding(.vertical, CoffeeLinkTheme.stackMd)
        }
        .background(CoffeeLinkTheme.warmRiceWhite.ignoresSafeArea())
        .navigationTitle("分享中心")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct BentoManageCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let tag: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                Spacer()
                if let tag = tag {
                    Text(tag)
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(CoffeeLinkTheme.caramelOrangeContainer.opacity(0.2))
                        .foregroundStyle(CoffeeLinkTheme.secondaryCaramel)
                        .clipShape(Capsule())
                }
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.textPrimary)
                Text(subtitle)
                    .font(.system(size: 11))
                    .foregroundStyle(CoffeeLinkTheme.textSecondary)
                    .lineLimit(1)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CoffeeLinkTheme.surfaceCard)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .ambientShadow(level: 1)
    }
}
`
  }
];
