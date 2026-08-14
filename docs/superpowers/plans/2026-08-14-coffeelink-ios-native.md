# CoffeeLink iOS Native App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Swift 6 and SwiftUI iPhone app in `ios` that faithfully reproduces every visible screen, interaction, and demo state in the existing `coffeelink` React prototype.

**Architecture:** A zero-runtime-dependency SwiftUI app uses a type-safe `NavigationStack`, a custom three-tab shell, and one `@Observable @MainActor AppStore` as the source of truth. Deterministic Swift Mock data and JSON persistence replace remote APIs for this milestone; reusable design-system components keep the visual clone consistent across screens.

**Tech Stack:** Swift 6, SwiftUI, Observation, XCTest, XCUITest, Xcode 16.3, XcodeGen, iOS 17.0 deployment target, iPhone 15 Pro and iPhone 16 Pro / iOS 18.4 Simulators.

## Global Constraints

- All iOS implementation files live under `ios`; do not modify `coffeelink`.
- Deployment target is exactly iOS 17.0 and the app targets iPhone only.
- Use Swift 6 language mode and no third-party runtime libraries.
- The current dark `coffeelink` prototype is the visual and interaction source of truth.
- Preserve actual UTF-8 Chinese UI copy; never replace it with `\uXXXX` escape sequences.
- The `393 × 852` Web reference viewport is the primary visual baseline.
- Use an iPhone 15 Pro simulator for equal-size `393 × 852` visual comparisons; use iPhone 16 Pro for final compatibility acceptance.
- Local Mock flows must cover every route and modal currently reachable from `coffeelink/src/App.tsx`.
- A task is complete only after its focused tests and the full build pass.
- Preserve unrelated working-tree changes in `.DS_Store` and `agents/*.toml`.

---

## File Map

```text
ios/
├── project.yml                                  XcodeGen project definition
├── CoffeeLink.xcodeproj/                        Generated Xcode project
├── CoffeeLink/
│   ├── App/
│   │   ├── CoffeeLinkApp.swift                  App entry point
│   │   ├── AppRoute.swift                       Tabs, routes and sheets
│   │   ├── AppStore.swift                       Application state and actions
│   │   └── RootView.swift                       Tab shell and routing
│   ├── Models/
│   │   ├── CoffeeModels.swift                   Drinks, themes, users and sharers
│   │   └── SessionModels.swift                  Invitations and session states
│   ├── Data/
│   │   ├── DemoData.swift                       Deterministic prototype fixtures
│   │   └── LocalPersistence.swift               JSON snapshot persistence
│   ├── DesignSystem/
│   │   ├── CoffeeLinkTheme.swift                Colors, type, spacing and shadows
│   │   ├── CoffeeLinkComponents.swift           Buttons, badges, cards and avatars
│   │   ├── CoffeeLinkForms.swift                Text fields and form feedback
│   │   └── CoffeeLinkTabBar.swift               Prototype-matching tab bar
│   ├── Features/
│   │   ├── Discover/DiscoverView.swift
│   │   ├── Discover/SharerCard.swift
│   │   ├── SharerDetail/SharerDetailView.swift
│   │   ├── Invitation/CreateInvitationView.swift
│   │   ├── Invitation/BookingCheckoutView.swift
│   │   ├── Chats/ChatsListView.swift
│   │   ├── Chats/ChatDetailView.swift
│   │   ├── Profile/ProfileView.swift
│   │   ├── SharingCenter/SharingCenterView.swift
│   │   ├── Auth/AuthFlowView.swift
│   │   └── Modals/BusinessSheets.swift
│   └── Resources/Assets.xcassets/               App icon, colors and bundled avatars
├── CoffeeLinkTests/
│   ├── AppStoreTests.swift
│   ├── AuthValidationTests.swift
│   └── LocalPersistenceTests.swift
├── CoffeeLinkUITests/
│   ├── CoreFlowsUITests.swift
│   └── VisualBaselineUITests.swift
└── VisualTests/
    ├── References/                               Copied Web screenshots
    ├── Captures/                                 Simulator screenshots
    └── compare.swift                             Overlay and pixel-difference tool
```

## Task 1: Generate the iOS Project and Establish the Design-System Baseline

