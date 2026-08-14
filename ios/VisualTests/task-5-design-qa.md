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
4. **Round 1 review findings → repair:** authentication credentials were instance-only, direct visual states exposed populated fields, the backdrop was too transparent, and the initial invite capture hid the time-slot header behind the fixed bar. Introduced injectable Keychain-backed credential persistence (with isolated in-memory testing), reference-only masked/empty auth drafts, safe-area vertical centering, deeper backdrop with a restrained orange glow, and a reference invite state with the first slot selected.
5. **Round 1 visual evidence:** all captures were regenerated on CoffeeLink Visual iPhone 15 Pro and normalized to `393 × 852`; regenerated `Comparisons/*-side-by-side.png` files are `786 × 852`, Web left/native right, and were visually inspected. `03-invite` visibly retains “3. 选择期望时段（最多3个）” and “已选 1/3” above the orange fixed action. `05-login`, `06-register`, and `07-reset-password` show `+86 138****8888`, empty OTP/password controls, and checked registration terms; the full demo account remains limited to the login hint card.

## Round 1 fidelity review

| Area | Result | Evidence |
| --- | --- | --- |
| 尺寸与位置 | pass | Auth panel uses the complete safe-area height for vertical centering; native panels are compared beside the Web panels at the same normalized 393pt viewport. |
| 字段状态 | pass | Direct-launch presentation uses masked phone and genuine empty field values, while interactive auth continues using actual input state. |
| 遮罩与色彩 | pass | The Discover surface is only faintly visible behind a deeper charcoal overlay and low-strength orange glow. |
| 邀请首屏节奏 | pass | The first theme and one time slot are selected, the question remains empty, and the active-looking button still runs validation on tap. |
| 文案与图标 | pass | UTF-8 source copy and SF Symbols remain intact; no emoji/character art was added. |

Final result: passed (P0: 0, P1: 0, P2: 0).
