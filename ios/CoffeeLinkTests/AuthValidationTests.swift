import XCTest
@testable import CoffeeLink

final class AuthValidationTests: XCTestCase {
    func testRegistrationRequiresMainlandPhoneOtpMatchingPasswordAndAgreement() {
        var draft = AuthDraft.registerDemo
        XCTAssertTrue(AuthValidator.registrationErrors(draft).isEmpty)

        draft.confirmPassword = "Mismatch123"
        XCTAssertEqual(AuthValidator.registrationErrors(draft), [.passwordsDoNotMatch])

        draft.confirmPassword = draft.password
        draft.acceptedTerms = false
        XCTAssertEqual(AuthValidator.registrationErrors(draft), [.termsRequired])
    }

    func testInvitationRequiresQuestionAndAtLeastOneSlot() {
        var draft = InvitationDraft.coffeeDemo(sharerID: "elena-rodriguez")
        draft.question = ""
        XCTAssertFalse(draft.canSubmit)

        draft.question = "如何规划产品路线图？"
        draft.selectedSlotIDs = []
        XCTAssertFalse(draft.canSubmit)
    }
}
