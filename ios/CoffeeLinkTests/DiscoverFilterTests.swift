import XCTest
@testable import CoffeeLink

final class DiscoverFilterTests: XCTestCase {
    func testStrategicConsultingFallbackKeepsElena() throws {
        let elena = try XCTUnwrap(AppSnapshot.demo.sharers.first { $0.id == "elena-rodriguez" })

        XCTAssertEqual(DiscoverFilter.filter([elena], industry: "战略与咨询", query: "").map(\.id), ["elena-rodriguez"])
    }

    func testAIAlgorithmFallbackMatchesBigModelHighlights() throws {
        var AISharer = try XCTUnwrap(AppSnapshot.demo.sharers.first { $0.id == "elena-rodriguez" })
        AISharer.highlights = ["负责大模型产品落地与增长策略。"]

        XCTAssertEqual(DiscoverFilter.filter([AISharer], industry: "AI 与算法", query: "").map(\.id), ["elena-rodriguez"])
    }
}
