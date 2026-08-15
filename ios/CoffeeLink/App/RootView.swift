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
    @State private var launchSharerDetailID: String?
    @State private var launchSharingCenter = false
    @State private var launchProfilePreview = false
    @State private var chatsStartIncomingPending = false
    private let paymentResult: PaymentResult?
    private let authReferenceState: Bool
    private let persistenceMode: String
    private let credentialMode: String

    init() {
        let arguments = ProcessInfo.processInfo.arguments
        let environment = ProcessInfo.processInfo.environment
        let usesPersistentUITesting = arguments.contains("-persistent-ui-testing") || environment["COFFEELINK_PERSISTENT_UI_TESTING"] == "1"
        let resetsPersistentDemo = arguments.contains("-reset-demo") || environment["COFFEELINK_RESET_PERSISTENT_DEMO"] == "1"
        if usesPersistentUITesting, resetsPersistentDemo { UITestingLaunchCoordinator.resetPersistentDemoOnce() }
        let usesIsolatedPersistence = (arguments.contains("-ui-testing") || arguments.contains("-reset-demo")) && !usesPersistentUITesting
        let persistence: LocalPersistence = usesPersistentUITesting ? .uiTesting : usesIsolatedPersistence ? .inMemory : .live
        persistenceMode = usesPersistentUITesting ? "ui-testing-persistent" : usesIsolatedPersistence ? "ui-testing-isolated" : "live"
        let credentialPersistence: CredentialPersistence = usesPersistentUITesting ? .uiTesting() : usesIsolatedPersistence ? .inMemory() : .live
        credentialMode = credentialPersistence.scope.rawValue
        var snapshot = AppSnapshot.demo
        let requestedScreen = Self.launchValue(arguments: arguments, flag: "-present") ?? Self.launchValue(arguments: arguments, flag: "-screen")
        if let requestedAppearance = Self.launchValue(arguments: arguments, flag: "-appearance"),
           let appearance = AppearanceThemeID(rawValue: requestedAppearance) {
            snapshot.currentUser.appearanceThemeID = appearance
        }
        if arguments.contains("-logged-out") || requestedScreen == "invite" { snapshot.currentUser.isLoggedIn = false }
        _store = State(initialValue: AppStore(snapshot: snapshot, persistence: persistence, credentialPersistence: credentialPersistence))
        let chatsScreens = ["chats", "accept", "decline", "meeting", "review", "complaint"]
        let mineScreens = ["profile", "sharing-center", "profile-preview", "edit-profile", "themes", "drink", "topic-swap", "appearance", "slots", "meeting-link"]
        _selectedTab = State(initialValue: chatsScreens.contains(requestedScreen ?? "") ? .chats : mineScreens.contains(requestedScreen ?? "") ? .mine : .discover)
        let initialSheet: SheetRoute? = switch requestedScreen {
        case "accept": .acceptInvitation("ord-in-ecoffee-1")
        case "decline": .declineInvitation("ord-in-ecoffee-1")
        case "meeting": .meeting(sessionID: "ord-out-booked-1")
        case "review": .review("ord-completed-1")
        case "complaint": .complaint("ord-completed-1")
        case "edit-profile": .editProfile
        case "themes": .manageThemes
        case "drink": .selectDrink
        case "topic-swap": .topicSwapSettings
        case "appearance": .settings
        case "slots": .manageSlots
        case "meeting-link": .meetingLinkSettings
        default: nil
        }
        _sheetRoute = State(initialValue: initialSheet)
        let mode = Self.launchValue(arguments: arguments, flag: "-auth-mode")
        _authMode = State(initialValue: requestedScreen == "login" || arguments.contains("-present-login") ? .login : requestedScreen == "register" || arguments.contains("-present-register") ? .register : requestedScreen == "reset" || arguments.contains("-present-reset") ? .reset : AuthMode(rawValue: mode ?? ""))
        authReferenceState = requestedScreen == "login" || requestedScreen == "register" || requestedScreen == "reset" || arguments.contains("-present-login") || arguments.contains("-present-register") || arguments.contains("-present-reset")
        _launchInvite = State(initialValue: requestedScreen == "invite" || arguments.contains("-present-invite"))
        _launchCheckoutID = State(initialValue: requestedScreen == "checkout" || arguments.contains("-present-checkout") || Self.launchValue(arguments: arguments, flag: "-payment-result") != nil ? "ord-out-accepted-pay-1" : nil)
        _launchSharerDetailID = State(initialValue: requestedScreen == "sharer-detail" ? "elena-rodriguez" : nil)
        _launchSharingCenter = State(initialValue: requestedScreen == "sharing-center" || ["edit-profile", "themes", "drink", "topic-swap", "appearance", "slots", "meeting-link"].contains(requestedScreen ?? ""))
        _launchProfilePreview = State(initialValue: requestedScreen == "profile-preview")
        paymentResult = PaymentResult(rawValue: Self.launchValue(arguments: arguments, flag: "-payment-result") ?? "")
    }

    var body: some View {
        ZStack {
            NavigationStack(path: $navigationPath) {
                VStack(spacing: 0) {
                    CoffeeTopBar(
                        title: selectedTab.title,
                        trailingAction: { sheetRoute = .settings },
                        trailingSystemImage: selectedTab == .mine ? "gearshape" : "ellipsis",
                        trailingAccessibilityIdentifier: selectedTab == .mine ? "profile.settings" : nil
                    )
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
                sheetDestination(route)
                    .presentationDetents(sheetDetents(for: route))
                    .presentationDragIndicator(.visible)
            }
            if let authMode {
                AuthFlowView(store: store, initialMode: authMode, referencePresentation: authReferenceState, onAuthenticated: resumePendingInvitation, onDismiss: { self.authMode = nil })
                    .transition(.opacity)
                    .zIndex(2)
            }
            Color.clear
                .frame(width: 1, height: 1)
                .accessibilityElement()
                .accessibilityIdentifier("app.theme")
                .accessibilityValue(store.snapshot.currentUser.appearanceThemeID.rawValue)
            Color.clear
                .frame(width: 1, height: 1)
                .accessibilityElement()
                .accessibilityIdentifier("app.persistence-mode")
                .accessibilityValue(persistenceMode)
            Color.clear
                .frame(width: 1, height: 1)
                .accessibilityElement()
                .accessibilityIdentifier("app.credential-mode")
                .accessibilityValue(credentialMode)
        }
        .onAppear { presentLaunchRouteIfNeeded() }
        .onChange(of: selectedTab) { _, newTab in
            navigationPath.removeAll()
            if newTab != .chats { chatsStartIncomingPending = false }
        }
        .preferredColorScheme(store.snapshot.currentUser.appearanceThemeID.isLight ? .light : .dark)
    }

    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .discover:
            DiscoverView(store: store, path: $navigationPath)
        case .chats:
            ChatsListView(
                store: store,
                path: $navigationPath,
                presentSheet: { route in sheetRoute = route },
                initialDirection: chatsStartIncomingPending ? .incoming : .sent,
                initialFilter: chatsStartIncomingPending ? .pending : .all
            )
            .id(chatsStartIncomingPending)
        case .mine:
            ProfileView(
                profile: store.snapshot.currentUser,
                openSharingCenter: { navigationPath.append(.sharingCenter) },
                openChats: { chatsStartIncomingPending = false; selectedTab = .chats },
                openAppearance: { sheetRoute = .settings },
                logout: { store.setLoggedIn(false) }
            )
        }
    }

    @ViewBuilder
    private func routeDestination(_ route: AppRoute) -> some View {
        switch route {
        case .sharerDetail(let id):
            if id == store.snapshot.currentUser.id {
                SharerDetailView(sharer: currentUserPreview, path: $navigationPath, isPreview: true)
            } else if let sharer = store.snapshot.sharers.first(where: { $0.id == id }) {
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
            ChatDetailView(store: store, sessionID: id, onBack: { _ = navigationPath.popLast() }, openCheckout: { checkoutID in
                navigationPath = [.checkout(checkoutID)]
            }, presentSheet: { route in
                sheetRoute = route
            })
        case .sharingCenter:
            SharingCenterView(
                store: store,
                onBack: { _ = navigationPath.popLast() },
                presentSheet: { sheetRoute = $0 },
                previewProfile: { navigationPath.append(.sharerDetail(store.snapshot.currentUser.id)) },
                openPendingInvitations: openIncomingPendingInvitations
            )
        }
    }

    private func openChatDetail(_ id: String) {
        navigationPath = [.chatDetail(id)]
    }

    @ViewBuilder
    private func sheetDestination(_ route: SheetRoute) -> some View {
        switch route {
        case .acceptInvitation(let id):
            if let session = store.session(id: id) {
                AcceptInvitationSheet(store: store, session: session) { sheetRoute = nil }
            } else { SheetPlaceholderView(route: route) }
        case .declineInvitation(let id):
            if let session = store.session(id: id) {
                DeclineInvitationSheet(store: store, session: session) { sheetRoute = nil }
            } else { SheetPlaceholderView(route: route) }
        case .meeting(let id):
            if let session = store.session(id: id) { MeetingSheet(session: session) }
            else { SheetPlaceholderView(route: route) }
        case .review(let id):
            if let session = store.session(id: id) { ReviewSheet(store: store, session: session) { sheetRoute = nil } }
            else { SheetPlaceholderView(route: route) }
        case .complaint(let id):
            if let session = store.session(id: id) { ComplaintSheet(store: store, session: session) { sheetRoute = nil } }
            else { SheetPlaceholderView(route: route) }
        case .settings:
            AppearanceSheet(store: store) { sheetRoute = nil }
        case .editProfile:
            EditProfileSheet(store: store) { sheetRoute = nil }
        case .manageThemes:
            ManageThemesSheet(store: store) { sheetRoute = nil }
        case .selectDrink:
            SelectDrinkSheet(store: store) { sheetRoute = nil }
        case .topicSwapSettings:
            TopicSwapSettingsSheet(store: store) { sheetRoute = nil }
        case .manageSlots:
            ManageSlotsSheet(store: store) { sheetRoute = nil }
        case .meetingLinkSettings:
            MeetingLinkSettingsSheet(store: store) { sheetRoute = nil }
        case .auth:
            SheetPlaceholderView(route: route)
        }
    }

    private func sheetDetents(for route: SheetRoute) -> Set<PresentationDetent> {
        switch route {
        case .acceptInvitation, .review, .complaint, .settings, .editProfile, .manageThemes, .selectDrink, .manageSlots: [.large]
        default: [.medium]
        }
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
            navigationPath = paymentResult == nil ? [.checkout(id)] : [.chatDetail(id), .checkout(id)]
        }
        if let id = launchSharerDetailID {
            launchSharerDetailID = nil
            navigationPath = [.sharerDetail(id)]
        }
        if launchSharingCenter {
            launchSharingCenter = false
            navigationPath = [.sharingCenter]
        }
        if launchProfilePreview {
            launchProfilePreview = false
            navigationPath = [.sharingCenter, .sharerDetail(store.snapshot.currentUser.id)]
        }
    }

    private static func launchValue(arguments: [String], flag: String) -> String? {
        guard let index = arguments.firstIndex(of: flag), arguments.indices.contains(index + 1) else { return nil }
        return arguments[index + 1]
    }

    private func openIncomingPendingInvitations() {
        chatsStartIncomingPending = true
        navigationPath.removeAll()
        selectedTab = .chats
    }

    private var currentUserPreview: Sharer {
        let user = store.snapshot.currentUser
        return Sharer(
            id: user.id,
            name: user.name,
            title: user.title,
            company: user.company,
            avatarURL: user.avatarURL,
            industry: "AI 产品与增长",
            isVerified: user.isVerified,
            declarationNote: "职业信息由用户自行填写，平台未核验",
            highlights: ["从传统互联网产品转型 AI Native 产品经理。", "参与企业级 Agent 项目从需求验证到落地复盘。", "持续实践早期产品冷启动与用户增长。"],
            signatureDrink: user.signatureDrink,
            acceptsTopicSwap: user.acceptsTopicSwap,
            weeklySwapLimit: user.weeklySwapLimit,
            remainingSwapQuota: max(user.weeklySwapLimit - 1, 0),
            themes: user.myThemes,
            nextAvailableText: user.availableSlots.first(where: \.isAvailable).map { "最早可约：\($0.label)" } ?? "暂无可约时间",
            availableDays: [AvailabilityDay(date: "未来30天", dayOfWeek: "可预约", slotsCount: user.availableSlots.filter(\.isAvailable).count, isFull: !user.availableSlots.contains(where: \.isAvailable), slots: user.availableSlots)],
            reviews: [],
            rating: user.rating,
            reviewCount: user.completedSessionsCount,
            swapFeedbackCount: user.completedSwapsCount,
            meetingLink: user.meetingLink,
            onTimeRate: user.onTimeRate,
            responseMedianTime: "1.5小时"
        )
    }
}

@MainActor
private enum UITestingLaunchCoordinator {
    private static var didResetPersistentDemo = false

    static func resetPersistentDemoOnce() {
        guard !didResetPersistentDemo else { return }
        didResetPersistentDemo = true
        try? LocalPersistence.resetUITestingStorage()
        try? CredentialPersistence.resetUITestingStorage()
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