**Files:**
- Create: `ios/project.yml`
- Create: `ios/CoffeeLink/App/CoffeeLinkApp.swift`
- Create: `ios/CoffeeLink/App/RootView.swift`
- Create: `ios/CoffeeLink/DesignSystem/CoffeeLinkTheme.swift`
- Create: `ios/CoffeeLink/Resources/Assets.xcassets/Contents.json`
- Create: `ios/CoffeeLinkTests/AppLaunchTests.swift`

**Interfaces:**
- Produces: `CoffeeLinkTheme`, `CoffeeLinkApp`, and a buildable `CoffeeLink` scheme used by every later task.
- Consumes: Xcode 16.3 at `/Applications/Xcode.app` and XcodeGen installed through Homebrew.

- [ ] **Step 1: Install the project generator**

Run: `brew install xcodegen`

Expected: `xcodegen --version` exits 0. XcodeGen is development tooling only and is not linked into the app.

Create the equal-size visual device:

```bash
xcrun simctl create 'CoffeeLink Visual iPhone 15 Pro' com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro com.apple.CoreSimulator.SimRuntime.iOS-18-4
```

Expected: the command prints one simulator UUID. If that exact device name already exists, reuse it instead of creating a duplicate.

- [ ] **Step 2: Define the Xcode project**

Create `ios/project.yml` with these exact target settings:

```yaml
name: CoffeeLink
options:
  deploymentTarget:
    iOS: "17.0"
settings:
  base:
    SWIFT_VERSION: "6.0"
    TARGETED_DEVICE_FAMILY: "1"
    MARKETING_VERSION: "1.0"
    CURRENT_PROJECT_VERSION: "1"
targets:
  CoffeeLink:
    type: application
    platform: iOS
    sources: [CoffeeLink]
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: com.coffeelink.app
        INFOPLIST_KEY_UIApplicationSceneManifest_Generation: true
        INFOPLIST_KEY_UILaunchScreen_Generation: true
        INFOPLIST_KEY_UIUserInterfaceStyle: Dark
  CoffeeLinkTests:
    type: bundle.unit-test
    platform: iOS
    sources: [CoffeeLinkTests]
    dependencies:
      - target: CoffeeLink
  CoffeeLinkUITests:
    type: bundle.ui-testing
    platform: iOS
    sources: [CoffeeLinkUITests]
    dependencies:
      - target: CoffeeLink
schemes:
  CoffeeLink:
    build:
      targets:
        CoffeeLink: all
        CoffeeLinkTests: [test]
        CoffeeLinkUITests: [test]
    test:
      targets: [CoffeeLinkTests, CoffeeLinkUITests]
```

- [ ] **Step 3: Write the failing launch test**

Create `ios/CoffeeLinkTests/AppLaunchTests.swift`:

```swift
import XCTest
@testable import CoffeeLink

final class AppLaunchTests: XCTestCase {
    func testPrototypeViewportConstantsMatchReference() {
        XCTAssertEqual(CoffeeLinkTheme.referenceWidth, 393)
        XCTAssertEqual(CoffeeLinkTheme.referenceHeight, 852)
        XCTAssertEqual(CoffeeLinkTheme.cornerRadius, 16)
    }
}
```

- [ ] **Step 4: Generate and run the failing test**

Run: `cd ios && xcodegen generate`

Run: `xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' -only-testing:CoffeeLinkTests/AppLaunchTests test`

Expected: FAIL because `CoffeeLinkTheme` does not exist.

- [ ] **Step 5: Implement the minimal app and theme constants**

Create `CoffeeLinkTheme` with these public constants and colors:

```swift
enum CoffeeLinkTheme {
    static let referenceWidth: CGFloat = 393
    static let referenceHeight: CGFloat = 852
    static let cornerRadius: CGFloat = 16
    static let background = Color(red: 0.035, green: 0.031, blue: 0.045)
    static let surface = Color(red: 0.075, green: 0.067, blue: 0.090)
    static let elevatedSurface = Color(red: 0.090, green: 0.080, blue: 0.105)
    static let border = Color.white.opacity(0.10)
    static let primaryText = Color.white.opacity(0.96)
    static let secondaryText = Color.white.opacity(0.58)
    static let accent = Color(red: 0.976, green: 0.365, blue: 0.145)
    static let success = Color(red: 0.22, green: 0.78, blue: 0.53)
}
```

