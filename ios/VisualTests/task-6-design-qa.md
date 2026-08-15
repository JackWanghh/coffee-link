# Task 6 Chats Design QA

## Capture setup

- Device: `CoffeeLink Visual iPhone 15 Pro` (`BF3C45D6-6248-4D74-8B24-B381F584693D`), iOS 18.4.
- Web reference: `coffeelink/audit/2026-08-14-ios/08-chats.png`, `393 × 852`.
- Native baseline: `ios/VisualTests/Captures/08-chats.png`, normalized from the 3× simulator output to `393 × 852`.
- Comparison: `ios/VisualTests/Comparisons/08-chats-side-by-side.png`, `786 × 852`, Web on the left and Native on the right.
- Focused captures: `task-6-accept.png`, `task-6-meeting.png`, `task-6-review.png`, and `task-6-complaint.png`; each is `393 × 852`.

## Fidelity review

| Area | Result | Evidence |
| --- | --- | --- |
| 构图 | pass | 系统安全区以下保持 56pt 居中标题、20pt 横向留白、双向分段、五个筛选 chips、列表与固定 Tab Bar 的原型顺序。 |
| 密度 | pass | 首屏稳定展示两张主要对谈卡；15pt 卡片内边距、13pt 卡间距、42pt 头像和两行问题截断符合 Task 6 brief。 |
| 色彩与层级 | pass | 深色 background/surface、橙色付款 CTA、绿色排期状态和蓝色腾讯会议入口与 Web 参考保持一致语义和对比层级。 |
| 内容与图片 | pass | Elena 与 Leo 使用项目内已下载的原型头像资产，首次启动也不会因网络加载时序退化为首字母。中文文案均为实际 UTF-8 字符。 |
| 业务弹层 | pass | 接受邀请显示问题、三个实时可用时段和确认动作；会议显示精确会议号与链接；评价和投诉展示完整输入结构及正确禁用态。 |

## Iteration history

1. 静态实现阶段依据 `08-chats.png` 建立 20pt 留白、16pt 圆角、状态 CTA、两行问题截断和固定 Tab Bar，运行时证据因 CoreSimulator 不可用暂时标记为 blocked。
2. Simulator 恢复后的首轮 `786 × 852` 并排检查确认 P0 为 0、P2 为 0，但首次启动时远程 Elena/Leo 头像尚未完成加载，记录为 P1。
3. `CoffeeAvatar` 对 Elena、David、Sophia、Leo 与 Alex 优先使用本地 Asset，再次构建和冷启动捕获。最终并排图头像稳定，P0/P1/P2 均清零。
4. 使用最终 binary 重新捕获接受、会议、评价和投诉四个 focused sheets，并逐张实际查看；未发现内容截断、按钮遮挡、错误 fixture 或层级问题。
5. Reviewer Round 1 修复局部错误状态、选择项 VoiceOver 语义和取消确认后，再次用最终 binary 复拍四个 focused sheets。关闭入口保持在安全区内且未遮挡标题、内容或 CTA；逐张查看后 P0/P1/P2 继续为 0。

## Runtime evidence

- Visual iPhone 15 Pro build: passed.
- CoffeeLink unit tests: 27 passed, 0 failed (`/private/tmp/coffeelink-task6-round1-unit-all.xcresult`).
- Task 6 focused UI tests: 9 passed, 0 failed (`/private/tmp/coffeelink-task6-round1-focused-9-green.xcresult`).
- Unfiltered CoffeeLink scheme: 44 passed, 0 failed; 27 unit and 17 UI (`/private/tmp/coffeelink-task6-round1-unfiltered.xcresult`).
- iPhone 16 Pro build: passed (`/private/tmp/coffeelink-task6-round1-iphone16-build`).
- Manual visual gate: P0: 0, P1: 0, P2: 0.

final result: passed
