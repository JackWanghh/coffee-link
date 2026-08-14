import XCTest

final class CoreFlowsUITests: XCTestCase {
    @MainActor
    func testThreeTabsAreReachable() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo"]
        app.launch()

        XCTAssertTrue(app.buttons["tab.discover"].isSelected)

        app.buttons["tab.chats"].tap()
        XCTAssertTrue(app.staticTexts["对谈管理"].waitForExistence(timeout: 2))

        app.buttons["tab.mine"].tap()
        XCTAssertTrue(app.staticTexts["我的"].waitForExistence(timeout: 2))
    }
}