Implement `CoffeeLinkApp` with `RootView()` and a temporary dark `Text("CoffeeLink")` screen.

- [ ] **Step 6: Verify project health**

Run the focused test again; expected: PASS.

Run: `xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' build`

Expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 7: Commit**

```bash
git add ios/project.yml ios/CoffeeLink.xcodeproj ios/CoffeeLink ios/CoffeeLinkTests/AppLaunchTests.swift
git commit -m "feat(ios): scaffold CoffeeLink SwiftUI app"
```

## Task 2: Model Prototype Data, Persistence, and State Transitions

**Files:**
- Create: `ios/CoffeeLink/Models/CoffeeModels.swift`
- Create: `ios/CoffeeLink/Models/SessionModels.swift`
- Create: `ios/CoffeeLink/Data/DemoData.swift`
- Create: `ios/CoffeeLink/Data/LocalPersistence.swift`
- Create: `ios/CoffeeLink/App/AppStore.swift`
- Create: `ios/CoffeeLinkTests/AppStoreTests.swift`
- Create: `ios/CoffeeLinkTests/LocalPersistenceTests.swift`

**Interfaces:**
- Produces: `CoffeeDrink`, `ChatTheme`, `Sharer`, `UserProfile`, `ChatSession`, `SessionType`, `SessionStatus`, `DemoData.snapshot`, `LocalPersistence`, and `AppStore`.
- `AppStore` exposes `submitInvitation`, `acceptInvitation`, `declineInvitation`, `completePayment`, `cancelSession`, `submitReview`, `submitComplaint`, `updateProfile`, and `resetDemoData`.

- [ ] **Step 1: Write failing state-transition tests**

Create tests using these exact assertions:

```swift
@MainActor
func testCoffeeInvitationRequiresPaymentAfterAcceptance() throws {
    let store = AppStore(snapshot: .demo, persistence: .inMemory)
    let id = try store.submitInvitation(
        sharerID: "elena-rodriguez",
        type: .coffee,
        themeID: "product-roadmap",
        question: "如何在资源受限时平衡技术债务与新商业功能？",
        slotIDs: ["slot-elena-1"]
    )
    store.acceptInvitation(id: id, confirmedSlotID: "slot-elena-1", receiverQuestion: nil)
    XCTAssertEqual(store.session(id: id)?.status, .acceptedPendingPayment)
    store.completePayment(id: id, method: .wechat)
    XCTAssertEqual(store.session(id: id)?.status, .booked)
}

@MainActor
func testTopicSwapSchedulesWithoutPayment() throws {
    let store = AppStore(snapshot: .demo, persistence: .inMemory)
    let id = try store.submitTopicSwap(
        sharerID: "elena-rodriguez",
        requestedThemeID: "product-roadmap",
        offeredThemeID: "ai-product-growth",
        question: "如何建立产品路线图？",
        offering: "我可以分享 AI 产品冷启动经验。",
        slotIDs: ["slot-elena-1"]
    )
    store.acceptInvitation(id: id, confirmedSlotID: "slot-elena-1", receiverQuestion: "如何验证 AI 产品需求？")
    XCTAssertEqual(store.session(id: id)?.status, .swapScheduled)
}
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' -only-testing:CoffeeLinkTests/AppStoreTests test`

Expected: FAIL because the domain types and `AppStore` are undefined.

- [ ] **Step 3: Implement domain models with stable identifiers**

Use `Codable`, `Hashable`, `Identifiable`, and `Sendable` where applicable. Define the status enum exactly:

```swift
enum SessionStatus: String, Codable, CaseIterable, Sendable {
    case pendingResponse
    case needsNewTime
    case acceptedPendingPayment
    case swapScheduled
    case declined
    case expired
    case booked
    case completed
    case inAfterSale
    case refunding
    case cancelled
}
```

Copy all visible fixture names, jobs, themes, drink prices, questions, time slots, status labels, meeting links and feedback from `coffeelink/src/data/mockData.ts` into `DemoData.swift`.

- [ ] **Step 4: Implement persistence and the store**

Define:

