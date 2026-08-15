# Task 6 Report: Chats, Details, and Business Sheets

## 实现内容

- 新增 `ChatsListView`：我发起的邀请（4）/发给我的邀请（2）、全部/待回应/待付款/已排期/已完成筛选、卡片、状态动作与路由。
- 新增 `ChatDetailView`：pending、incoming、accepted、booked、completed 和只读终态矩阵。
- 新增 `BusinessSheets`：接受（可用 slot 和互换问题）、婉拒（必选标准原因）、会议、评价、投诉。
- `AppStore` 动作现在验证状态和输入、返回成功结果，并在持久化失败时回滚，避免假成功。
- Checkout 只会在 Store 完成付款持久化后跳转详情。

## 静态审查 Round 1 修复

- P1：付款结果仅在 `completePayment` 持久化成功后设为成功并导航；失败展示 `lastErrorMessage`，且增加 `CheckoutPaymentResolution` 纯逻辑测试。
- P2：`AvailableSlot` 增加 availability，`UserProfile` 增加稳定的 incoming slot 集合，`ChatSession` 记录 `confirmedSlotID`。接受邀请按接收方实时可用 slot ID 校验、在同一持久化快照中占用 slot；单元测试覆盖无效 ID、过期 slot 与重复领取。
- P2：补充待运行 UI 覆盖：两向五筛选、立即支付成功/失败、会议 fixture、婉拒、主题互换问题校验/成功。
- P3：对谈列表改为非 Button 卡片容器；详情点击区和各状态 CTA 为独立 Button，避免嵌套 Button。

## 静态审查 Round 2 修复

- P1：`AvailableSlot` 对旧 JSON 缺失 `isAvailable` 时默认可用；`UserProfile` 对旧 JSON 缺失 `availableSlots` 时解码为空，不会导致整份快照失败。
- 加载时 `AppStore` 只规范化当前用户的空 slot 集合，确定性回填 `DemoData.incomingAvailableSlots`；历史 profile、sessions 和 sharers 保持原值，不回落整份 `.demo`。
- 新迁移单测移除 Task 6 新字段后重新解码，断言保留既有姓名、已预约会议号和 sharers，并获得可用 incoming slots；持久化失败接受测试补充 slot 与 `confirmedSlotID` 回滚断言。

## 运行时修复

- 修复 Checkout 页面级 `checkout.screen` 覆盖子按钮标识的问题：页面显式保留子 accessibility elements，`payment.confirm` 与 `payment.back` 可由 XCUITest 稳定定位。
- 付款成功后不再在测试与辅助功能尚未感知成功态时自动跳转；页面保留“支付成功”结果，并提供 `payment.view-session`“查看对谈详情”动作，由用户确认后进入已排期详情。
- 增加 `-present chats|accept|meeting|review|complaint` 确定性直达状态，用于专用视觉模拟器复拍列表与业务弹层。
- 首轮并排检查发现远程头像首次启动可能显示首字母。`CoffeeAvatar` 对 Elena、David、Sophia、Leo 和 Alex 优先读取已有本地 Asset，消除网络时序造成的视觉不确定性。

## Reviewer Round 1 修复

- P2：`UserProfile` 解码时记录 `availableSlots` 字段是否真实存在。只有旧快照缺少字段时才回填演示时段；显式保存的空数组在重建 `AppStore` 后继续为空，避免把用户主动清空误判为旧数据。
- P2：接受、婉拒、评价与投诉弹层改用各自的局部错误状态；主题互换的输入校验不再污染全局 `lastErrorMessage`。回归路径覆盖接受弹层触发错误后依次打开婉拒和投诉，旧错误均不会泄漏。
- P2：时段、婉拒原因、评分星级、评价标签与投诉类别补充稳定 identifier、可读 `accessibilityLabel`、已选/未选 `accessibilityValue` 和 `.isSelected` trait，UI 测试按辅助功能契约断言。
- P3：已排期对谈的取消操作增加二次确认，只有点击破坏性动作“确认取消对谈”后才改变会话状态。
- P3：`submitComplaint` 独立校验投诉类别和问题说明，分别返回明确错误，不再依赖拼接字符串判断。
- 接受、婉拒、评价与投诉弹层增加明确关闭入口，使用户可稳定退出且不会改变业务状态；最终截图确认入口不遮挡标题、内容或 CTA。

