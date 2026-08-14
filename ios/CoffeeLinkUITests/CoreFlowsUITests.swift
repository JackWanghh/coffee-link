import XCTest

final class CoreFlowsUITests: XCTestCase {
    @MainActor
    func testDiscoverOpensElenaDetail() {
        let app = launchResetDemo()
        let elenaCard = app.buttons["sharer.elena-rodriguez"]
        XCTAssertTrue(elenaCard.waitForExistence(timeout: 2))
        XCTAssertTrue(elenaCard.isHittable)

        app.buttons["sharer.elena-rodriguez"].tap()

        XCTAssertTrue(app.staticTexts["分享者详情"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.buttons["请喝咖啡（¥22）"].exists)
        XCTAssertTrue(app.buttons["主题互换（0元）"].exists)
    }

    @MainActor
    func testDiscoverStrategicConsultingFilterKeepsElenaVisible() {
        let app = launchResetDemo()

        app.buttons["战略与咨询"].tap()

        let elenaCard = app.buttons["sharer.elena-rodriguez"]
        XCTAssertTrue(elenaCard.waitForExistence(timeout: 2))
        XCTAssertTrue(elenaCard.isHittable)
    }

    @MainActor
    func testSharerDetailShowsUpcomingAvailabilitySlots() {
        let app = launchResetDemo()
        app.buttons["sharer.elena-rodriguez"].tap()

        let detail = app.scrollViews.firstMatch
        detail.swipeUp()
        XCTAssertTrue(app.staticTexts["近期可约时间"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["10月24日"].exists)
        XCTAssertTrue(app.staticTexts["09:00 上午"].exists)
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