```swift
struct AppSnapshot: Codable, Equatable, Sendable {
    var currentUser: UserProfile
    var sharers: [Sharer]
    var sessions: [ChatSession]
}

struct LocalPersistence: Sendable {
    let load: @Sendable () throws -> AppSnapshot?
    let save: @Sendable (AppSnapshot) throws -> Void
    static let live: LocalPersistence
    static let inMemory: LocalPersistence
}

@MainActor @Observable
final class AppStore {
    private(set) var snapshot: AppSnapshot
    var lastErrorMessage: String?
    init(snapshot: AppSnapshot = .demo, persistence: LocalPersistence = .live)
}
```

Every mutating method saves a new snapshot. If decoding fails, fall back to `.demo` and set `lastErrorMessage` to `"演示数据已恢复"`.

- [ ] **Step 5: Add persistence round-trip tests**

Encode and decode `AppSnapshot.demo`, assert equality, and assert corrupt JSON falls back to demo data with the recovery message.

- [ ] **Step 6: Run focused and full unit tests**

Expected: all `AppStoreTests` and `LocalPersistenceTests` pass; full app build succeeds.

- [ ] **Step 7: Commit**

```bash
git add ios/CoffeeLink/Models ios/CoffeeLink/Data ios/CoffeeLink/App/AppStore.swift ios/CoffeeLinkTests
git commit -m "feat(ios): add deterministic CoffeeLink demo state"
```

## Task 3: Build Navigation, Shared Components, and the Prototype Tab Shell

**Files:**
- Create: `ios/CoffeeLink/App/AppRoute.swift`
- Modify: `ios/CoffeeLink/App/RootView.swift`
- Create: `ios/CoffeeLink/DesignSystem/CoffeeLinkComponents.swift`
- Create: `ios/CoffeeLink/DesignSystem/CoffeeLinkForms.swift`
- Create: `ios/CoffeeLink/DesignSystem/CoffeeLinkTabBar.swift`
- Create: `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`

**Interfaces:**
- Produces: `AppTab`, `AppRoute`, `SheetRoute`, `CoffeeCard`, `CoffeeBadge`, `CoffeeAvatar`, `CoffeePrimaryButton`, `CoffeeTextField`, and `CoffeeLinkTabBar`.
- Consumes: `AppStore` from Task 2 and `CoffeeLinkTheme` from Task 1.

- [ ] **Step 1: Write a failing tab-navigation UI test**

```swift
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
```

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because the tab accessibility identifiers do not exist.

- [ ] **Step 3: Implement typed routes**

```swift
enum AppTab: String, CaseIterable, Hashable { case discover, chats, mine }

enum AppRoute: Hashable {
    case sharerDetail(String)
    case createInvitation(sharerID: String, type: SessionType, themeID: String?)
    case checkout(String)
    case chatDetail(String)
    case sharingCenter
}
```

Define `SheetRoute` for auth, meeting, settings, edit profile, manage themes, select drink, topic-swap settings, accept, decline, review and complaint.

- [ ] **Step 4: Implement the shell and reusable visuals**

Match the Web prototype's 56pt top bar, 72pt bottom bar, orange selected icon, muted unselected icons, unread red dot, 16pt card radius and 1px translucent borders. Keep tappable tab regions at least 44pt and set `.accessibilityIdentifier("tab.<name>")`.

- [ ] **Step 5: Run the focused UI test and full build**

Expected: tab test passes and the app opens on a dark Discover placeholder without layout warnings.

- [ ] **Step 6: Commit**

```bash
git add ios/CoffeeLink/App ios/CoffeeLink/DesignSystem ios/CoffeeLinkUITests/CoreFlowsUITests.swift
git commit -m "feat(ios): add CoffeeLink navigation and component system"
```

## Task 4: Reproduce Discover and Sharer Detail

**Files:**
- Create: `ios/CoffeeLink/Features/Discover/DiscoverView.swift`
- Create: `ios/CoffeeLink/Features/Discover/SharerCard.swift`
- Create: `ios/CoffeeLink/Features/SharerDetail/SharerDetailView.swift`
- Create: `ios/CoffeeLink/Resources/Assets.xcassets/Avatars/*.imageset/*`
- Modify: `ios/CoffeeLink/App/RootView.swift`
- Modify: `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`

