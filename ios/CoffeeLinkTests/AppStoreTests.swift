import XCTest
@testable import CoffeeLink

final class AppStoreTests: XCTestCase {
    @MainActor
    func testFailedSnapshotSaveRollsBackLoginMutation() {
        let initial = AppSnapshot.demo
        let store = AppStore(snapshot: initial, persistence: failingSnapshotPersistence, credentialPersistence: .inMemory(initialPassword: "Original123"))

        XCTAssertFalse(store.login(phone: "13800138000", password: "Original123"))
        XCTAssertEqual(store.snapshot, initial)
        XCTAssertEqual(store.lastErrorMessage, "本地数据保存失败")
    }

    @MainActor
    func testFailedSnapshotSaveRollsBackRegistrationCredentialAndSnapshot() {
        let initial = AppSnapshot.demo
        let credentials = CredentialPersistence.inMemory(initialPassword: "Original123")
        let store = AppStore(snapshot: initial, persistence: failingSnapshotPersistence, credentialPersistence: credentials)

        XCTAssertFalse(store.register(phone: "13800138000", password: "Replacement123"))
        XCTAssertEqual(store.snapshot, initial)
        XCTAssertEqual(try credentials.load(), "Original123")
    }

    @MainActor
    func testFailedSnapshotSaveRollsBackResetCredentialAndSnapshot() {
        let initial = AppSnapshot.demo
        let credentials = CredentialPersistence.inMemory(initialPassword: "Original123")
        let store = AppStore(snapshot: initial, persistence: failingSnapshotPersistence, credentialPersistence: credentials)

        XCTAssertFalse(store.resetPassword("Replacement123"))
        XCTAssertEqual(store.snapshot, initial)
        XCTAssertEqual(try credentials.load(), "Original123")
    }

    @MainActor
    func testFailedSnapshotSaveRollsBackResetDemoData() {
        var initial = AppSnapshot.demo
        initial.currentUser.isLoggedIn = false
        let credentials = CredentialPersistence.inMemory(initialPassword: "Original123")
        let store = AppStore(snapshot: initial, persistence: failingSnapshotPersistence, credentialPersistence: credentials)

        store.resetDemoData()

        XCTAssertEqual(store.snapshot, initial)
        XCTAssertEqual(try credentials.load(), "Original123")
        XCTAssertEqual(store.lastErrorMessage, "本地数据保存失败")
    }

    @MainActor
    func testRegistrationCredentialSurvivesAppStoreRebuild() {
        let credentials = CredentialPersistence.inMemory()
        let firstStore = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)

        XCTAssertTrue(firstStore.register(phone: "13800138000", password: "NewPass123"))

