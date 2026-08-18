import Foundation
import Observation

enum AppStoreError: LocalizedError, Sendable {
    case sharerNotFound
    case themeNotFound
    case slotNotFound
    case topicSwapUnavailable
    case invalidSessionState
    case persistenceFailed

    var errorDescription: String? {
        switch self {
        case .sharerNotFound: "未找到分享者"
        case .themeNotFound: "未找到对谈主题"
        case .slotNotFound: "未找到可约时间"
        case .topicSwapUnavailable: "对方暂未开启主题互换"
        case .invalidSessionState: "当前状态不能执行该操作"
        case .persistenceFailed: "本地数据保存失败"
        }
    }
}

@MainActor @Observable
final class AppStore {
    private(set) var snapshot: AppSnapshot
    var lastErrorMessage: String?
    private let persistence: LocalPersistence
    private let credentialPersistence: CredentialPersistence
    private var remote: APIRepository?
    private var credentialPassword: String?

    init(
        snapshot: AppSnapshot = .demo,
        persistence: LocalPersistence = .live,
        credentialPersistence: CredentialPersistence = .live,
        remote: APIRepository? = nil
    ) {
        self.persistence = persistence
        self.credentialPersistence = credentialPersistence
        self.remote = remote
        do {
            self.snapshot = Self.normalizeLoadedSnapshot(try persistence.load() ?? snapshot)
            self.lastErrorMessage = nil
        } catch {
            self.snapshot = .demo
            self.lastErrorMessage = "演示数据已恢复"
        }
        do {
            self.credentialPassword = try credentialPersistence.load() ?? "Pass123456"
        } catch {
            self.credentialPassword = nil
            self.lastErrorMessage = "凭据读取失败，请稍后重试"
        }
        CoffeeLinkTheme.activate(self.snapshot.currentUser.appearanceThemeID)
    }

    func bootstrapRemote() async {
        guard var remote else { return }
        do {
            if remote.client.accessToken == nil {
                try await remote.login(phone: "13800000001", password: "Pass123456")
            }
            let remoteSnapshot = try await remote.bootstrap()
            self.remote = remote
            snapshot = remoteSnapshot
            snapshot.currentUser.isLoggedIn = true
            lastErrorMessage = nil
        } catch {
            lastErrorMessage = "后端连接失败：\((error as? LocalizedError)?.errorDescription ?? "请检查服务")"
        }
    }

    func session(id: String) -> ChatSession? {
        snapshot.sessions.first { $0.id == id }
    }

    @discardableResult
    func submitInvitation(
        sharerID: String,
        type: SessionType,
        themeID: String,
        question: String,
        slotIDs: [String]
    ) throws -> String {
        guard type == .coffee else { throw AppStoreError.invalidSessionState }
        let sharer = try sharer(id: sharerID)
        let theme = try theme(id: themeID, for: sharer)
        let slots = try slotLabels(slotIDs, for: sharer)
        let id = nextSessionID()
        let session = ChatSession(
            id: id,
            type: .coffee,
            orderNumber: "INV-DEMO-\(String(format: "%04d", snapshot.sessions.count + 1))",
            senderID: snapshot.currentUser.id,
            senderName: snapshot.currentUser.name,
            senderTitle: "\(snapshot.currentUser.title) @ \(snapshot.currentUser.company)",
            senderAvatarURL: snapshot.currentUser.avatarURL,
            receiverID: sharer.id,
            receiverName: sharer.name,
            receiverTitle: "\(sharer.title) @ \(sharer.company)",
            receiverAvatarURL: sharer.avatarURL,
            themeID: theme.id,
            themeTitle: theme.title,
            themeDescription: theme.description,
            offeredThemeID: nil,
            offeredThemeTitle: nil,
            offeredThemeDescription: nil,
            question: question,
            offering: nil,
            receiverQuestion: nil,
            candidateSlots: slots,
            confirmedSlotID: nil,
            confirmedSlot: nil,
            coffeeDrink: sharer.signatureDrink,
            price: sharer.signatureDrink.price,
            paymentMethod: nil,
            paymentDeadline: nil,
            status: .pendingResponse,
            statusLabel: "待对方回应",
            declineReason: nil,
            meetingType: "腾讯会议",
            meetingID: meetingID(from: sharer.meetingLink),
            meetingLink: sharer.meetingLink,
            createdAt: "刚刚",
            durationMinutes: 30,
            review: nil,
            complaintReason: nil
        )
        let previousSnapshot = snapshot
        snapshot.sessions.insert(session, at: 0)
        guard save() else {
            snapshot = previousSnapshot
            throw AppStoreError.persistenceFailed
        }
        Task { try? await remote?.createCoffee(sharerId: sharerID, themeId: themeID, question: question, slotIds: slotIDs) }
        return id
    }

