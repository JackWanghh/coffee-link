import XCTest
@testable import CoffeeLink

final class AppLaunchTests: XCTestCase {
    func testPrototypeViewportConstantsMatchReference() {
        XCTAssertEqual(CoffeeLinkTheme.referenceWidth, 393)
        XCTAssertEqual(CoffeeLinkTheme.referenceHeight, 852)
        XCTAssertEqual(CoffeeLinkTheme.cornerRadius, 16)
    }
}