        let rebuiltStore = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)
        XCTAssertTrue(rebuiltStore.login(phone: "13800138000", password: "NewPass123"))
        XCTAssertFalse(rebuiltStore.login(phone: "13800138000", password: "Pass123456"))
    }

    @MainActor
    func testResetCredentialSurvivesAppStoreRebuildAndInvalidatesPriorPassword() {
        let credentials = CredentialPersistence.inMemory(initialPassword: "Original123")
        let firstStore = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)

        XCTAssertTrue(firstStore.resetPassword("Replacement123"))

        let rebuiltStore = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)
        XCTAssertTrue(rebuiltStore.login(phone: "13800138000", password: "Replacement123"))
        XCTAssertFalse(rebuiltStore.login(phone: "13800138000", password: "Original123"))
    }

    @MainActor
    func testCredentialSaveFailureIsVisibleAndDoesNotReportRegistrationSuccess() {
        let store = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: .failing)
        let initialUser = store.snapshot.currentUser

        XCTAssertFalse(store.register(phone: "13800138000", password: "NewPass123"))
        XCTAssertEqual(store.lastErrorMessage, "凭据保存失败，请稍后重试")
        XCTAssertEqual(store.snapshot.currentUser, initialUser)
    }

    @MainActor
    func testResetDemoDataClearsIsolatedCredential() {
        let credentials = CredentialPersistence.inMemory(initialPassword: "Replacement123")
        let store = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)

        store.resetDemoData()

        let rebuiltStore = AppStore(snapshot: .demo, persistence: .inMemory, credentialPersistence: credentials)
        XCTAssertTrue(rebuiltStore.login(phone: "13800138000", password: "Pass123456"))
        XCTAssertFalse(rebuiltStore.login(phone: "13800138000", password: "Replacement123"))
    }

    @MainActor
    func testCoffeeInvitationRequiresPaymentAfterAcceptance() throws {
        let store = AppStore(snapshot: .demo, persistence: .inMemory)
        let id = try store.submitInvitation(
            sharerID: "elena-rodriguez",
            type: .coffee,
            themeID: "product-roadmap",
            question: "如何在资源受限时平衡技术债务与新商业功能？",
            slotIDs: ["slot-elena-1"]
        )
        XCTAssertEqual(store.snapshot.sessions.first?.id, id)
        XCTAssertEqual(store.session(id: id)?.statusLabel, "待对方回应")
        store.acceptInvitation(id: id, confirmedSlotID: "slot-elena-1", receiverQuestion: nil)
        XCTAssertEqual(store.session(id: id)?.status, .acceptedPendingPayment)
        XCTAssertEqual(store.session(id: id)?.statusLabel, "待付款")
        store.completePayment(id: id, method: .wechat)
        XCTAssertEqual(store.session(id: id)?.status, .booked)
        XCTAssertEqual(store.session(id: id)?.statusLabel, "已预约")
        store.submitComplaint(id: "ord-completed-1", category: "对谈未按约进行", description: "对方未按约接入会议")
        XCTAssertEqual(store.session(id: "ord-completed-1")?.statusLabel, "售后中")
    }

    @MainActor
    func testTopicSwapSchedulesWithoutPayment() throws {
        let store = AppStore(snapshot: .demo, persistence: .inMemory)
        let id = try store.submitTopicSwap(
            sharerID: "elena-rodriguez",
            requestedThemeID: "product-roadmap",
            offeredThemeID: "ai-product-growth",
            question: "如何建立产品路线图？",
            offering: "我可以分享 AI 产品冷启动经验。",
            slotIDs: ["slot-elena-1"]
        )
        XCTAssertEqual(store.snapshot.sessions.first?.id, id)
        XCTAssertEqual(store.session(id: id)?.statusLabel, "待对方回应")
        store.acceptInvitation(id: id, confirmedSlotID: "slot-elena-1", receiverQuestion: "如何验证 AI 产品需求？")
        XCTAssertEqual(store.session(id: id)?.status, .swapScheduled)
        XCTAssertEqual(store.session(id: id)?.statusLabel, "已排期")
    }

    @MainActor
    func testIncomingAcceptanceRequiresAnAvailableSlotAndSwapQuestion() {
        let store = AppStore(snapshot: .demo, persistence: .inMemory)
        let coffeeID = "ord-in-ecoffee-1"
        let swapID = "ord-in-swap-1"

        XCTAssertFalse(store.acceptInvitation(id: coffeeID, confirmedSlotID: "不在候选中的时段", receiverQuestion: nil))
        XCTAssertEqual(store.session(id: coffeeID)?.status, .pendingResponse)

        XCTAssertFalse(store.acceptInvitation(id: swapID, confirmedSlotID: "slot-incoming-swap-1", receiverQuestion: ""))
        XCTAssertEqual(store.session(id: swapID)?.status, .pendingResponse)

        XCTAssertTrue(store.acceptInvitation(id: coffeeID, confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))
        XCTAssertEqual(store.session(id: coffeeID)?.status, .acceptedPendingPayment)
    }

    @MainActor
    func testFailedSessionPersistenceDoesNotReportSuccessfulTransition() {
        let store = AppStore(snapshot: .demo, persistence: failingSnapshotPersistence)
        let id = "ord-in-ecoffee-1"

        XCTAssertFalse(store.acceptInvitation(id: id, confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))
        XCTAssertEqual(store.session(id: id)?.status, .pendingResponse)
        XCTAssertNil(store.session(id: id)?.confirmedSlotID)
        XCTAssertTrue(store.snapshot.currentUser.availableSlots.first(where: { $0.id == "slot-incoming-1" })?.isAvailable == true)
        XCTAssertEqual(store.lastErrorMessage, "本地数据保存失败")
    }

    @MainActor
    func testDeclineCancelReviewAndComplaintRespectStatusMatrix() {
        let store = AppStore(snapshot: .demo, persistence: .inMemory)

        XCTAssertTrue(store.declineInvitation(id: "ord-in-swap-1", reason: "近期时间不合适"))
        XCTAssertEqual(store.session(id: "ord-in-swap-1")?.status, .declined)
        XCTAssertTrue(store.cancelSession(id: "ord-out-booked-1"))
        XCTAssertEqual(store.session(id: "ord-out-booked-1")?.status, .cancelled)
        XCTAssertTrue(store.submitReview(id: "ord-completed-1", rating: 4, comment: "收获很大", tag: "表达清晰"))
        XCTAssertEqual(store.session(id: "ord-completed-1")?.review?.rating, 4)
        XCTAssertTrue(store.submitComplaint(id: "ord-completed-1", category: "沟通体验问题", description: "说明"))
        XCTAssertEqual(store.session(id: "ord-completed-1")?.status, .inAfterSale)
    }

    @MainActor
    func testAcceptedIncomingSessionPersistsAcrossStoreRebuild() {
        let box = SnapshotBox()
        let persistence = LocalPersistence(load: { box.snapshot }, save: { box.snapshot = $0 })
        let store = AppStore(snapshot: .demo, persistence: persistence)

        XCTAssertTrue(store.acceptInvitation(id: "ord-in-ecoffee-1", confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))

        let rebuiltStore = AppStore(snapshot: .demo, persistence: persistence)
        XCTAssertEqual(rebuiltStore.session(id: "ord-in-ecoffee-1")?.status, .acceptedPendingPayment)
        XCTAssertEqual(rebuiltStore.session(id: "ord-in-ecoffee-1")?.confirmedSlot, "10月25日 10:30 上午")
    }

    func testCheckoutDoesNotPresentSuccessWhenPaymentPersistenceFails() {
        XCTAssertEqual(CheckoutPaymentResolution.result(for: .success, didPersist: false), .failure)
        XCTAssertEqual(CheckoutPaymentResolution.result(for: .success, didPersist: true), .success)
        XCTAssertEqual(CheckoutPaymentResolution.result(for: .cancelled, didPersist: false), .cancelled)
    }

    @MainActor
    func testIncomingAcceptanceUsesLiveSlotIDsAndPreventsStaleOrDuplicateClaims() {
        var staleSnapshot = AppSnapshot.demo
        staleSnapshot.currentUser.availableSlots[0].isAvailable = false
        let staleStore = AppStore(snapshot: staleSnapshot, persistence: .inMemory)
        XCTAssertFalse(staleStore.acceptInvitation(id: "ord-in-ecoffee-1", confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))
        XCTAssertEqual(staleStore.session(id: "ord-in-ecoffee-1")?.status, .pendingResponse)

        let store = AppStore(snapshot: .demo, persistence: .inMemory)
        XCTAssertFalse(store.acceptInvitation(id: "ord-in-ecoffee-1", confirmedSlotID: "10月25日 10:30 上午", receiverQuestion: nil))
        XCTAssertTrue(store.acceptInvitation(id: "ord-in-ecoffee-1", confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))
        XCTAssertEqual(store.session(id: "ord-in-ecoffee-1")?.confirmedSlotID, "slot-incoming-1")
        XCTAssertFalse(store.snapshot.currentUser.availableSlots[0].isAvailable)
        XCTAssertFalse(store.acceptInvitation(id: "ord-in-ecoffee-1", confirmedSlotID: "slot-incoming-1", receiverQuestion: nil))
    }

    @MainActor
    func testLegacySnapshotMigratesCurrentUserSlotsWithoutDiscardingExistingData() throws {
        let legacyData = try legacySchemaData(from: .demo)
        let persistence = LocalPersistence(
            load: { try JSONDecoder().decode(AppSnapshot.self, from: legacyData) },
            save: { _ in }
        )

        let store = AppStore(snapshot: .demo, persistence: persistence)

        XCTAssertEqual(store.snapshot.currentUser.name, "Alex Chen")
        XCTAssertEqual(store.session(id: "ord-out-booked-1")?.meetingID, "198 302 145")
        XCTAssertFalse(store.snapshot.sharers.isEmpty)
        XCTAssertFalse(store.snapshot.currentUser.availableSlots.isEmpty)
        XCTAssertTrue(store.snapshot.currentUser.availableSlots.allSatisfy(\.isAvailable))
        XCTAssertNotEqual(store.lastErrorMessage, "演示数据已恢复")
    }

    @MainActor
    func testExplicitEmptyAvailableSlotsRemainEmptyAcrossPersistedRebuild() throws {
        let box = SnapshotDataBox()
        let persistence = LocalPersistence(
            load: {
                guard let data = box.data else { return nil }
                return try JSONDecoder().decode(AppSnapshot.self, from: data)
            },
            save: { box.data = try JSONEncoder().encode($0) }
        )
        var snapshot = AppSnapshot.demo
        snapshot.currentUser.availableSlots = []
        let firstStore = AppStore(snapshot: snapshot, persistence: persistence)

        XCTAssertTrue(firstStore.snapshot.currentUser.availableSlots.isEmpty)
        firstStore.updateProfile(firstStore.snapshot.currentUser)

        let rebuiltStore = AppStore(snapshot: .demo, persistence: persistence)
        XCTAssertTrue(rebuiltStore.snapshot.currentUser.availableSlots.isEmpty)
    }

    @MainActor
    func testComplaintRequiresCategoryAndDescriptionIndependently() {
        let store = AppStore(snapshot: .demo, persistence: .inMemory)
        let id = "ord-completed-1"

        XCTAssertFalse(store.submitComplaint(id: id, category: "", description: "说明完整"))
        XCTAssertEqual(store.lastErrorMessage, "请选择投诉类别")
        XCTAssertEqual(store.session(id: id)?.status, .completed)

        XCTAssertFalse(store.submitComplaint(id: id, category: "沟通体验问题", description: "   "))
        XCTAssertEqual(store.lastErrorMessage, "请填写问题说明")
        XCTAssertEqual(store.session(id: id)?.status, .completed)

        XCTAssertTrue(store.submitComplaint(id: id, category: "沟通体验问题", description: "回复内容与约定不符"))
        XCTAssertEqual(store.session(id: id)?.complaintReason, "沟通体验问题：回复内容与约定不符")
    }
}

private final class SnapshotBox: @unchecked Sendable {
    var snapshot: AppSnapshot?
}

private final class SnapshotDataBox: @unchecked Sendable {
    var data: Data?
}

private let failingSnapshotPersistence = LocalPersistence(
    load: { nil },
    save: { _ in throw CocoaError(.fileWriteUnknown) }
)

private func legacySchemaData(from snapshot: AppSnapshot) throws -> Data {
    var object = try JSONSerialization.jsonObject(with: JSONEncoder().encode(snapshot))
    removeTask6Fields(from: &object)
    return try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
}

private func removeTask6Fields(from value: inout Any) {
    if var dictionary = value as? [String: Any] {
        dictionary.removeValue(forKey: "isAvailable")
        dictionary.removeValue(forKey: "availableSlots")
        dictionary.removeValue(forKey: "confirmedSlotID")
        for key in dictionary.keys {
            var child = dictionary[key] as Any
            removeTask6Fields(from: &child)
            dictionary[key] = child
        }
        value = dictionary
    } else if var array = value as? [Any] {
        for index in array.indices { removeTask6Fields(from: &array[index]) }
        value = array
    }
}
