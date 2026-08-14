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
        store.submitComplaint(id: id, reason: "对谈未按约进行")
        XCTAssertEqual(store.session(id: id)?.statusLabel, "售后中")
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
}

private let failingSnapshotPersistence = LocalPersistence(
    load: { nil },
    save: { _ in throw CocoaError(.fileWriteUnknown) }
)
