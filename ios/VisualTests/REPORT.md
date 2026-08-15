# CoffeeLink iOS 验收报告（Task 9）

验收日期：2026-08-15
分支：`feature/coffeelink-ios-native`（远程 GitHub：`JackWanghh/coffee-link`）
验证提交：`41f99e0 ios build task8`（Task 1–7 提交见 `git log`）

## 1. 构建结果

| 模拟器 | 命令 | 结果 |
| --- | --- | --- |
| iPhone 16 Pro / iOS 18.4 | `xcodebuild clean build` | **BUILD SUCCEEDED** |
| CoffeeLink Visual iPhone 15 Pro / iOS 18.4 | `xcodebuild clean build` | **BUILD SUCCEEDED** |

## 2. 完整自动化套件

| 设备 | 单元测试 | UI 测试（含视觉基线） | 总计 | 结果 | 耗时 |
| --- | --- | --- | --- | --- | --- |
| iPhone 16 Pro / iOS 18.4 | 36 passed | 38 passed | **74 passed / 0 failed / 0 skipped** | **TEST SUCCEEDED** | 约 352s |
| CoffeeLink Visual iPhone 15 Pro / iOS 18.4 | 36 passed | 38 passed | **74 passed / 0 failed / 0 skipped** | **TEST SUCCEEDED** | 约 326s |

结果包：
- `/private/tmp/coffeelink-t9-iphone16-full.xcresult`
- `/private/tmp/coffeelink-t9-visual-full.xcresult`

此前 Task 8 唯一待复跑用例 `testBookedSessionCancellationRequiresConfirmation` 已在两台设备上通过。

## 3. 视觉基线矩阵（重跑）

参考图来源：01–08 为 Web 审计目录原样复制；09–11 为未修改的 React 原型真实运行态采集。所有原生截图在专用模拟器上规范化到 393 × 852。差异率由 `compare.swift`（RGB 通道差 ≤ 12/255 视为相等）计算，本轮已全部重跑并与已提交指标逐字节一致。

| 编号 | 状态 | Web→Native 诊断 ratio | 人工门禁 |
| --- | --- | --- | --- |
| 01 | 发现 | 0.290389922231 | pass |
| 02 | 分享者详情 | 0.447347358110 | pass |
| 03 | 发起电子咖啡邀请 | 0.406339222784 | pass |
| 04 | 我的 | 0.306741210623 | pass |
| 05 | 登录 | 0.469895710139 | pass |
| 06 | 注册 | 0.421239054343 | pass |
| 07 | 找回密码 | 0.441580355756 | pass |
| 08 | 对谈管理 | 0.409027105807 | pass |
| 09 | 接受后付款结算 | 0.372074687310 | pass |
| 10 | 已排期对谈详情 | 0.423177316657 | pass |
| 11 | 分享中心 | 0.401178487379 | pass |

判定说明：Web→Native ratio 是跨平台诊断值，不是通过阈值；最终门禁为排除系统 chrome 后重要几何约 0–2pt 的人工检查 + Native→Native 重复性 ratio = 0（详见 `task-8-design-qa.md`）。本轮 11 组 Web→Native 指标全部复现一致，比较器自测 5/5 通过。

## 4. 人工验收矩阵

以下 8 条流程已在 iPhone 16 Pro 模拟器上通过 UI 自动化端到端走通（XCUITest 驱动真实界面），并辅以前几轮的逐图人工检查：

| # | 流程 | 覆盖测试 |
| --- | --- | --- |
| 1 | 发现 → Elena → 电子咖啡邀请 → 登录 → 提交 | `testDiscoverOpensElenaDetail`、`testLoggedOutCoffeeInvitationResumesAfterLogin` |
| 2 | 收到的邀请 → 接受 → 等待付款 | `testChatsDirectionsFiltersAndIncomingAcceptance`、`testIncomingInvitationCanBeDeclinedWithAStandardReason` |
| 3 | 已接受邀请 → 微信支付 → 已预约 → 腾讯会议 | `testImmediatePaymentSucceedsAndBookedMeetingUsesFixtureCredentials` |
| 4 | 主题互换 → 补充问题 → 已排期 | `testTopicSwapRequiresQuestionBeforeAcceptanceAndThenSchedules` |
| 5 | 已完成对谈 → 评价与投诉路径 | `testBusinessSheetChoicesExposeReadableSelectedVoiceOverState`、`testTopicSwapValidationErrorDoesNotLeakIntoOtherBusinessSheets` + AppStore 状态矩阵测试 |
| 6 | 我的 → 分享中心 → 资料/主题/饮品/时段/会议/互换设置 | `testProfileMatchesCoreProductContent`、`testSharingCenterOpensEditPublicProfileFromNormalPath`、`testOpenSharingCannotSaveAllSlotsClosedAndRemainsConsistent`、`testPendingInvitationsShortcutOpensIncomingPendingFilter` |
| 7 | 登录 → 注册 → 登录；登录 → 找回密码 → 登录 | `testAuthenticationLaunchModes`、`testInteractiveRegistrationAndResetReturnToLogin` |
| 8 | 终止并重启后用户修改保留 | `testSignatureDrinkChangePersistsAcrossRelaunch`、`testAppearanceActuallyChangesAndPersistsAcrossRelaunch`、`testPersistentUICredentialsAreIsolatedAndSurviveOneRelaunch` |

## 5. 已知平台差异

- iOS 状态栏 / Dynamic Island / Home Indicator 与相应安全区占用（Web 参考无系统 chrome）。
- SwiftUI 系统字体与浏览器字体的字形度量、字重与抗锯齿细节。
- Lucide 图标映射为语义相同的 SF Symbols。

上述差异不包含 frame 错位、文案不一致、fixture 错误、截断或异步头像；此类问题按 P1/P2 修复，不归类为平台差异。

## 6. 范围边界

当前为本地 Mock 技术原型：不连接真实后端、短信、支付或腾讯会议服务；演示凭据保存在 Keychain，业务快照保存在本地 JSON。操作说明见 `ios/README.md`。

## 7. 静态检查

- `git diff --check`：通过。
- `rg -n '\\u[0-9A-Fa-f]{4}' ios/CoffeeLink ios/CoffeeLinkTests ios/CoffeeLinkUITests`：无匹配。
- `rg -n 'TODO|FIXME' ios`：无匹配。
- `xcodegen generate`：成功，工程与源码一致。

## 结论

**通过。** 双模拟器干净构建成功，完整自动化套件 74/74 全绿，11 个视觉基线重跑且指标可复现，8 条验收流程全部走通，交付文档就绪。
