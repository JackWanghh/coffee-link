import XCTest

final class CoreFlowsUITests: XCTestCase {
    @MainActor
    func testProfileMatchesCoreProductContent() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()

        for text in ["Alex Chen", "AI 产品经理 @ TechFlow Lab", "身份已核验", "+86 138****8888", "14", "4.9", "100%", "分享中心", "燕麦拿铁（¥28）", "互换（周限3次）", "我的对谈与日程", "外观与主题切换", "对谈安全与履约保障", "切换账号 / 退出登录"] {
            XCTAssertTrue(app.staticTexts[text].waitForExistence(timeout: 2), "Missing Profile copy: \(text)")
        }
    }

    @MainActor
    func testSignatureDrinkChangePersistsAcrossRelaunch() {
        let app = launchPersistentResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()
        app.buttons["设置签名饮品"].tap()
        app.buttons["drink.flat-white"].tap()
        app.buttons["确认选定"].tap()
        XCTAssertTrue(app.staticTexts["澳白咖啡 ¥26"].waitForExistence(timeout: 2))

        app.terminate()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing"]
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "0"
        app.launch()
        app.buttons["tab.mine"].tap()
        XCTAssertTrue(app.staticTexts["澳白咖啡（¥26）"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testAppearanceActuallyChangesAndPersistsAcrossRelaunch() {
        let app = launchPersistentResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["profile.settings"].tap()
        app.buttons["appearance.latte"].tap()
        XCTAssertEqual(app.otherElements["app.theme"].value as? String, "latte")
        app.buttons["保存并应用"].tap()

        app.terminate()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing"]
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "0"
        app.launch()
        XCTAssertEqual(app.otherElements["app.theme"].value as? String, "latte")
    }

    @MainActor
    func testPendingInvitationsShortcutOpensIncomingPendingFilter() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()
        app.buttons["sharing.pending-invitations"].tap()

        XCTAssertTrue(app.buttons["发给我的邀请（2）"].isSelected)
        XCTAssertTrue(app.buttons["待回应"].isSelected)
        XCTAssertTrue(app.buttons["session.incoming-coffee"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testSharingCenterOpensEditPublicProfileFromNormalPath() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()

        let editProfile = app.buttons["sharing.edit-profile"]
        XCTAssertTrue(editProfile.waitForExistence(timeout: 2))
        XCTAssertTrue(editProfile.isHittable)
        editProfile.tap()
        XCTAssertTrue(app.staticTexts["编辑公开资料"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.textFields["profile.name"].exists)
    }

    @MainActor
    func testCurrentUserPublicPreviewIsExplicitlyReadOnly() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()
        let preview = app.buttons["sharing.preview-profile"]
        while !preview.isHittable { app.scrollViews.firstMatch.swipeUp() }
        preview.tap()

        XCTAssertTrue(app.staticTexts["这是你的公开名片预览，访客操作已隐藏"].waitForExistence(timeout: 2))
        XCTAssertFalse(app.buttons.matching(NSPredicate(format: "label BEGINSWITH '请喝咖啡'")).firstMatch.exists)
        XCTAssertFalse(app.buttons["主题互换（0元）"].exists)
        XCTAssertFalse(app.staticTexts["未找到分享者"].exists)
    }

    @MainActor
    func testOpenSharingCannotSaveAllSlotsClosedAndRemainsConsistent() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()
        XCTAssertTrue(app.staticTexts["已开启分享功能"].waitForExistence(timeout: 2))
        app.buttons["可预约时段排期"].tap()

        let slotButtons = app.buttons.matching(NSPredicate(format: "label BEGINSWITH '时段 '"))
        XCTAssertGreaterThan(slotButtons.count, 0)
        for index in 0..<slotButtons.count {
            let slot = slotButtons.element(boundBy: index)
            while !slot.isHittable { app.scrollViews.firstMatch.swipeUp() }
            if (slot.value as? String) == "开放" { slot.tap() }
        }
        let save = app.buttons["保存时段"]
        while !save.isHittable { app.scrollViews.firstMatch.swipeUp() }
        save.tap()

        XCTAssertTrue(app.staticTexts["开放分享期间，请至少保留一个可预约时段"].waitForExistence(timeout: 2))
        app.buttons["取消"].tap()
        XCTAssertTrue(app.staticTexts["已开启分享功能"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["已开放 5 个未来 30 天时段"].exists)
    }

    @MainActor
    func testTask7SelectionControlsMeetTouchAndVoiceOverRequirements() {
        let app = launchResetDemo()
        app.buttons["tab.mine"].tap()
        app.buttons["进入分享中心"].tap()
        let sharingToggle = app.buttons["sharing.toggle"]
        XCTAssertGreaterThanOrEqual(sharingToggle.frame.height, 44)
        XCTAssertEqual(sharingToggle.value as? String, "已开启")

        let swapSettings = app.buttons["设置额度"]
        while !swapSettings.isHittable { app.scrollViews.firstMatch.swipeUp() }
        swapSettings.tap()
        for limit in [1, 2, 3, 5] {
            let control = app.buttons["swap.limit.\(limit)"]
            XCTAssertGreaterThanOrEqual(control.frame.height, 44)
            XCTAssertTrue(["已选择", "未选择"].contains(control.value as? String ?? ""))
        }
    }

    @MainActor
    func testEmeraldAccentFilledActionsRemainReachable() {
        let detail = XCUIApplication()
        detail.launchArguments = ["-ui-testing", "-reset-demo", "-present", "sharer-detail", "-appearance", "emerald"]
        detail.launch()
        XCTAssertEqual(detail.otherElements["app.theme"].value as? String, "emerald")
        let coffeeAction = detail.buttons["请喝咖啡（¥22）"]
        XCTAssertTrue(coffeeAction.waitForExistence(timeout: 2))
        XCTAssertTrue(coffeeAction.isHittable)
        detail.terminate()

        let chats = XCUIApplication()
        chats.launchArguments = ["-ui-testing", "-reset-demo", "-present", "chats", "-appearance", "emerald"]
        chats.launch()
        XCTAssertEqual(chats.otherElements["app.theme"].value as? String, "emerald")
        let paymentAction = chats.buttons["session.pay.ord-out-accepted-pay-1"]
        XCTAssertTrue(paymentAction.waitForExistence(timeout: 2))
        XCTAssertTrue(paymentAction.isHittable)
        chats.buttons["发给我的邀请（2）"].tap()
        let acceptActions = chats.buttons.matching(identifier: "接受并确认时间")
        XCTAssertGreaterThan(acceptActions.count, 0)
        if !acceptActions.allElementsBoundByIndex.contains(where: \.isHittable) {
            chats.scrollViews.firstMatch.swipeUp()
        }
        XCTAssertTrue(acceptActions.allElementsBoundByIndex.contains(where: \.isHittable))
    }

    @MainActor
    func testPersistentUICredentialsAreIsolatedAndSurviveOneRelaunch() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing", "-reset-demo", "-auth-mode", "reset"]
        app.launchEnvironment["COFFEELINK_PERSISTENT_UI_TESTING"] = "1"
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "1"
        app.launch()
        XCTAssertEqual(app.otherElements["app.credential-mode"].value as? String, "ui-testing-file")

        let password = app.secureTextFields["auth.password"]
        let confirmation = app.secureTextFields["auth.confirmation"]
        replaceText(in: password, with: "UITestPass123")
        replaceText(in: confirmation, with: "UITestPass123")
        app.buttons["auth.submit"].tap()
        XCTAssertTrue(app.staticTexts["密码登录"].waitForExistence(timeout: 2))

        app.terminate()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing", "-auth-mode", "login"]
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "0"
        app.launch()
        XCTAssertEqual(app.otherElements["app.credential-mode"].value as? String, "ui-testing-file")
        let loginPassword = app.secureTextFields["auth.password"]
        replaceText(in: loginPassword, with: "UITestPass123")
        app.buttons["auth.submit"].tap()
        XCTAssertFalse(app.otherElements["auth.overlay"].waitForExistence(timeout: 1))

        app.terminate()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing", "-reset-demo", "-auth-mode", "login"]
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "1"
        app.launch()
        XCTAssertEqual(app.otherElements["app.credential-mode"].value as? String, "ui-testing-file")
        app.buttons["auth.submit"].tap()
        XCTAssertFalse(app.otherElements["auth.overlay"].waitForExistence(timeout: 1))
        app.terminate()
    }

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
    func testLoggedOutCoffeeInvitationResumesAfterLogin() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo", "-logged-out", "-prefill-invitation"]
        app.launch()

        app.buttons["sharer.elena-rodriguez"].tap()
        app.buttons["请喝咖啡（¥22）"].tap()
        app.buttons["提交咖啡邀请  →"].tap()

        XCTAssertTrue(app.staticTexts["密码登录"].waitForExistence(timeout: 2))
        app.buttons["立即登录  →"].tap()
        XCTAssertTrue(app.staticTexts["对谈详情"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testAuthenticationLaunchModes() {
        for (argument, expectedTitle) in [("-present-login", "密码登录"), ("-present-register", "新用户注册"), ("-present-reset", "找回密码")] {
            let app = XCUIApplication()
            app.launchArguments = ["-ui-testing", "-reset-demo", argument]
            app.launch()
            XCTAssertTrue(app.staticTexts[expectedTitle].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    @MainActor
    func testInteractiveRegistrationAndResetReturnToLogin() {
        for (mode, submitTitle) in [("register", "完成注册并登录"), ("reset", "重置密码并返回登录")] {
            let app = XCUIApplication()
            app.launchArguments = ["-ui-testing", "-reset-demo", "-auth-mode", mode]
            app.launch()

            XCTAssertTrue(app.buttons[submitTitle].waitForExistence(timeout: 2))
            app.buttons[submitTitle].tap()
            XCTAssertTrue(app.staticTexts["密码登录"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    @MainActor
    func testPaymentResultLaunchArguments() {
        for (result, expectedTitle) in [("success", "支付成功"), ("failure", "支付失败"), ("cancelled", "已取消支付")] {
            let app = XCUIApplication()
            app.launchArguments = ["-ui-testing", "-reset-demo", "-payment-result", result]
            app.launch()
            XCTAssertTrue(app.staticTexts[expectedTitle].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    @MainActor
    func testChatsDirectionsFiltersAndIncomingAcceptance() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()

        XCTAssertTrue(app.buttons["我发起的邀请（4）"].waitForExistence(timeout: 2))
        for filter in ["全部", "待回应", "待付款", "已排期", "已完成"] {
            XCTAssertTrue(app.buttons[filter].exists, "Missing chats filter: \(filter)")
        }
        XCTAssertTrue(app.buttons["session.ord-out-accepted-pay-1"].exists)

        app.buttons["发给我的邀请（2）"].tap()
        XCTAssertTrue(app.buttons["session.incoming-coffee"].waitForExistence(timeout: 2))
        app.buttons["session.incoming-coffee"].tap()
        app.buttons["接受邀请"].tap()
        app.buttons["slot.slot-incoming-1"].tap()
        app.buttons["确认接受"].tap()

        XCTAssertTrue(app.staticTexts["等待对方付款"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testChatsFiltersEachDirectionToExpectedResults() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()
        for (filter, expectedSession) in [
            ("全部", "session.ord-out-accepted-pay-1"),
            ("待付款", "session.ord-out-accepted-pay-1"),
            ("已排期", "session.ord-out-booked-1"),
            ("已完成", "session.ord-completed-1")
        ] {
            app.buttons[filter].tap()
            XCTAssertTrue(app.buttons[expectedSession].waitForExistence(timeout: 2), "\(filter) should show \(expectedSession)")
        }

        app.buttons["发给我的邀请（2）"].tap()
        app.buttons["待回应"].tap()
        XCTAssertTrue(app.buttons["session.incoming-coffee"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testImmediatePaymentSucceedsAndBookedMeetingUsesFixtureCredentials() {
        let paymentApp = launchResetDemo()
        paymentApp.buttons["tab.chats"].tap()
        paymentApp.buttons["待付款"].tap()
        paymentApp.buttons["session.pay.ord-out-accepted-pay-1"].tap()
        paymentApp.buttons["payment.confirm"].tap()
        XCTAssertTrue(paymentApp.staticTexts["支付成功"].waitForExistence(timeout: 2))

        let meetingApp = launchResetDemo()
        meetingApp.buttons["tab.chats"].tap()
        meetingApp.buttons["已排期"].tap()
        meetingApp.buttons["session.ord-out-booked-1"].tap()
        meetingApp.buttons["meeting.enter"].tap()
        XCTAssertTrue(meetingApp.staticTexts["198 302 145"].waitForExistence(timeout: 2))
        XCTAssertTrue(meetingApp.staticTexts["https://meeting.tencent.com/dm/198302145"].exists)
    }

    @MainActor
    func testIncomingInvitationCanBeDeclinedWithAStandardReason() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()
        app.buttons["发给我的邀请（2）"].tap()
        app.buttons["session.incoming-coffee"].tap()
        app.buttons["婉拒邀请"].tap()
        let recentTime = app.buttons["decline.reason.recent-time"]
        XCTAssertEqual(recentTime.label, "婉拒原因：近期时间不合适")
        recentTime.tap()
        app.buttons["确认婉拒"].tap()
        XCTAssertTrue(app.staticTexts["邀请已婉拒"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testTopicSwapRequiresQuestionBeforeAcceptanceAndThenSchedules() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()
        app.buttons["发给我的邀请（2）"].tap()
        app.buttons["session.ord-in-swap-1"].tap()
        app.buttons["接受邀请"].tap()
        app.buttons["slot.slot-incoming-swap-1"].tap()
        app.buttons["确认接受"].tap()
        XCTAssertTrue(app.staticTexts["主题互换请补充不少于 8 个字的问题"].waitForExistence(timeout: 2))
        app.textViews["accept.receiver-question"].tap()
        app.textViews["accept.receiver-question"].typeText("我想了解你们落地评估体系时的关键指标。")
        app.buttons["确认接受"].tap()
        XCTAssertTrue(app.staticTexts["对谈已排期"].waitForExistence(timeout: 2))
    }

    @MainActor
    func testImmediatePaymentFailureKeepsInvitationPendingPayment() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo", "-payment-result", "failure"]
        app.launch()

        XCTAssertTrue(app.staticTexts["支付失败"].waitForExistence(timeout: 2))
        app.buttons["payment.back"].tap()
        XCTAssertTrue(app.staticTexts["对谈详情"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["对方已接受，等待你付款"].exists)
    }

    @MainActor
    func testBusinessSheetChoicesExposeReadableSelectedVoiceOverState() {
        let acceptApp = launchScreen("accept")
        let firstSlot = acceptApp.buttons["slot.slot-incoming-1"]
        XCTAssertTrue(firstSlot.waitForExistence(timeout: 2))
        XCTAssertEqual(firstSlot.label, "对谈时段：10月25日 10:30 上午")
        XCTAssertEqual(firstSlot.value as? String, "已选择")
        XCTAssertTrue(firstSlot.isSelected)
        acceptApp.terminate()

        let declineApp = launchScreen("decline")
        let declineReason = declineApp.buttons["decline.reason.recent-time"]
        XCTAssertTrue(declineReason.waitForExistence(timeout: 2))
        XCTAssertEqual(declineReason.label, "婉拒原因：近期时间不合适")
        declineReason.tap()
        XCTAssertEqual(declineReason.value as? String, "已选择")
        XCTAssertTrue(declineReason.isSelected)
        declineApp.terminate()

        let reviewApp = launchScreen("review")
        let fourStars = reviewApp.buttons["review.star.4"]
        XCTAssertEqual(fourStars.label, "评价 4 星")
        fourStars.tap()
        XCTAssertEqual(fourStars.value as? String, "当前评分")
        XCTAssertTrue(fourStars.isSelected)
        reviewApp.terminate()

        let complaintApp = launchScreen("complaint")
        let category = complaintApp.buttons["complaint.category.communication"]
        XCTAssertTrue(category.waitForExistence(timeout: 2))
        XCTAssertEqual(category.label, "投诉类别：沟通体验问题")
        category.tap()
        XCTAssertEqual(category.value as? String, "已选择")
        XCTAssertTrue(category.isSelected)
        complaintApp.terminate()
    }

    @MainActor
    func testTopicSwapValidationErrorDoesNotLeakIntoOtherBusinessSheets() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()
        app.buttons["发给我的邀请（2）"].tap()
        app.buttons["session.ord-in-swap-1"].tap()
        app.buttons["接受邀请"].tap()
        app.buttons["确认接受"].tap()
        let validation = app.staticTexts["主题互换请补充不少于 8 个字的问题"]
        XCTAssertTrue(validation.waitForExistence(timeout: 2))

        app.buttons["sheet.accept.close"].tap()
        XCTAssertFalse(app.staticTexts["接受主题互换邀请"].waitForExistence(timeout: 1))

        app.buttons["Back"].tap()
        app.buttons["session.incoming-coffee"].tap()
        app.buttons["婉拒邀请"].tap()
        XCTAssertTrue(app.staticTexts["婉拒邀请"].waitForExistence(timeout: 2))
        XCTAssertFalse(validation.exists)

        app.buttons["sheet.decline.close"].tap()
        XCTAssertFalse(app.staticTexts["选择标准婉拒原因，不会公开降低您的信誉。"].waitForExistence(timeout: 1))
        app.buttons["Back"].tap()
        app.buttons["我发起的邀请（4）"].tap()
        app.buttons["已完成"].tap()
        app.buttons["session.ord-completed-1"].tap()
        let complaint = app.buttons["投诉"]
        while !complaint.isHittable { app.scrollViews.firstMatch.swipeUp() }
        complaint.tap()
        XCTAssertTrue(app.staticTexts["投诉与售后"].waitForExistence(timeout: 2))
        XCTAssertFalse(validation.exists)
    }

    @MainActor
    func testBookedSessionCancellationRequiresConfirmation() {
        let app = launchResetDemo()
        app.buttons["tab.chats"].tap()
        app.buttons["已排期"].tap()
        app.buttons["session.ord-out-booked-1"].tap()
        let cancel = app.buttons["取消对谈"]
        while !cancel.isHittable { app.scrollViews.firstMatch.swipeUp() }
        cancel.tap()

        XCTAssertTrue(app.staticTexts["确认取消本次对谈？"].waitForExistence(timeout: 2))
        XCTAssertTrue(app.staticTexts["对谈已排期"].exists)
        app.buttons["确认取消对谈"].tap()
        XCTAssertTrue(app.staticTexts["邀请已取消"].waitForExistence(timeout: 2))
    }

    @MainActor
    private func launchResetDemo() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo"]
        app.launch()
        return app
    }

    @MainActor
    private func launchPersistentResetDemo() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-persistent-ui-testing", "-reset-demo"]
        app.launchEnvironment["COFFEELINK_PERSISTENT_UI_TESTING"] = "1"
        app.launchEnvironment["COFFEELINK_RESET_PERSISTENT_DEMO"] = "1"
        app.launch()
        XCTAssertEqual(app.otherElements["app.persistence-mode"].value as? String, "ui-testing-persistent")
        return app
    }

    @MainActor
    private func launchScreen(_ screen: String) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-reset-demo", "-present", screen]
        app.launch()
        return app
    }

    @MainActor
    private func replaceText(in element: XCUIElement, with text: String) {
        element.tap()
        element.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: 24))
        element.typeText(text)
    }
}
