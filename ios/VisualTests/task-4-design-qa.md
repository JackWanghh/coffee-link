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

## Findings and corrections

1. Initial Discover theme chips were compressed into a single, ellipsized row, making the card too short versus the reference. `SharerCard` now renders the first two theme chips as two compact rows.
2. Initial detail navigation retained the root custom tab bar, which covered the required fixed two-button action bar (P0). `RootView` now renders the tab bar only while the navigation path is empty; the detail capture shows both bottom actions unobstructed.
3. Remaining platform-only difference: iPhone status/Dynamic Island chrome introduces a top safe-area band absent from the Web reference. The application content follows the specified native safe-area behavior; this is P3 and not a page-layout defect.

Final result: passed (P0: 0, P1: 0, P2: 0).