**Interfaces:**
- Produces: `DiscoverView(store:path:)`, `SharerCard(sharer:)`, and `SharerDetailView(sharer:path:)`.
- Consumes: `Sharer`, `AppStore`, `CoffeeCard`, `CoffeeBadge`, and `AppRoute`.

- [ ] **Step 1: Bundle deterministic avatar assets**

Download the five exact Unsplash source images referenced by `coffeelink/src/data/mockData.ts` and store them as Elena, David, Mia, Leo and Alex image sets. Verify each image is readable with `sips -g pixelWidth -g pixelHeight <file>`.

- [ ] **Step 2: Write a failing Discover-to-detail UI test**

```swift
func testDiscoverOpensElenaDetail() {
    let app = launchResetDemo()
    XCTAssertTrue(app.staticTexts["Elena Rodriguez"].waitForExistence(timeout: 2))
    app.buttons["sharer.elena-rodriguez"].tap()
    XCTAssertTrue(app.staticTexts["分享者详情"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.buttons["请喝咖啡（¥22）"].exists)
    XCTAssertTrue(app.buttons["主题互换（0元）"].exists)
}
```

- [ ] **Step 3: Implement Discover exactly from the reference**

Implement the top title, overflow action, search field, horizontally scrolling category pills, ordered sharer cards, drink and swap badges, theme chips, summary, earliest slot and right-aligned price. Use the Web copy and ordering unchanged.

- [ ] **Step 4: Implement Sharer Detail exactly from the reference**

Implement centered avatar and verification badge, name and role, user-declared notice, signature drink card, swap availability card, career highlights, open topics and the fixed two-button bottom action bar.

- [ ] **Step 5: Build, run the flow, and capture two screenshots**

Run UI test; expected: PASS.

Capture:

```bash
xcrun simctl io booted screenshot ios/VisualTests/Captures/01-home.png
xcrun simctl io booted screenshot ios/VisualTests/Captures/02-profile-detail.png
```

Compare against `coffeelink/audit/2026-08-14-ios/01-home.png` and `02-profile-detail.png`; correct visible spacing or wrapping differences before committing.

- [ ] **Step 6: Commit**

```bash
git add ios/CoffeeLink/Features/Discover ios/CoffeeLink/Features/SharerDetail ios/CoffeeLink/Resources ios/CoffeeLink/App/RootView.swift ios/CoffeeLinkUITests
git commit -m "feat(ios): reproduce discovery and sharer detail"
```

## Task 5: Implement Authentication, Invitation, and Checkout Flows

**Files:**
- Create: `ios/CoffeeLink/Features/Auth/AuthFlowView.swift`
- Create: `ios/CoffeeLink/Features/Invitation/CreateInvitationView.swift`
- Create: `ios/CoffeeLink/Features/Invitation/BookingCheckoutView.swift`
- Create: `ios/CoffeeLinkTests/AuthValidationTests.swift`
- Modify: `ios/CoffeeLink/App/RootView.swift`
- Modify: `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`

**Interfaces:**
- Produces: `AuthMode`, `AuthDraft`, `AuthValidator`, `AuthFlowView`, `InvitationDraft`, `CreateInvitationView`, and `BookingCheckoutView`.
- Consumes: `AppStore.submitInvitation`, `AppStore.submitTopicSwap`, `AppStore.completePayment`, `SheetRoute.auth`, and `AppRoute.checkout`.

- [ ] **Step 1: Write failing validation tests**

```swift
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
```

- [ ] **Step 2: Run and confirm failure**

Expected: FAIL because auth and invitation draft types do not exist.

- [ ] **Step 3: Implement the three auth modes**

Use a custom centered overlay matching the 393pt-wide Web prototype, with the same CoffeeLink icon, titles, subtitles, fields, demonstration values, orange primary button and cross-links. Configure phone, OTP, password and confirmation fields with appropriate keyboard and content types while preserving the visible design.

Registration success returns to Login and pre-fills the phone number. Password reset returns to Login and invalidates the Mock old password. Login resumes the pending invitation submission.

- [ ] **Step 4: Implement coffee and topic-swap invitation forms**

Match the fixed top bar, sharer card, two-mode segmented control, drink explanation, selectable theme cards, 0/300 question counter, up-to-three time selections and fixed bottom price/action bar. Topic swap additionally requires the current user's offered topic and offering description.

