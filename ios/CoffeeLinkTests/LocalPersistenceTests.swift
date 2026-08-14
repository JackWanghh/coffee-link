import Foundation
import XCTest
@testable import CoffeeLink

final class LocalPersistenceTests: XCTestCase {
    func testSnapshotRoundTripsThroughCodable() throws {
        let encoded = try JSONEncoder().encode(AppSnapshot.demo)
        let decoded = try JSONDecoder().decode(AppSnapshot.self, from: encoded)

        XCTAssertEqual(decoded, .demo)
    }

    func testDemoDataMatchesVisibleWebFixtures() throws {
        let david = try XCTUnwrap(AppSnapshot.demo.sharers.first { $0.id == "david-wu" })
        XCTAssertEqual(david.signatureDrink.id, "cold-brew")
        XCTAssertEqual(david.signatureDrink.price, 24)

        let incomingCoffee = try XCTUnwrap(AppSnapshot.demo.sessions.first { $0.id == "ord-in-ecoffee-1" })
        XCTAssertEqual(incomingCoffee.senderAvatarURL?.absoluteString, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")

        let incomingSwap = try XCTUnwrap(AppSnapshot.demo.sessions.first { $0.id == "ord-in-swap-1" })
        XCTAssertEqual(incomingSwap.senderAvatarURL?.absoluteString, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80")
        XCTAssertEqual(incomingSwap.themeDescription, "想了解 Alex 在实际落地 Agent 自动化流时，产品与工程团队如何拆分需求与指标？")
        XCTAssertEqual(incomingSwap.offeredThemeDescription, "我愿意分享从10人到50人产研团队的敏捷迭代机制、Sprint 节奏把控与OKR双向对齐实操。")
        XCTAssertEqual(incomingSwap.offering, "可全面分享 50 人产研团队如何建立双周敏捷发版机制与跨职能回顾会议 (Retrospective) 的落地方案。")
    }

    @MainActor
    func testCorruptPersistedSnapshotRecoversDemoData() {
        let persistence = LocalPersistence(
            load: { throw DecodingError.dataCorrupted(.init(codingPath: [], debugDescription: "corrupt")) },
            save: { _ in }
        )

        let store = AppStore(snapshot: .demo, persistence: persistence)

        XCTAssertEqual(store.snapshot, .demo)
        XCTAssertEqual(store.lastErrorMessage, "演示数据已恢复")
    }
}
