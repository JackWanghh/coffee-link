import SwiftUI

struct RootView: View {
    @State private var store: AppStore
    @State private var selectedTab: AppTab = .discover
    @State private var navigationPath: [AppRoute] = []
    @State private var sheetRoute: SheetRoute?
    @State private var authMode: AuthMode?
    @State private var pendingInvitation: InvitationDraft?
    @State private var launchInvite = false
    @State private var launchCheckoutID: String?
    private let paymentResult: PaymentResult?

    init() {
        let arguments = ProcessInfo.processInfo.arguments
        let persistence: LocalPersistence = arguments.contains("-ui-testing") || arguments.contains("-reset-demo") ? .inMemory : .live
        var snapshot = AppSnapshot.demo
        let requestedScreen = Self.launchValue(arguments: arguments, flag: "-present") ?? Self.launchValue(arguments: arguments, flag: "-screen")
        if arguments.contains("-logged-out") || requestedScreen == "invite" { snapshot.currentUser.isLoggedIn = false }
        _store = State(initialValue: AppStore(snapshot: snapshot, persistence: persistence))
        let mode = Self.launchValue(arguments: arguments, flag: "-auth-mode")
        _authMode = State(initialValue: requestedScreen == "login" || arguments.contains("-present-login") ? .login : requestedScreen == "register" || arguments.contains("-present-register") ? .register : requestedScreen == "reset" || arguments.contains("-present-reset") ? .reset : AuthMode(rawValue: mode ?? ""))
        _launchInvite = State(initialValue: requestedScreen == "invite" || arguments.contains("-present-invite"))
        _launchCheckoutID = State(initialValue: requestedScreen == "checkout" || arguments.contains("-present-checkout") || Self.launchValue(arguments: arguments, flag: "-payment-result") != nil ? "ord-out-accepted-pay-1" : nil)
        paymentResult = PaymentResult(rawValue: Self.launchValue(arguments: arguments, flag: "-payment-result") ?? "")
    }

    var body: some View {
        ZStack {
            NavigationStack(path: $navigationPath) {
                VStack(spacing: 0) {
                    CoffeeTopBar(title: selectedTab.title) {
                        sheetRoute = .settings
                    }
                    tabContent
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(CoffeeLinkTheme.background)
                .navigationBarHidden(true)
                .navigationDestination(for: AppRoute.self, destination: routeDestination)
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if navigationPath.isEmpty {
                    CoffeeLinkTabBar(
                        selectedTab: $selectedTab,
                        hasUnreadChats: store.snapshot.sessions.contains { $0.receiverID == store.snapshot.currentUser.id && $0.status == .pendingResponse }
                    )
                }
            }
            .sheet(item: $sheetRoute) { route in
                SheetPlaceholderView(route: route)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.visible)
            }
            if let authMode {
                AuthFlowView(store: store, initialMode: authMode, onAuthenticated: resumePendingInvitation, onDismiss: { self.authMode = nil })
                    .transition(.opacity)
                    .zIndex(2)
            }
        }
        .onAppear { presentLaunchRouteIfNeeded() }
        .onChange(of: selectedTab) { _, _ in navigationPath.removeAll() }
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .discover:
            DiscoverView(store: store, path: $navigationPath)
        case .chats:
            ChatsTabView(sessions: store.snapshot.sessions)
        case .mine:
            ProfileTabView(profile: store.snapshot.currentUser) {
                navigationPath.append(.sharingCenter)
            }
        }
    }

    @ViewBuilder
    private func routeDestination(_ route: AppRoute) -> some View {
        switch route {
        case .sharerDetail(let id):
            if let sharer = store.snapshot.sharers.first(where: { $0.id == id }) {
                SharerDetailView(sharer: sharer, path: $navigationPath)
            } else {
                RoutePlaceholderView(title: "分享者详情", subtitle: "CoffeeLink")
            }
        case .createInvitation(let sharerID, let type, let themeID):
            if let sharer = store.snapshot.sharers.first(where: { $0.id == sharerID }) {
                CreateInvitationView(store: store, sharer: sharer, type: type, themeID: themeID, onRequireAuthentication: { draft in
                    pendingInvitation = draft
                    authMode = .login
                }, onSubmitted: openChatDetail, onDismiss: { _ = navigationPath.popLast() })
            } else { RoutePlaceholderView(title: "发起邀请", subtitle: "未找到分享者") }
        case .checkout(let id):
            BookingCheckoutView(store: store, sessionID: id, forcedResult: paymentResult, onCompleted: openChatDetail, onDismiss: { _ = navigationPath.popLast() })
        case .chatDetail(let id):
            ChatDetailPreview(session: store.session(id: id))
        case .sharingCenter:
            RoutePlaceholderView(title: "分享中心", subtitle: "管理主题、饮品与开放状态")
        }
    }

    private func openChatDetail(_ id: String) {
        navigationPath = [.chatDetail(id)]
    }

    private func resumePendingInvitation() {
        authMode = nil
        guard let draft = pendingInvitation else { return }
        pendingInvitation = nil
        do {
            let id: String
            if draft.type == .coffee {
                id = try store.submitInvitation(sharerID: draft.sharerID, type: .coffee, themeID: draft.selectedThemeID, question: draft.question, slotIDs: draft.selectedSlotIDs)
            } else {
                id = try store.submitTopicSwap(sharerID: draft.sharerID, requestedThemeID: draft.selectedThemeID, offeredThemeID: draft.offeredThemeID ?? "", question: draft.question, offering: draft.offering, slotIDs: draft.selectedSlotIDs)
            }
            openChatDetail(id)
        } catch { store.lastErrorMessage = error.localizedDescription }
    }

    private func presentLaunchRouteIfNeeded() {
        if launchInvite {
            launchInvite = false
            navigationPath = [.sharerDetail("elena-rodriguez"), .createInvitation(sharerID: "elena-rodriguez", type: .coffee, themeID: "product-roadmap")]
        }
        if let id = launchCheckoutID {
            launchCheckoutID = nil
            navigationPath = [.checkout(id)]
        }
    }

    private static func launchValue(arguments: [String], flag: String) -> String? {
        guard let index = arguments.firstIndex(of: flag), arguments.indices.contains(index + 1) else { return nil }
        return arguments[index + 1]
    }
}

