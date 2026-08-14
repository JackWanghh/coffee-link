# Task 5 report

Implemented local Mock authentication, coffee/topic-swap invitation creation, coffee checkout and RootView integration.

- TDD RED: `AuthValidationTests` failed after xcodegen because `AuthDraft`, `AuthValidator`, and `InvitationDraft` did not exist.
- Focused GREEN: `AuthValidationTests` and `AppStoreTests` passed (4 tests).
- UI: authentication direct launch modes, logged-out invitation → login → resumed submission, and payment result launch states were exercised on CoffeeLink Visual iPhone 15 Pro.
- Visual captures: `ios/VisualTests/Captures/03-invite.png`, `05-login.png`, `06-register.png`, `07-reset-password.png`.

Known scope: payment result launch states visually display their deterministic result; actual payment confirmation proceeds into chat detail using local Mock state.

## Final verification (2026-08-15)

- `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -only-testing:CoffeeLinkTests -resultBundlePath /private/tmp/CoffeeLinkTask5Unit.xcresult` — passed; `xcrun xcresulttool get test-results summary --path /private/tmp/CoffeeLinkTask5Unit.xcresult` reports 10 passed, 0 failed, 0 skipped.
- `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -resultBundlePath /private/tmp/CoffeeLinkTask5Full.xcresult` — passed; result bundle reports 17 passed, 0 failed, 0 skipped. This includes the Task 3/4 critical UI regressions: Discover → Elena detail, strategic-consulting filter, availability slots, and three-tab navigation.
- `xcodebuild build -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,name=iPhone 16 Pro'` — passed.
- `git diff --check 2d2f3fc..HEAD` — passed with no output.
- `rg -n '\\u[0-9A-Fa-f]{4}' ios/CoffeeLink ios/CoffeeLinkTests ios/CoffeeLinkUITests` — no matches (exit 1 expected for `rg`).

An initial simulator test-host signal-19 failure was resolved by shutting down, booting, and waiting for the Visual iPhone 15 Pro; every final verification above passed after recovery.

## Review fix round 1

- TDD RED: added AppStore credential relaunch, reset invalidation, failed-save visibility, and reset-demo isolation tests. The first run failed as expected because `CredentialPersistence` and the injectable AppStore initializer did not exist.
- GREEN: added `CredentialPersistence`; the live implementation stores only the local mock credential in iOS Keychain via Security.framework. `AppSnapshot` and UserDefaults do not contain a password. In-memory and failing implementations isolate tests and make failures observable. Registration/reset now report failure rather than transitioning as if persistence succeeded.
- UI isolation: `-ui-testing` and `-reset-demo` now select an independent in-memory credential persistence alongside the existing in-memory snapshot.
- Visual round: regenerated normalized `393 × 852` captures and `786 × 852` side-by-side comparisons. Auth direct-launch states are masked/empty reference drafts; interactive registration and reset continue to return to login with the real phone retained. The invitation reference state selects the first slot but still validates an empty question at submission.
- Focused result: `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -only-testing:CoffeeLinkUITests/CoreFlowsUITests/testInteractiveRegistrationAndResetReturnToLogin -resultBundlePath /private/tmp/CoffeeLinkTask5Round1Auth.xcresult` — passed; result bundle reports 1 passed, 0 failed, 0 skipped.
- Final units: `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -only-testing:CoffeeLinkTests -resultBundlePath /private/tmp/CoffeeLinkTask5Round1Unit.xcresult` — passed; result bundle reports 14 passed, 0 failed, 0 skipped.
- Final unfiltered scheme: `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -resultBundlePath /private/tmp/CoffeeLinkTask5Round1Full.xcresult` — passed; result bundle reports 22 passed, 0 failed, 0 skipped, including Task 3/4 UI regressions and invite/auth/resume/payment UI flows.
- Compatibility and hygiene: `xcodebuild build -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,name=iPhone 16 Pro'` passed; `git diff --check 2d2f3fc` had no output; `rg -n '\\u[0-9A-Fa-f]{4}' ios/CoffeeLink ios/CoffeeLinkTests ios/CoffeeLinkUITests` had no matches (exit 1 expected).

## Review fix round 2

- TDD RED: injected a `LocalPersistence.save` failure for login, registration, password reset, and reset-demo. All four initially failed because in-memory state and/or the credential persistence had already changed before the snapshot error was returned.
- Transaction semantics: each auth mutation now captures its prior snapshot and credential. On snapshot-save failure it restores the in-memory snapshot and restores/deletes the prior Keychain credential before returning failure. If credential rollback itself fails, `lastErrorMessage` becomes `本地数据保存失败；凭据回滚失败`; no operation reports success.
- GREEN: `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -only-testing:CoffeeLinkTests/AppStoreTests` passed after rollback implementation.
- Final round 2: unfiltered `xcodebuild test -quiet -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,id=BF3C45D6-6248-4D74-8B24-B381F584693D' -resultBundlePath /private/tmp/CoffeeLinkTask5Round2Full.xcresult` passed with 26 passed, 0 failed, 0 skipped; iPhone 16 Pro build passed; diff check clean; Swift Unicode escape scan had no matches.
