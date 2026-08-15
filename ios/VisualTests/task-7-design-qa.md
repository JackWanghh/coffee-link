# Task 7 Profile and Sharing Center Design QA

## Capture setup

- Device: `CoffeeLink Visual iPhone 15 Pro` (`BF3C45D6-6248-4D74-8B24-B381F584693D`), iOS 18.4.
- Native captures: all final captures were normalized from 3× simulator output to `393 × 852`.
- Profile reference: `coffeelink/audit/2026-08-14-ios/04-mine.png`, `393 × 852`.
- Profile comparison: `ios/VisualTests/Comparisons/04-mine-side-by-side.png`, `786 × 852`, Web on the left and Native on the right.
- Web runtime references: Sharing Center, Edit Profile, Select Drink, Topic Swap, Manage Themes and Appearance were captured from the actual React source at a `393 × 852` viewport.
- Edit Profile source note: the current Web `SharingCenterView` receives `onEditProfile` but does not render an action wired to it. A temporary `/private/tmp` story opened the unchanged `EditProfileModal` on first render; no tracked Web source was changed.

## Final captures

| State | Native capture | Reference / comparison | Result |
| --- | --- | --- | --- |
| Profile | `Captures/04-mine.png` | `Comparisons/04-mine-side-by-side.png` | pass |
| Sharing Center | `Captures/task-7-sharing-center.png` | `References/task-7-web-sharing-center.png`, `Comparisons/task-7-sharing-center-side-by-side.png` | pass |
| Current-user public preview | `Captures/task-7-profile-preview.png` | no isomorphic Web reference; native read-only product state | pass |
| Emerald sharer detail | `Captures/task-7-round2-emerald-sharer-detail.png` | dynamic-theme contrast representative; no separate Web state | pass |
| Emerald chats | `Captures/task-7-round2-emerald-chats.png` | dynamic-theme contrast representative; no separate Web state | pass |
| Edit Profile | `Captures/task-7-edit-profile.png` | `References/task-7-web-edit-profile.png`, `Comparisons/task-7-edit-profile-side-by-side.png` | pass |
| Manage Themes | `Captures/task-7-themes.png` | `References/task-7-web-themes.png`, `Comparisons/task-7-themes-side-by-side.png` | pass |
| Select Drink | `Captures/task-7-drink.png` | `References/task-7-web-drink.png`, `Comparisons/task-7-drink-side-by-side.png` | pass |
| Topic Swap | `Captures/task-7-topic-swap.png` | `References/task-7-web-topic-swap.png`, `Comparisons/task-7-topic-swap-side-by-side.png` | pass |
| Appearance | `Captures/task-7-appearance.png` | `References/task-7-web-appearance.png`, `Comparisons/task-7-appearance-side-by-side.png` | pass |
| Manage Slots | `Captures/task-7-slots.png` | no isomorphic Web Modal; PRD completion | pass |
| Meeting Link | `Captures/task-7-meeting-link.png` | no isomorphic Web Modal; PRD completion | pass |

## Fidelity review

| Area | Result | Evidence |
| --- | --- | --- |
| Profile hierarchy | pass | Single centered Top Bar, gear, Alex identity card, three metrics, orange sharing card, three menu rows, logout and fixed tab match the Web reading order. Native safe areas preserve the iOS status bar and home indicator; the footer remains reachable in the ScrollView. |
| Profile content | pass | Local Alex asset, `+86 138****8888`, verification, `14 / 4.9 / 100%`, `燕麦拿铁（¥28）` and weekly swap limit match the reference state. |
| Sharing Center order | pass | Open sharing, income/completed, signature drink, swap, themes, slots/meeting and preview retain Web order. Readiness, pending invitations and settlement are compact additions and do not replace the source sections. |
| Sharing Center entry | pass | A compact 62 × 44pt top-bar “编辑” action exposes the stable `sharing.edit-profile` identifier and opens Edit Profile from the normal Profile → Sharing Center path without shifting the main card order. |
| Current-user preview | pass | The preview renders Alex, shows an explicit “这是你的公开名片预览，访客操作已隐藏” notice and replaces visitor coffee/swap actions with a locked read-only bottom bar. It cannot route to a missing sharer. |
| Configuration sheets | pass | Native presentation uses iOS detents and safe areas while preserving each Web modal's title, copy, options, selected state and primary/cancel action hierarchy. Edit Profile uses a large detent so all inputs and CTA are visible. |
| Drink and swap completeness | pass | Eight drinks, exact prices/descriptions, selected oat latte, and swap limits 1/2/3/5 are visible and match the source. |
| Appearance | pass | Six distinct palettes and three preferences are present. The compact two-column palette overview is an intentional native adaptation; every palette changes the whole App immediately and persists. |
| PRD-only sheets | pass | Slots show five existing availability rows, add/remove/open controls and guidance. Meeting shows an HTTPS Tencent link, formatted meeting ID and visibility guidance. Neither is represented as a pixel-identical Web Modal. |
| Accessibility | pass | Task 7 selection controls, the sharing switch and weekly-limit buttons expose at least 44pt hit areas, stable identifiers, readable labels/values and selected traits. All six palettes use a computed `onAccent` with WCAG contrast ≥ 4.5:1; a source-contract test also requires every solid dynamic accent background to declare `onAccent` and rejects hard-coded white. |
| Persistence isolation | pass | Persistent UI snapshot and credential files are test-only. The `app.credential-mode` probe reports `ui-testing-file`; a cross-process test proves persistence and reset cleanup without touching live Keychain. |
| Determinism | pass | `-present profile|sharing-center|sharer-detail|edit-profile|themes|drink|topic-swap|appearance|slots|meeting-link` provides stable screenshots; `-appearance <theme>` selects a deterministic palette, status bar is fixed at 09:41 and UI tests reset only on first persistent launch. |

