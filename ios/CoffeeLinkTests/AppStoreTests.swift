import XCTest
@testable import CoffeeLink

final class AppStoreTests: XCTestCase {
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