- [ ] **Step 5: Implement checkout states**

Show drink, ¥ amount, selected topic, both users, 30-minute slot, refund copy and WeChat/Alipay selectors. The confirm action calls `completePayment` and returns to chat detail. Provide deterministic launch arguments `-payment-result success|failure|cancelled` for UI tests.

- [ ] **Step 6: Run tests and capture authentication and invitation screens**

Expected: validation tests and the full Discover → detail → invitation → auth → submit flow pass.

Capture and compare `03-invite.png`, `05-login.png`, `06-register.png`, and `07-reset-password.png` against the Web references. Correct keyboard avoidance, button position and modal sizing before commit.

- [ ] **Step 7: Commit**

```bash
git add ios/CoffeeLink/Features/Auth ios/CoffeeLink/Features/Invitation ios/CoffeeLink/App/RootView.swift ios/CoffeeLinkTests ios/CoffeeLinkUITests
git commit -m "feat(ios): add auth invitation and checkout flows"
```

## Task 6: Implement Chats, Details, Acceptance, Feedback, and Complaints

**Files:**
- Create: `ios/CoffeeLink/Features/Chats/ChatsListView.swift`
- Create: `ios/CoffeeLink/Features/Chats/ChatDetailView.swift`
- Create: `ios/CoffeeLink/Features/Modals/BusinessSheets.swift`
- Modify: `ios/CoffeeLink/App/RootView.swift`
- Modify: `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`

**Interfaces:**
- Produces: `ChatsListView`, `ChatDetailView`, `AcceptInvitationSheet`, `DeclineInvitationSheet`, `MeetingSheet`, `ReviewSheet`, and `ComplaintSheet`.
- Consumes: all `AppStore` session transition methods and `ChatSession` status fields.

- [ ] **Step 1: Add failing UI tests for both inbox directions**

Test `我发起的邀请` and `发给我的邀请`, all five filters, immediate payment from an accepted record, meeting access from a booked record, and accept/decline actions on an incoming record.

```swift
func testIncomingInvitationCanBeAccepted() {
    let app = launchResetDemo()
    app.buttons["tab.chats"].tap()
    app.buttons["发给我的邀请（2）"].tap()
    app.buttons["session.incoming-coffee"].tap()
    app.buttons["接受邀请"].tap()
    app.buttons["slot.slot-incoming-1"].tap()
    app.buttons["确认接受"].tap()
    XCTAssertTrue(app.staticTexts["等待对方付款"].waitForExistence(timeout: 2))
}
```

- [ ] **Step 2: Implement the list**

Match the title, overflow action, orange direction segment, five compact filter chips and prototype card density. Each card shows type, drink/price or swap label, status, avatar, topic, counterpart, clipped question, confirmed time, duration and status-specific primary action.

- [ ] **Step 3: Implement the detail state matrix**

Render the correct action set for every `SessionStatus`: cancel while pending, accept/decline when incoming, pay when accepted, meeting/cancel when booked, feedback/complaint when completed, and read-only terminal summaries for declined, expired and cancelled states.

- [ ] **Step 4: Implement business sheets**

Accept selects one still-available slot and requires a receiver question for topic swap. Decline requires one standard reason. Review uses 1–5 stars, tags and optional text. Complaint requires a category and explanation. Meeting shows the exact Tencent meeting number and link from the fixture.

- [ ] **Step 5: Run focused UI tests and capture the chats baseline**

Capture `08-chats.png` in the same initial filter state as the Web reference. Correct density, truncation, filter sizing and fixed Tab Bar position before commit.

- [ ] **Step 6: Commit**

```bash
git add ios/CoffeeLink/Features/Chats ios/CoffeeLink/Features/Modals ios/CoffeeLink/App/RootView.swift ios/CoffeeLinkUITests
git commit -m "feat(ios): add invitation and chat management"
```

## Task 7: Implement Profile, Sharing Center, and Configuration Modals