## Iteration history

1. RED tests defined Profile copy, persistent drink, persistent appearance, pending invitation routing, configuration persistence, readiness and rollback before implementation.
2. First Swift 6 build exposed an invalid ShapeStyle background and a nonisolated View helper. Both were fixed before UI execution.
3. First focused UI run passed 3/4. Signature drink changed immediately but disappeared after relaunch because repeated `RootView.init` calls deleted the test snapshot. A per-process MainActor reset coordinator fixed the persistence contract.
4. First visual comparison found two P1 issues: the country code was omitted from the masked phone and the Edit Profile CTA touched the medium-sheet boundary. Both were fixed and recaptured.
5. Final Profile, Sharing Center, seven focused sheets and six Web/Native comparisons were actually viewed. No text clipping, missing primary action, incorrect fixture, overlap, or unreadable selected state remains.
6. Reviewer Round 1 opened P1: 3 and P2: 3: missing normal edit path, actionable self-preview, incomplete readiness invariant, credential isolation, duplicate trimmed slots and Task 7 touch/contrast compliance. RED tests covered all six findings before fixes.
7. The first compact top-bar implementation was visible but its stable identifier was overwritten by the root `sharing-center.screen` accessibility modifier. The unfiltered run caught the issue; hierarchy diagnostics showed both top-bar buttons carrying the parent identifier. Removing the parent identifier and binding the edit semantics to its label produced a passing focused test and final unfiltered run.
8. Sharing Center, its Web/Native comparison and the current-user preview were recaptured at `393 × 852` / `786 × 852` and actually viewed after the Round 1 changes. The compact top-bar entry preserves the main layout; the read-only preview has clear status and no visitor actions. Round 1 final P0: 0, P1: 0, P2: 0.
9. Reviewer Round 2 opened P2: 1 for hard-coded white on dynamic accent fills. After removing transparent-accent and semantic success/red false positives, the RED source audit identified 12 real locations across Sharer Detail, Discover, Auth, Business Sheets, Chat Detail and Chats List.
10. All 12 locations now use `CoffeeLinkTheme.onAccent`. Disabled gray controls retain `primaryText`; success verification badges and the red pending count intentionally retain white. The source-contract test and Emerald interaction test both pass.
11. `task-7-round2-emerald-sharer-detail.png` and `task-7-round2-emerald-chats.png` were captured at `393 × 852` and actually viewed. Green CTA, selected segment, pay and accept controls use highly legible black text/icons; blue meeting actions and semantic status colors remain unchanged. No clipping or hierarchy regression remains. Round 2 final P0: 0, P1: 0, P2: 0.

## Runtime evidence

- AppStore Round 1 focused: 27 passed, 0 failed (`/private/tmp/coffeelink-task7-round1-store-green-2-20260815.xcresult`).
- Task 7 Round 1 focused UI: 5 passed, 0 failed (`/private/tmp/coffeelink-task7-round1-ui-green-20260815.xcresult`).
- Edit Profile normal-path post-diagnostic check: 1 passed, 0 failed (`/private/tmp/coffeelink-task7-round1-edit-profile-green-4-20260815.xcresult`).
- Task 6 focused regression: 9 passed, 0 failed (`/private/tmp/coffeelink-task7-round1-task6-focused-9-20260815.xcresult`).
- Unfiltered CoffeeLink scheme: 61 passed, 0 failed; 35 unit and 26 UI (`/private/tmp/coffeelink-task7-round1-unfiltered-green-61-20260815.xcresult`).
- Round 2 accent source contract: 1 passed, 0 failed (`/private/tmp/coffeelink-task7-round2-accent-green-20260815.xcresult`).
- Round 2 Emerald interaction UI: 1 passed, 0 failed (`/private/tmp/coffeelink-task7-round2-emerald-ui-green-3-20260815.xcresult`).
- Round 2 Task 6 focused regression: 9 passed, 0 failed (`/private/tmp/coffeelink-task7-round2-task6-focused-9-20260815.xcresult`).
- Round 2 unfiltered CoffeeLink scheme: 63 passed, 0 failed; 36 unit and 27 UI (`/private/tmp/coffeelink-task7-round2-unfiltered-63-20260815.xcresult`).
- Visual iPhone 15 Pro build: passed.
- iPhone 16 Pro build: passed (`/private/tmp/coffeelink-task7-round1-iphone16-build`).
- Round 2 iPhone 16 Pro build: passed (`/private/tmp/coffeelink-task7-round2-iphone16-build`).
- Static gates: `xcodegen`, target membership, `git diff --check`, Swift 6 compile and Unicode scan passed.
- Manual visual gate: P0: 0, P1: 0, P2: 0.

final result: passed
