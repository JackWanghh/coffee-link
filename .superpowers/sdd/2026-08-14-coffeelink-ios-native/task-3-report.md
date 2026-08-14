# Task 3 Report: Navigation and Shared Component Shell

## Changed files

- `ios/CoffeeLink/App/AppRoute.swift`
  - Added `AppTab`, typed `AppRoute`, and item-driven `SheetRoute` coverage for auth, meeting, settings, profile, themes, drink, topic swap, invitation response, review, and complaint flows.
- `ios/CoffeeLink/App/RootView.swift`
  - Added the `AppStore`-backed root shell, dark three-tab content, typed `NavigationStack` destinations, and centralized sheet presentation.
  - UI-test launches now use deterministic in-memory demo state for `-ui-testing` and `-reset-demo`.
- `ios/CoffeeLink/DesignSystem/CoffeeLinkComponents.swift`
  - Added the 16pt bordered card, badge, avatar, primary button, and fixed 56pt top bar.
- `ios/CoffeeLink/DesignSystem/CoffeeLinkForms.swift`
  - Added CoffeeLink-styled text fields.
- `ios/CoffeeLink/DesignSystem/CoffeeLinkTabBar.swift`
  - Added 72pt custom three-tab bar with 44pt minimum hit regions, selected orange state, muted inactive state, unread red dot, and tab identifiers.
- `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`
  - Added the three-tab reachability UI test; the test method is `@MainActor` for Swift 6/XCTest isolation.
- `ios/CoffeeLink.xcodeproj/project.pbxproj`
  - Regenerated with XcodeGen so all new Swift files and the previously empty UI-test target are members of their intended targets.

## TDD evidence

1. Added `testThreeTabsAreReachable` before production navigation code.
2. First simulator invocation was blocked by sandbox access to CoreSimulator, so no test process was reached. It was repeated with the required simulator permission.
3. The first permitted run exposed Swift 6 actor-isolation errors in the new XCTest method. Added `@MainActor` to the test method only.
4. RED was then observed on iPhone 16 Pro: the app launched, and the test failed with `No matches found for Descendants matching type Button` for `tab.discover`.
5. Implemented the shell and components. The focused test then passed: `Executed 1 test, with 0 failures` and `TEST SUCCEEDED`.

## Verification commands and results

```text
cd ios && xcodegen generate
# Created CoffeeLink.xcodeproj with all new source and UI-test files.

xcodebuild test -project CoffeeLink.xcodeproj -scheme CoffeeLink \\
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \\
  -only-testing:CoffeeLinkUITests/CoreFlowsUITests/testThreeTabsAreReachable
# PASS: 1 UI test, 0 failures.

xcodebuild test -project CoffeeLink.xcodeproj -scheme CoffeeLink \\
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
# PASS: CoffeeLinkTests 6 tests, 0 failures; CoffeeLinkUITests 1 test, 0 failures.

xcodebuild test -project CoffeeLink.xcodeproj -scheme CoffeeLink \\
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \\
  -only-testing:CoffeeLinkTests
# PASS (also covered by the unfiltered run above).

xcodebuild build -project CoffeeLink.xcodeproj -scheme CoffeeLink \\
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
# BUILD SUCCEEDED.

git diff --check
# PASS.

rg -n --glob '*.swift' '\\u[0-9A-Fa-f]{4}' ios
# PASS: no matches.
```

## Self-review

- All UI text is stored as readable UTF-8 Chinese where applicable; the Unicode-escape scan is clean.
- The custom tab buttons use `.buttonStyle(.plain)`, CoffeeLink colors, a 72pt visual bar, 44pt minimum interactions, and `tab.discover`, `tab.chats`, and `tab.mine` accessibility identifiers.
- The UI test also verifies the selected Discover state and the visible chat/profile headings after interaction.
- The route and sheet enums use lightweight, hashable identifiers rather than view instances. The root uses `AppStore.snapshot` as the tab content data source.
- XcodeGen was rerun after all new source files were created, removing the empty UI-test bundle condition in the unfiltered scheme run.

## Concerns

- Task 3 intentionally provides shell-level destination and sheet placeholders; detailed destination and modal bodies remain for the feature tasks that own those flows.
- Xcode emits existing simulator runtime duplicate-class diagnostics and an `IDEResultKit` result-bundle-saving warning after the unfiltered test session. XCTest itself reported all 7 tests passed and exited successfully; these are simulator/Xcode artifact warnings, not test or app failures.