**Files:**
- Create: `ios/CoffeeLink/Features/Profile/ProfileView.swift`
- Create: `ios/CoffeeLink/Features/SharingCenter/SharingCenterView.swift`
- Modify: `ios/CoffeeLink/Features/Modals/BusinessSheets.swift`
- Modify: `ios/CoffeeLink/App/AppStore.swift`
- Modify: `ios/CoffeeLink/App/RootView.swift`
- Modify: `ios/CoffeeLinkUITests/CoreFlowsUITests.swift`

**Interfaces:**
- Produces: `ProfileView`, `SharingCenterView`, `EditProfileSheet`, `ManageThemesSheet`, `SelectDrinkSheet`, `TopicSwapSettingsSheet`, and `AppearanceSheet`.
- Consumes: `AppStore.updateProfile`, `AppStore.updateThemes`, `AppStore.selectDrink`, `AppStore.updateTopicSwapSettings`, and `AppStore.toggleSharing`.

- [ ] **Step 1: Write a failing sharing-center UI test**

```swift
func testSignatureDrinkChangePersists() {
    let app = launchResetDemo()
    app.buttons["tab.mine"].tap()
    app.buttons["进入分享中心"].tap()
    app.buttons["设置签名饮品"].tap()
    app.buttons["drink.flat-white"].tap()
    XCTAssertTrue(app.staticTexts["澳白 ¥26"].waitForExistence(timeout: 2))
    app.terminate()
    app.launch()
    app.buttons["tab.mine"].tap()
    XCTAssertTrue(app.staticTexts["澳白（¥26）"].waitForExistence(timeout: 2))
}
```

- [ ] **Step 2: Implement Profile exactly from the reference**

Match the title and settings gear, gradient profile card, verification badge, masked phone, three statistics, orange outlined sharing-center card, three grouped menu rows, logout row, footer copy and Tab Bar.

- [ ] **Step 3: Implement Sharing Center**

Include sharing status, readiness checklist, public profile preview, up-to-three themes, signature drink, slots, meeting link, topic-swap toggle and weekly limit, pending invitations link and income summary. All edit actions open their matching sheet and save through `AppStore`.

- [ ] **Step 4: Implement configuration sheets**

Replicate the Web modal copy, field values, drink catalog and topic forms. Limit active themes to three and disable publishing until profile, at least one theme, drink, slot and meeting link are complete.

- [ ] **Step 5: Run tests and capture Profile and Sharing Center**

Compare Profile with `04-mine.png`; separately capture Sharing Center and all configuration sheets as new baselines in `ios/VisualTests/References` and `Captures`.

- [ ] **Step 6: Commit**

```bash
git add ios/CoffeeLink/Features/Profile ios/CoffeeLink/Features/SharingCenter ios/CoffeeLink/Features/Modals ios/CoffeeLink/App ios/CoffeeLinkUITests
git commit -m "feat(ios): add profile and sharing management"
```

## Task 8: Add Repeatable Visual Comparison and Close Visual Gaps

**Files:**
- Create: `ios/VisualTests/References/*.png`
- Create: `ios/VisualTests/compare.swift`
- Create: `ios/CoffeeLinkUITests/VisualBaselineUITests.swift`
- Modify: visual files under `ios/CoffeeLink/DesignSystem` and `ios/CoffeeLink/Features` only when a measured mismatch requires it.

**Interfaces:**
- Produces: deterministic screenshot launch states, `overlay.png`, `difference.png`, and a text mismatch percentage for each screen.
- Consumes: the eight existing Web audit screenshots and new reference captures for checkout, chat detail and sharing center.

- [ ] **Step 1: Copy immutable Web references**

Copy the eight PNG files from `coffeelink/audit/2026-08-14-ios` into `ios/VisualTests/References` without changing the source files. Record their dimensions with `sips`.

- [ ] **Step 2: Implement deterministic visual launch states**

Run visual states on `CoffeeLink Visual iPhone 15 Pro`, whose logical screen is the same `393 × 852` size as the Web references. Support launch arguments such as:

```text
-ui-testing -reset-demo -visual-screen discover
-ui-testing -reset-demo -visual-screen sharer-detail
-ui-testing -reset-demo -visual-screen invitation
-ui-testing -reset-demo -visual-screen profile
-ui-testing -reset-demo -visual-screen login
-ui-testing -reset-demo -visual-screen register
-ui-testing -reset-demo -visual-screen reset-password
-ui-testing -reset-demo -visual-screen chats
```