private struct DiscoverTabView: View {
    let sharers: [Sharer]
    let openSharer: (Sharer) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("和真实做过的人，喝一杯有答案的咖啡")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text("发现值得交流的行业同侪，用 30 分钟交换一段认真经验。")
                    .font(.system(size: 14))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)

                ForEach(sharers) { sharer in
                    Button {
                        openSharer(sharer)
                    } label: {
                        CoffeeCard {
                            HStack(alignment: .top, spacing: 12) {
                                CoffeeAvatar(name: sharer.name, imageURL: sharer.avatarURL, size: 48)
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack(spacing: 6) {
                                        Text(sharer.name)
                                            .font(.system(size: 16, weight: .bold))
                                        if sharer.isVerified {
                                            Image(systemName: "checkmark.seal.fill")
                                                .foregroundStyle(CoffeeLinkTheme.accent)
                                        }
                                    }
                                    Text("\(sharer.title) · \(sharer.company)")
                                        .font(.system(size: 12))
                                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                        .lineLimit(1)
                                    CoffeeBadge(sharer.nextAvailableText, tone: .success)
                                }
                                Spacer(minLength: 0)
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                    .padding(.top, 5)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("查看 \(sharer.name) 的详情")
                }
            }
            .padding(20)
            .padding(.bottom, 8)
        }
    }
}

private struct ChatsTabView: View {
    let sessions: [ChatSession]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("对谈管理")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text("管理你发起的邀请与待回应的对谈。")
                    .font(.system(size: 14))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                ForEach(sessions.prefix(3)) { session in
                    CoffeeCard {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(session.type == .coffee ? "电子咖啡" : "主题互换")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                Spacer()
                                CoffeeBadge(session.statusLabel, tone: session.status == .booked ? .success : .accent)
                            }
                            Text(session.themeTitle)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.primaryText)
                                .lineLimit(2)
                            Text(session.createdAt)
                                .font(.system(size: 12))
                                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        }
                    }
                }
            }
            .padding(20)
        }
    }
}

private struct ProfileTabView: View {
    let profile: UserProfile
    let openSharingCenter: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("我的")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                CoffeeCard {
                    HStack(spacing: 14) {
                        CoffeeAvatar(name: profile.name, imageURL: profile.avatarURL, size: 60)
                        VStack(alignment: .leading, spacing: 5) {
                            Text(profile.name)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.primaryText)
                            Text("\(profile.title) · \(profile.company)")
                                .font(.system(size: 13))
                                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                .lineLimit(1)
                            CoffeeBadge(profile.isSharingOpen ? "正在开放分享" : "暂未开放", tone: profile.isSharingOpen ? .success : .neutral)
                        }
                    }
                }
                CoffeePrimaryButton(title: "进入分享中心", action: openSharingCenter)
                HStack(spacing: 10) {
                    profileStat(title: "对谈", value: "\(profile.totalChats)")
                    profileStat(title: "评分", value: String(format: "%.1f", profile.rating))
                    profileStat(title: "回复率", value: profile.replyRate)
                }
            }
            .padding(20)
        }
    }

    private func profileStat(title: String, value: String) -> some View {
        CoffeeCard {
            VStack(alignment: .leading, spacing: 6) {
                Text(value)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text(title)
                    .font(.system(size: 12))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

private struct RoutePlaceholderView: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 36))
                .foregroundStyle(CoffeeLinkTheme.accent)
            Text(title)
                .font(.system(size: 24, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
            Text(subtitle)
                .font(.system(size: 14))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(CoffeeLinkTheme.background)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct ChatDetailPreview: View {
    let session: ChatSession?

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("对谈详情").font(.system(size: 24, weight: .bold))
            if let session {
                CoffeeCard {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack { Text(session.type == .coffee ? "电子咖啡邀请" : "主题互换").font(.system(size: 13, weight: .semibold)); Spacer(); CoffeeBadge(session.statusLabel, tone: session.status == .booked ? .success : .accent) }
                        Text(session.themeTitle).font(.system(size: 18, weight: .bold))
                        Text(session.question).font(.system(size: 14)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(3)
                        Text(session.confirmedSlot ?? "等待对方确认时段").font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.accent)
                    }
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                }
            }
            Spacer()
        }
        .padding(20).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).background(CoffeeLinkTheme.background).navigationBarHidden(true)
    }
}

private struct SheetPlaceholderView: View {
    let route: SheetRoute
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 18) {
            Text(route.title)
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
            Text("该流程将在后续页面中完成。")
                .font(.system(size: 14))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
            CoffeePrimaryButton(title: "知道了") {
                dismiss()
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(CoffeeLinkTheme.surface)
    }
}
