import Foundation
import XCTest
@testable import CoffeeLink

final class LocalPersistenceTests: XCTestCase {
    func testSnapshotRoundTripsThroughCodable() throws {
        let encoded = try JSONEncoder().encode(AppSnapshot.demo)
        let decoded = try JSONDecoder().decode(AppSnapshot.self, from: encoded)

        XCTAssertEqual(decoded, .demo)
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
