import Foundation
import Observation

enum AppStoreError: LocalizedError, Sendable {
    case sharerNotFound
    case themeNotFound
    case slotNotFound
    case topicSwapUnavailable
    case invalidSessionState

    var errorDescription: String? {
        switch self {
        case .sharerNotFound: "未找到分享者"
        case .themeNotFound: "未找到对谈主题"
        case .slotNotFound: "未找到可约时间"
        case .topicSwapUnavailable: "对方暂未开启主题互换"
        case .invalidSessionState: "当前状态不能执行该操作"
        }
    }
}

@MainActor @Observable
final class AppStore {
    private(set) var snapshot: AppSnapshot
    var lastErrorMessage: String?
    private let persistence: LocalPersistence

    init(snapshot: AppSnapshot = .demo, persistence: LocalPersistence = .live) {
        self.persistence = persistence
        do {
            self.snapshot = try persistence.load() ?? snapshot
            self.lastErrorMessage = nil
        } catch {
            self.snapshot = .demo
            self.lastErrorMessage = "演示数据已恢复"
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
        snapshot.sessions.insert(session, at: 0)
        save()
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
        snapshot.sessions.insert(session, at: 0)
        save()
        return id
    }

    func acceptInvitation(id: String, confirmedSlotID: String, receiverQuestion: String?) {
        let confirmedSlot = snapshot.sharers.first { $0.id == session(id: id)?.receiverID }?.slot(id: confirmedSlotID)?.label ?? confirmedSlotID
        updateSession(id: id) { session in
            guard session.status == .pendingResponse || session.status == .needsNewTime else { return }
            session.confirmedSlot = confirmedSlot
            session.receiverQuestion = receiverQuestion
            session.status = session.type == .coffee ? .acceptedPendingPayment : .swapScheduled
            session.statusLabel = session.type == .coffee ? "待付款" : "已排期"
        }
    }

    func declineInvitation(id: String, reason: String? = nil) {
        updateSession(id: id) { session in
            guard session.status == .pendingResponse || session.status == .needsNewTime else { return }
            session.status = .declined
            session.statusLabel = "已婉拒"
            session.declineReason = reason
        }
    }

    func completePayment(id: String, method: PaymentMethod) {
        updateSession(id: id) { session in
            guard session.type == .coffee, session.status == .acceptedPendingPayment else { return }
            session.paymentMethod = method
            session.paymentDeadline = nil
            session.status = .booked
            session.statusLabel = "已预约"
        }
    }

    func cancelSession(id: String) {
        updateSession(id: id) { session in
            guard session.status != .completed, session.status != .cancelled else { return }
            session.status = .cancelled
            session.statusLabel = "已取消"
        }
    }

    func submitReview(id: String, rating: Int, comment: String, tag: String? = nil) {
        updateSession(id: id) { session in
            guard (1...5).contains(rating) else { return }
            session.review = SessionReview(rating: rating, comment: comment, tag: tag, createdAt: "刚刚")
        }
    }

    func submitComplaint(id: String, reason: String) {
        updateSession(id: id) { session in
            session.complaintReason = reason
            session.status = .inAfterSale
            session.statusLabel = "售后中"
        }
    }

    func updateProfile(_ profile: UserProfile) {
        snapshot.currentUser = profile
        save()
    }

    func resetDemoData() {
        snapshot = .demo
        lastErrorMessage = nil
        save()
    }

    private func updateSession(id: String, mutate: (inout ChatSession) -> Void) {
        guard let index = snapshot.sessions.firstIndex(where: { $0.id == id }) else { return }
        mutate(&snapshot.sessions[index])
        save()
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

    private func save() {
        do {
            try persistence.save(snapshot)
            lastErrorMessage = nil
        } catch {
            lastErrorMessage = "本地数据保存失败"
        }
    }
}
