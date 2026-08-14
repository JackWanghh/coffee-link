# Task 4 design QA

## Capture setup

- Device: `CoffeeLink Visual iPhone 15 Pro` (`BF3C45D6-6248-4D74-8B24-B381F584693D`), iOS 18.4.
- Reference and normalized captures: `393 × 852` pixels. Simulator output was `1179 × 2556` (3×) and was normalized with `sips -z 852 393` before comparison.
- Captures: `Captures/01-home.png`, `Captures/02-profile-detail.png`.
- Side-by-side (reference left, native right): `Comparisons/01-home-side-by-side.png`, `Comparisons/02-profile-detail-side-by-side.png`; each is `786 × 852`.
- State: reset deterministic demo data; Discover is at the initial feed position; detail is Elena Rodriguez with its default first topic selected.

## Fidelity review

| Area | Result | Notes |
| --- | --- | --- |
| 字体 | pass | Compact 17/13/11pt hierarchy keeps names, role, metadata, pills, and price visually distinct. Native system text rasterization differs slightly from Web. |
| 间距 | pass | 20pt side insets, 16pt cards, 12–16pt section rhythm, and fixed action bar match the reference composition after accounting for the native status-safe-area. |
| 颜色 | pass | Deep near-black canvas, raised dark cards, subtle borders, orange primary, blue swap, and green verification follow the reference. |
| 图片质量 | pass | Five exact prototype Unsplash images are bundled locally and validated with `sips`; circular crops are sharp and no network placeholder is used. |
| 文案 | pass | Person ordering, names, roles, company, drink, price, availability, tags, declaration, highlights, and action labels come from `DemoData` / Web prototype. |

## Initial findings and corrections

1. Initial Discover theme chips were compressed into a single, ellipsized row, making the card too short versus the reference. `SharerCard` now renders the first two theme chips as two compact rows.
2. Initial detail navigation retained the root custom tab bar, which covered the required fixed two-button action bar (P0). `RootView` now renders the tab bar only while the navigation path is empty; the detail capture shows both bottom actions unobstructed.
3. Remaining platform-only difference: iPhone status/Dynamic Island chrome introduces a top safe-area band absent from the Web reference. The application content follows the specified native safe-area behavior; this is P3 and not a page-layout defect.

## Round 1 comparison history

Independent review identified four P2 items. Each was corrected and then checked in the refreshed artifacts below.

1. **Discover top bar centering:** `CoffeeTopBar` now uses a full-width `ZStack` with equal 44pt leading/trailing slots and an 18pt title. The refreshed home side-by-side shows “发现” at the application geometry center while the overflow action remains at the right edge.
2. **Discover card height/density:** measured from normalized images after subtracting the 54px native status-safe-area, the first native card is now about 284px tall versus the 285px Web reference; the second-card start differs by about 2px. The adjustment came from the two theme-chip rows plus section-specific bio/footer rhythm and 16pt feed spacing, not a blank filler.
3. **Detail availability:** added the Web-prototype “近期可约时间” card between themes and reviews, with the `未来 7 天` badge, date selector, DemoData slot counts, and selected-day time pills. `Captures/02-profile-detail-availability-round1.png` is focused evidence: 10月24日 and 09:00 上午 / 10:30 上午 / 02:00 下午 are visible while the fixed bottom actions remain unobstructed.
4. **Discover filtering:** extracted `DiscoverFilter` and mirrored the Web fallback rules, including AI/大模型 and 咨询/创始人/highlight matching. Regression tests cover Elena’s strategic-consulting visibility and an AI-highlight fixture.

Refreshed artifacts checked with `view_image`:

- `Captures/01-home.png`, `Captures/02-profile-detail.png`, and `Captures/02-profile-detail-availability-round1.png`.
- `Comparisons/01-home-side-by-side.png` and `Comparisons/02-profile-detail-side-by-side.png` (reference left, native right; 786 × 852).

Round 1 final result: passed (P0: 0, P1: 0, P2: 0; P3: native status/Dynamic Island system chrome only).
