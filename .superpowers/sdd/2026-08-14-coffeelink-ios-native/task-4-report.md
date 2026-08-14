# Task 4 report — Discover and Sharer Detail

## Delivered

- Added `DiscoverView`, `SharerCard`, and `SharerDetailView` and routed Discover cards to native sharer detail.
- Preserved the three Task 3 tabs while hiding the root tab bar during pushed detail routes.
- Elena's entire Discover card is accessible as `sharer.elena-rodriguez`.
- Added the TDD UI flow test for Discover → Elena detail with both fixed action buttons.
- Downloaded the five exact Unsplash avatar sources from `coffeelink/src/data/mockData.ts` into local asset catalog image sets: Elena, David, Mia, Leo, and Alex. `sips` verified every image is readable.
- Regenerated `ios/CoffeeLink.xcodeproj` with XcodeGen after adding source files.

## TDD record

- RED: `testDiscoverOpensElenaDetail` initially failed because the legacy Discover card did not expose `sharer.elena-rodriguez` and could not navigate to the detail view.
- GREEN: the focused UI test passes after routing the full card and rendering native detail actions.

## Visual QA

- Normalized captures: `ios/VisualTests/Captures/01-home.png`, `ios/VisualTests/Captures/02-profile-detail.png`.
- Compared them against the two Web visual truths in 786×852 side-by-side images under `ios/VisualTests/Comparisons/`.
- Corrected chips wrapping and detail tab-bar overlap. See `ios/VisualTests/task-4-design-qa.md` for the fidelity matrix and final result.

## Validation

- `xcodebuild test -quiet … -only-testing:CoffeeLinkUITests/CoreFlowsUITests/testDiscoverOpensElenaDetail` — pass.
- `xcodebuild test -quiet … -only-testing:CoffeeLinkUITests/CoreFlowsUITests/testThreeTabsAreReachable` — pass.
- Unfiltered `xcodebuild test -quiet … -scheme CoffeeLink` — pass.
- `xcodebuild test -quiet … -only-testing:CoffeeLinkTests` — pass.
- `xcodebuild build -quiet … -destination iPhone 16 Pro` — pass.
- `git diff --check` — pass.
- `rg -n '\\u[0-9a-fA-F]{4}' ios` — no matches.

## Round 1 remediation

- Fixed the Discover title to the Web-aligned centered 18pt top-bar geometry and retained the right overflow action.
- Re-measured and corrected first-card height to approximately 284px versus the 285px normalized Web card after native-safe-area normalization; the second-card start is within approximately 2px.
- Added complete DemoData-backed “近期可约时间” date and slot UI, plus a focused UI regression and focused visual capture.
- Added `DiscoverFilterTests` for the Web-equivalent strategic-consulting and AI/big-model fallbacks; the initial missing-filter RED and missing-availability UI RED were observed before implementation.
- Refreshed both required captures and comparisons. Final round-1 verification is recorded with the commit.

### Round 1 verification

- Focused Discover/detail and availability UI tests — pass.
- `DiscoverFilterTests` and Task 3 tab UI regression — pass.
- Unfiltered CoffeeLink scheme and full CoffeeLinkTests target — pass.
- iPhone 16 Pro build — pass.