Each argument must open directly into a stable state with animations disabled and no blinking cursor.

- [ ] **Step 3: Write the visual capture test**

Use `XCUIScreen.main.screenshot()` for each state, attach it to the test result and save an identical PNG into `ios/VisualTests/Captures` through the simulator screenshot command after the UI test positions the screen.

- [ ] **Step 4: Implement `compare.swift`**

Use AppKit `NSBitmapImageRep` to require equal pixel dimensions, produce a 50% alpha overlay, write an absolute RGB-difference image, and print:

```text
different_pixels=<count>
total_pixels=<count>
difference_ratio=<0...1>
```

Treat pixels whose maximum channel delta is at most 12/255 as equal so text antialiasing does not dominate the result.

- [ ] **Step 5: Iterate screen by screen**

For each baseline, compare layout in this order: safe-area origin, top bar, main card frames, typography and wrapping, fixed bottom area, colors, borders, shadows, icons and minor decoration. Change the smallest relevant design token or view constraint, rebuild, recapture and compare again.

Do not stop at a passing build. Continue until no major frame differs by more than approximately 2pt and the remaining difference image is limited to platform typography, status-bar rendering and expected antialiasing.

- [ ] **Step 6: Run all unit and UI tests after visual tuning**

Run the full functional suite on iPhone 16 Pro:

```bash
xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' test
```

Expected: `** TEST SUCCEEDED **`.

- [ ] **Step 7: Commit**

```bash
git add ios/VisualTests ios/CoffeeLinkUITests/VisualBaselineUITests.swift ios/CoffeeLink/DesignSystem ios/CoffeeLink/Features
git commit -m "test(ios): add visual parity regression suite"
```

## Task 9: Final Simulator Acceptance and Handoff Evidence

**Files:**
- Create: `ios/README.md`
- Create: `ios/VisualTests/REPORT.md`
- Modify: only files required by defects reproduced during final acceptance.

**Interfaces:**
- Produces: verified build/test commands, the final visual comparison table, known platform-only differences and an operator guide for resetting Mock data.
- Consumes: all previous tasks.

- [ ] **Step 1: Perform a clean build**

Run: `xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink clean build -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4'`

Expected: `** BUILD SUCCEEDED **` from a clean DerivedData state.

Repeat the build for `platform=iOS Simulator,name=CoffeeLink Visual iPhone 15 Pro,OS=18.4`; expected: `** BUILD SUCCEEDED **`.

- [ ] **Step 2: Run the complete automated suite**

Run all unit and UI tests. Record total tests, failures and duration in `ios/VisualTests/REPORT.md`. A nonzero failure count blocks completion.

- [ ] **Step 3: Execute the manual acceptance matrix**

Verify these flows in the Simulator:

1. Discover → Elena → coffee invitation → login → submit.
2. Incoming invitation → accept → pending payment.
3. Accepted invitation → WeChat payment → booked → Tencent meeting.
4. Topic swap → receiver question → scheduled.
5. Completed session → review and complaint paths.
6. Mine → Sharing Center → profile, themes, drink, slots, meeting and swap settings.
7. Login → register → login and Login → reset password → login.
8. App termination and relaunch preserves user changes.

- [ ] **Step 4: Re-run every visual baseline**

Record reference path, capture path, difference path, difference ratio and manual status for every screen. Any obvious mismatch returns to Task 8 before completion.

- [ ] **Step 5: Write the operator README**

Document Xcode version, XcodeGen generation command, build/test commands, default simulator, Mock credentials, reset mechanism, project structure and the explicit boundary that no real network service is connected.

- [ ] **Step 6: Inspect the final diff**

Run `git status --short`, `git diff --check`, search `ios` for `TODO`, `FIXME` and `\u[0-9A-Fa-f]{4}`, and confirm only intended project files changed.

- [ ] **Step 7: Commit**

```bash
git add ios/README.md ios/VisualTests/REPORT.md
git commit -m "docs(ios): add CoffeeLink verification report"
```

- [ ] **Step 8: Report completion with evidence**

Provide the Xcode project link, final commit list, build result, test result, simulator device, verified flows, visual report link and any remaining platform-only rendering differences. Do not claim literal pixel identity where the report still shows a visible mismatch.