## TDD 证据

- 先新增 `CoreFlowsUITests.testChatsDirectionsFiltersAndIncomingAcceptance`，覆盖两向、五筛选和 exact incoming accept UI 路径。
- 先新增 AppStore RED 用例：无效 slot、缺失互换问题、持久化失败回滚、decline/cancel/review/complaint 状态矩阵。
- runtime 恢复后的首轮 focused UI 复现两个失败：`payment.confirm` 与 `payment.back` 均被父级 `checkout.screen` 覆盖。修复父子 accessibility 层级后返回路径先转绿，付款成功路径进一步暴露自动跳转让成功态无法感知的问题。
- 改为用户确认成功态后进入详情，再运行两项支付 focused UI：2 passed，0 failed（`/private/tmp/coffeelink-task6-ui-fix3.xcresult`）。
- 最终 Task 6 六项 focused UI：6 passed，0 failed（`/private/tmp/coffeelink-task6-ui-final.xcresult`）。
- 最终 CoffeeLink 单元测试：25 passed，0 failed（`/private/tmp/coffeelink-task6-unit-final.xcresult`）。
- 最终 unfiltered CoffeeLink scheme：39 passed，0 failed，Unit/UI 两个 test bundle 均为 Passed（`/private/tmp/coffeelink-task6-unfiltered-final.xcresult`）。
- iPhone 16 Pro 独立 build 通过（derived data：`/private/tmp/coffeelink-task6-iphone16-final`）。
- Reviewer Round 1 新增三项 UI 回归：VoiceOver 选择语义、跨弹层错误隔离、取消二次确认，3 passed，0 failed（`/private/tmp/coffeelink-task6-round1-new-ui-green.xcresult`）。
- Reviewer Round 1 九项联合 focused UI：9 passed，0 failed（`/private/tmp/coffeelink-task6-round1-focused-9-green.xcresult`）。
- Reviewer Round 1 全量单元测试：27 passed，0 failed（`/private/tmp/coffeelink-task6-round1-unit-all.xcresult`）。
- Reviewer Round 1 unfiltered CoffeeLink scheme：44 passed，0 failed，其中 27 unit、17 UI（`/private/tmp/coffeelink-task6-round1-unfiltered.xcresult`）。
- Reviewer Round 1 iPhone 16 Pro 独立 build 通过（derived data：`/private/tmp/coffeelink-task6-round1-iphone16-build`）。

## 静态检查

- 已重新运行 `xcodegen generate`；`CoffeeLink.xcodeproj/project.pbxproj` 的 CoffeeLink Sources 已包含 `ChatsListView.swift`、`ChatDetailView.swift` 和 `BusinessSheets.swift`。
- `xcrun swiftc -parse` 覆盖本任务 Swift 改动，退出码 0。
- `git diff --check` 退出码 0。
- `rg '\\u[0-9A-Fa-f]{4}' CoffeeLink CoffeeLinkTests CoffeeLinkUITests` 无匹配。

## 视觉验收

- Visual iPhone 15 Pro build 通过；`08-chats.png` 与四个 focused sheet captures 均由最终 binary 生成并归一化为 `393 × 852`。
- `ios/VisualTests/Comparisons/08-chats-side-by-side.png` 为 `786 × 852`（Web 左、Native 右），已实际查看。
- 首轮 P1 远程头像不确定性已通过本地 Asset 修复并复拍；最终 P0: 0、P1: 0、P2: 0。
- Reviewer Round 1 后再次用最终 binary 复拍接受、会议、评价和投诉四个 focused sheets，并逐张实际查看；关闭入口和新增交互语义没有造成视觉回归，P0: 0、P1: 0、P2: 0。
- `ios/VisualTests/task-6-design-qa.md` 末行已标记 `final result: passed`。

## 待主 Agent 集成

- Task 6 改动保持未提交，由主 Agent 按授权执行最终全量集成验证、Git 暂存与 commit。
