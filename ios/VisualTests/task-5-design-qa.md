# Task 5 design QA

## Capture setup

- Device: CoffeeLink Visual iPhone 15 Pro, iOS 18.4.
- All four native captures are normalized to `393 × 852`; reference and native comparisons are `786 × 852` with Web on the left.
- States: `-present-invite`, `-present-login`, `-present-register`, and `-present-reset` respectively.

## Fidelity review

| Area | Result | Notes |
| --- | --- | --- |
| 字体 | pass | 19pt panel titles, 13pt labels, 11–12pt metadata retain the source hierarchy. |
| 间距 | pass | Authentication uses a centered 361pt panel and 20pt inner padding; invitation retains 20pt page gutters and fixed submit bar. |
| 颜色 | pass | Deep backdrop, raised charcoal panel, orange primary action and subtle warm glow are present. |
| 图片质量 | pass | Sharer avatar is the local source image through the existing avatar component. |
| 文案 | pass | Login, registration, reset and invitation source labels, demo values, links and action copy are rendered as UTF-8 Chinese. |

## Iteration history

1. Initial invitation capture exposed literal interpolation text in the sharer, drink, price and action areas. Replaced those expressions with explicit Swift concatenation and recompiled before the final capture set.
2. The initial `TextEditor` could not gain XCUITest keyboard focus inside the nested invitation scroll layout. Replaced the question control with a multi-line native `TextField`, retaining 300-character enforcement and keyboard avoidance.
3. The authentication panel is a custom root overlay rather than a system sheet; this preserved the centered Web geometry and background glow.

Final result: passed (P0: 0, P1: 0, P2: 0).
