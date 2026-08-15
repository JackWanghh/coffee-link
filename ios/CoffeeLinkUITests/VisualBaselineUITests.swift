import XCTest

final class VisualBaselineUITests: XCTestCase {
    private struct Baseline {
        let testName: String
        let screen: String
        let readyIdentifier: String
    }

    private let baselines = [
        Baseline(testName: "01-home", screen: "discover", readyIdentifier: "visual.discover.ready"),
        Baseline(testName: "02-profile-detail", screen: "sharer-detail", readyIdentifier: "visual.sharer-detail.ready"),
        Baseline(testName: "03-invite", screen: "invitation", readyIdentifier: "visual.invitation.ready"),
        Baseline(testName: "04-mine", screen: "profile", readyIdentifier: "visual.profile.ready"),
        Baseline(testName: "05-login", screen: "login", readyIdentifier: "visual.login.ready"),
        Baseline(testName: "06-register", screen: "register", readyIdentifier: "visual.register.ready"),
        Baseline(testName: "07-reset-password", screen: "reset-password", readyIdentifier: "visual.reset-password.ready"),
        Baseline(testName: "08-chats", screen: "chats", readyIdentifier: "visual.chats.ready"),
        Baseline(testName: "09-checkout", screen: "checkout", readyIdentifier: "visual.checkout.ready"),
        Baseline(testName: "10-chat-detail-booked", screen: "chat-detail-booked", readyIdentifier: "visual.chat-detail-booked.ready"),
        Baseline(testName: "11-sharing-center", screen: "sharing-center", readyIdentifier: "visual.sharing-center.ready")
    ]

    @MainActor
    func test01Discover() { capture(baselines[0]) }

    @MainActor
    func test02SharerDetail() { capture(baselines[1]) }

    @MainActor
    func test03Invitation() { capture(baselines[2]) }

    @MainActor
    func test04Profile() { capture(baselines[3]) }

    @MainActor
    func test05Login() { capture(baselines[4]) }

    @MainActor
    func test06Register() { capture(baselines[5]) }

    @MainActor
    func test07ResetPassword() { capture(baselines[6]) }

    @MainActor
    func test08Chats() { capture(baselines[7]) }

    @MainActor
    func test09Checkout() { capture(baselines[8]) }

    @MainActor
    func test10ChatDetailBooked() { capture(baselines[9]) }

    @MainActor
    func test11SharingCenter() { capture(baselines[10]) }

    @MainActor
    private func capture(_ baseline: Baseline) {
        let app = XCUIApplication()
        app.launchArguments = [
            "-ui-testing",
            "-reset-demo",
            "-visual-screen",
            baseline.screen
        ]
        app.launchEnvironment["COFFEELINK_VISUAL_TESTING"] = "1"
        app.launch()

        let ready = app.otherElements[baseline.readyIdentifier]
        XCTAssertTrue(
            ready.waitForExistence(timeout: 5),
            "Missing deterministic visual ready state: \(baseline.readyIdentifier)"
        )
        XCTAssertEqual(ready.value as? String, "ready")

        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = baseline.testName
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