    @discardableResult
    func submitTopicSwap(
        sharerID: String,
        requestedThemeID: String,
        offeredThemeID: String,
        question: String,
        offering: String,
        slotIDs: [String]
    ) throws -> String {
        let sharer = try sharer(id: sharerID)
        guard sharer.acceptsTopicSwap else { throw AppStoreError.topicSwapUnavailable }
        let requestedTheme = try theme(id: requestedThemeID, for: sharer)
        guard let offeredTheme = snapshot.currentUser.myThemes.first(where: { $0.id == offeredThemeID }) else {
            throw AppStoreError.themeNotFound
        }
        let slots = try slotLabels(slotIDs, for: sharer)
        let id = nextSessionID()
        let session = ChatSession(
            id: id,
            type: .topicSwap,
            orderNumber: "SWP-DEMO-\(String(format: "%04d", snapshot.sessions.count + 1))",
            senderID: snapshot.currentUser.id,
            senderName: snapshot.currentUser.name,
            senderTitle: "\(snapshot.currentUser.title) @ \(snapshot.currentUser.company)",
            senderAvatarURL: snapshot.currentUser.avatarURL,
            receiverID: sharer.id,
            receiverName: sharer.name,
            receiverTitle: "\(sharer.title) @ \(sharer.company)",
            receiverAvatarURL: sharer.avatarURL,
            themeID: requestedTheme.id,
            themeTitle: requestedTheme.title,
            themeDescription: requestedTheme.description,
            offeredThemeID: offeredTheme.id,
            offeredThemeTitle: offeredTheme.title,
            offeredThemeDescription: offeredTheme.description,
            question: question,
            offering: offering,
            receiverQuestion: nil,
            candidateSlots: slots,
            confirmedSlotID: nil,
            confirmedSlot: nil,
            coffeeDrink: nil,
            price: nil,
            paymentMethod: nil,
            paymentDeadline: nil,
            status: .pendingResponse,
            statusLabel: "待对方回应",
            declineReason: nil,
            meetingType: "腾讯会议",
            meetingID: meetingID(from: sharer.meetingLink),
            meetingLink: sharer.meetingLink,
            createdAt: "刚刚",
            durationMinutes: 30,
            review: nil,
            complaintReason: nil
        )
        let previousSnapshot = snapshot
        snapshot.sessions.insert(session, at: 0)
        guard save() else {
            snapshot = previousSnapshot
            throw AppStoreError.persistenceFailed
        }
        Task { try? await remote?.createSwap(sharerId: sharerID, requestedThemeId: requestedThemeID, offeredThemeId: offeredThemeID, question: question, offering: offering, slotIds: slotIDs) }
        return id
    }

