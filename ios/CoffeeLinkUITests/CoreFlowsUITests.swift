import XCTest

final class CoreFlowsUITests: XCTestCase {
    @MainActor
    func testDiscoverOpensElenaDetail() {
        let app = launchResetDemo()
        XCTAssertTrue(app.staticTexts["Elena Rodriguez"].waitForExistence(timeout: 2))

        app.buttons["sharer.elena-rodriguez"].tap()

        XCTAssertTrue(app.staticTexts["分享者详情"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.buttons["请喝咖啡（¥22）"].exists)
        XCTAssertTrue(app.buttons["主题互换（0元）"].exists)
    }

    @MainActor
    func testThreeTabsAreReachable() {
        let app = launchResetDemo()

        XCTAssertTrue(app.buttons["tab.discover"].isSelected)

        app.buttons["tab.chats"].tap()
        XCTAssertTrue(app.staticTexts["对谈管理"].waitForExistence(timeout: 2))

        app.buttons["tab.mine"].tap()
        XCTAssertTrue(app.staticTexts["我的"].waitForExistence(timeout: 2))
    }

    @MainActor
    private func launchResetDemo() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo"]
        app.launch()
        return app
    }
}