    @discardableResult
    func acceptInvitation(id: String, confirmedSlotID: String, receiverQuestion: String?) -> Bool {
        guard let existing = session(id: id), existing.status == .pendingResponse || existing.status == .needsNewTime else {
            lastErrorMessage = AppStoreError.invalidSessionState.localizedDescription
            return false
        }
        guard let confirmedSlot = availableSlot(receiverID: existing.receiverID, id: confirmedSlotID), existing.candidateSlots.contains(confirmedSlot.label) else {
            lastErrorMessage = "请选择仍可用的对谈时段"
            return false
        }
        let trimmedQuestion = receiverQuestion?.trimmingCharacters(in: .whitespacesAndNewlines)
        guard existing.type != .topicSwap || (trimmedQuestion?.count ?? 0) >= 8 else {
            lastErrorMessage = "主题互换请补充不少于 8 个字的问题"
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].confirmedSlotID = confirmedSlot.id
            snapshot.sessions[index].confirmedSlot = confirmedSlot.label
            snapshot.sessions[index].receiverQuestion = trimmedQuestion?.isEmpty == false ? trimmedQuestion : nil
            snapshot.sessions[index].status = snapshot.sessions[index].type == .coffee ? .acceptedPendingPayment : .swapScheduled
            snapshot.sessions[index].statusLabel = snapshot.sessions[index].type == .coffee ? "待付款" : "已排期"
            reserveSlot(receiverID: existing.receiverID, id: confirmedSlot.id, snapshot: &snapshot)
        }
        if didUpdate {
            Task { try? await remote?.accept(sessionId: id, confirmedSlotId: confirmedSlotID, receiverQuestion: receiverQuestion) }
        }
        return didUpdate
    }

    @discardableResult
    func declineInvitation(id: String, reason: String) -> Bool {
        let trimmedReason = reason.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedReason.isEmpty, let existing = session(id: id), existing.status == .pendingResponse || existing.status == .needsNewTime else {
            lastErrorMessage = "请选择婉拒原因"
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].status = .declined
            snapshot.sessions[index].statusLabel = "已婉拒"
            snapshot.sessions[index].declineReason = trimmedReason
        }
        if didUpdate {
            Task { try? await remote?.decline(sessionId: id, reason: trimmedReason) }
        }
        return didUpdate
    }

    @discardableResult
    func completePayment(id: String, method: PaymentMethod) -> Bool {
        guard let existing = session(id: id), existing.type == .coffee, existing.status == .acceptedPendingPayment else {
            lastErrorMessage = AppStoreError.invalidSessionState.localizedDescription
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].paymentMethod = method
            snapshot.sessions[index].paymentDeadline = nil
            snapshot.sessions[index].status = .booked
            snapshot.sessions[index].statusLabel = "已预约"
        }
        if didUpdate {
            Task { try? await remote?.pay(sessionId: id) }
        }
        return didUpdate
    }

    @discardableResult
    func cancelSession(id: String) -> Bool {
        guard let existing = session(id: id), [.pendingResponse, .needsNewTime, .booked, .swapScheduled].contains(existing.status) else {
            lastErrorMessage = AppStoreError.invalidSessionState.localizedDescription
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].status = .cancelled
            snapshot.sessions[index].statusLabel = "已取消"
        }
        if didUpdate {
            Task { try? await remote?.cancel(sessionId: id) }
        }
        return didUpdate
    }

    @discardableResult
    func submitReview(id: String, rating: Int, comment: String, tag: String? = nil) -> Bool {
        guard let existing = session(id: id), existing.status == .completed, (1...5).contains(rating) else {
            lastErrorMessage = "请完成 1 至 5 星评价"
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].review = SessionReview(rating: rating, comment: comment.trimmingCharacters(in: .whitespacesAndNewlines), tag: tag, createdAt: "刚刚")
        }
        if didUpdate {
            Task { try? await remote?.review(sessionId: id, rating: rating, comment: comment.trimmingCharacters(in: .whitespacesAndNewlines), tag: tag) }
        }
        return didUpdate
    }

    @discardableResult
    func submitComplaint(id: String, category: String, description: String) -> Bool {
        let trimmedCategory = category.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedDescription = description.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedCategory.isEmpty else {
            lastErrorMessage = "请选择投诉类别"
            return false
        }
        guard !trimmedDescription.isEmpty else {
            lastErrorMessage = "请填写问题说明"
            return false
        }
        guard let existing = session(id: id), existing.status == .completed else {
            lastErrorMessage = AppStoreError.invalidSessionState.localizedDescription
            return false
        }
        let didUpdate = updateSession(id: id) { snapshot, index in
            snapshot.sessions[index].complaintReason = "\(trimmedCategory)：\(trimmedDescription)"
            snapshot.sessions[index].status = .inAfterSale
            snapshot.sessions[index].statusLabel = "售后中"
        }
        if didUpdate {
            Task { try? await remote?.complaint(sessionId: id, category: trimmedCategory, description: trimmedDescription) }
        }
        return didUpdate
    }

    @discardableResult
    func updateProfile(_ profile: UserProfile) -> Bool {
        let didSave = updateCurrentUser { $0 = profile }
        if didSave {
            Task { try? await remote?.updateProfile(name: profile.name, title: profile.title, company: profile.company) }
        }
        return didSave
    }

    @discardableResult
    func updateThemes(_ themes: [ChatTheme]) -> Bool {
        guard themes.count <= 3,
              themes.allSatisfy({ !$0.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !$0.description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) else {
            lastErrorMessage = "最多可上架 3 个填写完整的分享主题"
            return false
        }
        return updateCurrentUser { $0.myThemes = themes }
    }

    @discardableResult
    func selectDrink(id: String) -> Bool {
        guard let drink = DemoData.coffeeCatalog.first(where: { $0.id == id }) else {
            lastErrorMessage = "未找到签名饮品"
            return false
        }
        return updateCurrentUser { $0.signatureDrink = drink }
    }

    @discardableResult
    func updateTopicSwapSettings(accepts: Bool, weeklyLimit: Int) -> Bool {
        guard [1, 2, 3, 5].contains(weeklyLimit) else {
            lastErrorMessage = "请选择有效的每周互换上限"
            return false
        }
        return updateCurrentUser {
            $0.acceptsTopicSwap = accepts
            $0.weeklySwapLimit = weeklyLimit
        }
    }

    @discardableResult
    func updateAvailableSlots(_ slots: [AvailableSlot]) -> Bool {
        let trimmedSlots = slots.map {
            AvailableSlot(id: $0.id, label: $0.label.trimmingCharacters(in: .whitespacesAndNewlines), isAvailable: $0.isAvailable)
        }
        guard trimmedSlots.allSatisfy({ !$0.id.isEmpty && !$0.label.isEmpty }), Set(trimmedSlots.map(\.id)).count == trimmedSlots.count else {
            lastErrorMessage = "请填写有效的可约时段"
            return false
        }
        guard Set(trimmedSlots.map(\.label)).count == trimmedSlots.count else {
            lastErrorMessage = "可约时段不能重复"
            return false
        }
        guard !snapshot.currentUser.isSharingOpen || trimmedSlots.contains(where: \.isAvailable) else {
            lastErrorMessage = "开放分享期间，请至少保留一个可预约时段"
            return false
        }
        return updateCurrentUser { $0.availableSlots = trimmedSlots }
    }

    @discardableResult
    func updateMeetingLink(_ value: String) -> Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: trimmed), url.scheme == "https", url.host == "meeting.tencent.com", !url.lastPathComponent.isEmpty else {
            lastErrorMessage = "请输入有效的腾讯会议链接"
            return false
        }
        return updateCurrentUser { $0.meetingLink = url }
    }

    @discardableResult
    func updateAppearance(
        themeID: AppearanceThemeID,
        autoCalendarSync: Bool,
        defaultMeetingReady: Bool,
        hapticsEnabled: Bool
    ) -> Bool {
        let didSave = updateCurrentUser {
            $0.appearanceThemeID = themeID
            $0.autoCalendarSync = autoCalendarSync
            $0.defaultMeetingReady = defaultMeetingReady
            $0.hapticsEnabled = hapticsEnabled
        }
        if didSave { CoffeeLinkTheme.activate(themeID) }
        return didSave
    }

    @discardableResult
    func toggleSharing() -> Bool {
        if snapshot.currentUser.isSharingOpen {
            return updateCurrentUser { $0.isSharingOpen = false }
        }
        guard snapshot.currentUser.isSharingReady else {
            lastErrorMessage = "请先完成实名认证、公开资料、主题、签名饮品、可约时段和腾讯会议链接"
            return false
        }
        return updateCurrentUser { $0.isSharingOpen = true }
    }

    func login(phone: String, password: String) -> Bool {
        let normalizedPhone = AuthValidator.normalizedPhone(phone)
        guard let credentialPassword else {
            lastErrorMessage = "凭据读取失败，请稍后重试"
            return false
        }
        guard AuthValidator.isMainlandPhone(normalizedPhone), password == credentialPassword else {
            lastErrorMessage = "手机号或密码不正确"
            return false
        }
        let previousSnapshot = snapshot
        snapshot.currentUser.phone = normalizedPhone
        snapshot.currentUser.isLoggedIn = true
        lastErrorMessage = nil
        guard save() else {
            snapshot = previousSnapshot
            return false
        }
        return true
    }

    @discardableResult
    func register(phone: String, password: String) -> Bool {
        let previousSnapshot = snapshot
        let previousCredential = credentialPassword
        do {
            try credentialPersistence.save(password)
        } catch {
            lastErrorMessage = "凭据保存失败，请稍后重试"
            return false
        }
        credentialPassword = password
        snapshot.currentUser.phone = AuthValidator.normalizedPhone(phone)
        snapshot.currentUser.isLoggedIn = false
        lastErrorMessage = nil
        guard save() else {
            snapshot = previousSnapshot
            rollbackCredential(to: previousCredential)
            return false
        }
        return true
    }

    @discardableResult
    func resetPassword(_ password: String) -> Bool {
        let previousSnapshot = snapshot
        let previousCredential = credentialPassword
        do {
            try credentialPersistence.save(password)
        } catch {
            lastErrorMessage = "凭据保存失败，请稍后重试"
            return false
        }
        credentialPassword = password
        snapshot.currentUser.isLoggedIn = false
        lastErrorMessage = nil
        guard save() else {
            snapshot = previousSnapshot
            rollbackCredential(to: previousCredential)
            return false
        }
        return true
    }

    func setLoggedIn(_ isLoggedIn: Bool) {
        snapshot.currentUser.isLoggedIn = isLoggedIn
        save()
    }

    func resetDemoData() {
        let previousSnapshot = snapshot
        let previousCredential = credentialPassword
        do {
            try credentialPersistence.reset()
        } catch {
            lastErrorMessage = "凭据清除失败，请稍后重试"
            return
        }
        credentialPassword = "Pass123456"
        snapshot = .demo
        lastErrorMessage = nil
        guard save() else {
            snapshot = previousSnapshot
            rollbackCredential(to: previousCredential)
            return
        }
        CoffeeLinkTheme.activate(snapshot.currentUser.appearanceThemeID)
    }

    @discardableResult
    private func updateSession(id: String, mutate: (inout AppSnapshot, Int) -> Void) -> Bool {
        guard let index = snapshot.sessions.firstIndex(where: { $0.id == id }) else {
            lastErrorMessage = "未找到对谈"
            return false
        }
        let previousSnapshot = snapshot
        mutate(&snapshot, index)
        guard save() else {
            snapshot = previousSnapshot
            return false
        }
        return true
    }

    @discardableResult
    private func updateCurrentUser(_ mutate: (inout UserProfile) -> Void) -> Bool {
        let previousSnapshot = snapshot
        var candidate = snapshot.currentUser
        mutate(&candidate)
        guard !candidate.isSharingOpen || candidate.isSharingReady else {
            lastErrorMessage = "开放分享期间，请保持实名认证、公开资料、分享主题、签名饮品、可约时段和腾讯会议链接完整"
            return false
        }
        snapshot.currentUser = candidate
        guard save() else {
            snapshot = previousSnapshot
            return false
        }
        return true
    }

    func availableSlots(for session: ChatSession) -> [AvailableSlot] {
        liveSlots(for: session.receiverID).filter { $0.isAvailable && session.candidateSlots.contains($0.label) }
    }

    private func availableSlot(receiverID: String, id: String) -> AvailableSlot? {
        liveSlots(for: receiverID).first { $0.id == id && $0.isAvailable }
    }

    private func liveSlots(for receiverID: String) -> [AvailableSlot] {
        if receiverID == snapshot.currentUser.id { return snapshot.currentUser.availableSlots }
        return snapshot.sharers.first(where: { $0.id == receiverID })?.availableDays.flatMap(\.slots) ?? []
    }

    private func reserveSlot(receiverID: String, id: String, snapshot: inout AppSnapshot) {
        if receiverID == snapshot.currentUser.id {
            guard let index = snapshot.currentUser.availableSlots.firstIndex(where: { $0.id == id }) else { return }
            snapshot.currentUser.availableSlots[index].isAvailable = false
            return
        }
        guard let sharerIndex = snapshot.sharers.firstIndex(where: { $0.id == receiverID }) else { return }
        for dayIndex in snapshot.sharers[sharerIndex].availableDays.indices {
            guard let slotIndex = snapshot.sharers[sharerIndex].availableDays[dayIndex].slots.firstIndex(where: { $0.id == id }) else { continue }
            snapshot.sharers[sharerIndex].availableDays[dayIndex].slots[slotIndex].isAvailable = false
            return
        }
    }

    private func sharer(id: String) throws -> Sharer {
        guard let sharer = snapshot.sharers.first(where: { $0.id == id }) else { throw AppStoreError.sharerNotFound }
        return sharer
    }

    private func theme(id: String, for sharer: Sharer) throws -> ChatTheme {
        guard let theme = sharer.themes.first(where: { $0.id == id }) else { throw AppStoreError.themeNotFound }
        return theme
    }

    private func slotLabels(_ ids: [String], for sharer: Sharer) throws -> [String] {
        try ids.map { id in
            guard let slot = sharer.slot(id: id) else { throw AppStoreError.slotNotFound }
            return slot.label
        }
    }

    private func nextSessionID() -> String { "session-demo-\(snapshot.sessions.count + 1)" }

    private func meetingID(from link: URL?) -> String {
        link?.lastPathComponent ?? "832 910 293"
    }

    @discardableResult
    private func save() -> Bool {
        do {
            try persistence.save(snapshot)
            lastErrorMessage = nil
            return true
        } catch {
            lastErrorMessage = "本地数据保存失败"
            return false
        }
    }

    private func rollbackCredential(to previousCredential: String?) {
        do {
            if let previousCredential {
                try credentialPersistence.save(previousCredential)
            } else {
                try credentialPersistence.reset()
            }
            credentialPassword = previousCredential
        } catch {
            lastErrorMessage = "本地数据保存失败；凭据回滚失败"
        }
    }

    private static func normalizeLoadedSnapshot(_ snapshot: AppSnapshot) -> AppSnapshot {
        var normalized = snapshot
        if !normalized.currentUser.availableSlotsFieldWasPresent {
            normalized.currentUser.availableSlots = DemoData.incomingAvailableSlots
            normalized.currentUser.availableSlotsFieldWasPresent = true
        }
        if normalized.currentUser.isSharingOpen && !normalized.currentUser.isSharingReady {
            normalized.currentUser.isSharingOpen = false
        }
        return normalized
    }
}
