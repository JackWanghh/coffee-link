# Task 7 Report: Profile, Sharing Center, and Configuration Sheets

## 实现内容

- `ProfileView` 完整实现“我的”页面：根级 Top Bar 只保留一份，使用齿轮入口；展示 Alex 本地头像、实名状态、掩码手机号、对谈总数、评分、按时率、橙色描边分享中心、签名饮品、主题互换、三行菜单、退出入口、平台页脚和固定 Tab Bar。
- `SharingCenterView` 保持 Web 原型主顺序：开放分享、累计收入与完成次数、签名饮品、主题互换、分享主题、时段/腾讯会议、公开名片预览。在不改变主构图的前提下补充开放 readiness、待处理邀请入口与结算摘要。
- 新增 7 类真实配置 Sheet：编辑公开资料、管理分享主题、选择签名饮品、主题互换、系统与外观、可预约时段、腾讯会议链接；Task 6 的 5 类业务 Sheet 保持原实现。
- 饮品目录完整包含 8 项；主题严格限制最多 3 项；互换周限只允许 1/2/3/5；外观提供 6 套 palette，选择后立即改变全 App 色彩并持久化；时段和会议链接按 PRD 补齐。
- 公开名片预览从当前 `UserProfile` 生成 Alex 的 `Sharer`，不再复用 Elena fixture；待处理邀请入口直接进入“发给我的邀请 + 待回应”。
- Sharing Center 正常路径在顶栏提供 62 × 44pt 的“编辑公开资料”入口；当前用户公开名片预览显示明确的只读提示，并以锁定态底栏替代“请喝咖啡 / 主题互换”访客操作。
- `CoffeeLinkTheme` 增加 6 套动态 palette；现有 Feature 无需批量重写即可跟随用户外观偏好变化。
- 所有动态 accent 实底控件统一使用 `CoffeeLinkTheme.onAccent`；覆盖发现筛选、认证图标、分享者 CTA/评价头像、对谈方向/支付/接受/会议/评价及评价标签。success 核验徽标、red badge 与 disabled 灰底维持各自独立语义色。

## 模型、持久化和事务语义

- `UserProfile` 新增外观、日历、入会、触觉、待结算和已结算字段；自定义 `Codable` 全部使用 `decodeIfPresent` 默认值，兼容旧快照。
- 保留 Task 6 的 legacy slot 迁移语义：缺失 `availableSlots` 才迁移，显式空数组继续为空。
- `AppStore` 新增资料、主题、饮品、互换、时段、会议、外观和开放分享的 Bool 配置 API；所有写入先保留 snapshot，保存失败时原子回滚。
- 修复既有 `updateProfile` 保存失败仍保留内存修改的问题；现在失败返回 `false`、恢复完整快照并展示错误。
- 开启分享严格校验实名认证、公开资料、1~3 个完整主题、签名饮品、至少一个开放时段和 `meeting.tencent.com` HTTPS 链接。
- readiness 不只约束“开启分享”：分享已开启时，任何会令资料、主题、饮品、有效时段或会议链接失效的配置 mutation 都会被原子拒绝并回滚；历史快照若以无效配置标记开放，会在载入规范化时安全暂停。
- 可预约时段先 trim 标签，再校验标签唯一；空白、重复时间或重复 ID 均拒绝并保持原 snapshot。
- 增加独立的 `CoffeeLinkUITests/state.json` 持久化。首次 persistent UI 测试 reset 后，终止 App 再启动仍读取同一快照；普通 UI 测试继续使用隔离的 in-memory 数据。
- persistent UI 首轮发现 `RootView.init` 可能在同一进程重建并重复删除快照；增加 MainActor 一次性 reset coordinator 后，重启持久化测试稳定通过。
- persistent UI 凭据使用 `CoffeeLinkUITests/credential.txt` 专用文件存储，并提供 reset；普通运行才访问 live Keychain，自动化测试不会读写真实用户凭据。

## TDD 证据

- RED：先新增 `AppStoreTests`，编译失败于缺失 Bool 配置接口、外观/结算字段和回滚语义（`/private/tmp/coffeelink-task7-red-20260815.xcresult`）。
- A 阶段 GREEN：AppStore focused 23 passed、0 failed（`/private/tmp/coffeelink-task7-a-green-check.xcresult`）。
- 首轮 Task 7 UI：Profile、外观持久化、待处理入口通过；签名饮品跨重启失败并暴露重复 reset 根因。修复后单项通过（`/private/tmp/coffeelink-task7-signature-green-2-20260815.xcresult`）。
- 最终 Task 7 focused UI：4 passed、0 failed（`/private/tmp/coffeelink-task7-ui-green-20260815.xcresult`）。
- Task 6 focused 回归：9 passed、0 failed（`/private/tmp/coffeelink-task7-task6-focused-9-20260815.xcresult`）。
- 最终 unfiltered CoffeeLink scheme：52 passed、0 failed，其中 31 unit、21 UI（`/private/tmp/coffeelink-task7-unfiltered-52-20260815.xcresult`）。
- iPhone 16 Pro 独立 build 通过（derived data：`/private/tmp/coffeelink-task7-iphone16-build`）。

### Reviewer Round 1

- RED：先补充 readiness invariant、trim 后时段唯一、六套 palette 对比度、测试凭据隔离、编辑入口、只读预览、开放时段回滚、44pt/VoiceOver 与跨进程凭据测试；编译按预期失败于缺失 `accentContrastRatio`、`CredentialPersistence.uiTesting` 与配置约束（`/private/tmp/coffeelink-task7-round1-red-20260815.xcresult`）。
- AppStore focused：27 passed、0 failed（`/private/tmp/coffeelink-task7-round1-store-green-2-20260815.xcresult`）。
- Task 7 Round 1 focused UI：5 passed、0 failed（`/private/tmp/coffeelink-task7-round1-ui-green-20260815.xcresult`）。
- Task 6 focused 回归：9 passed、0 failed（`/private/tmp/coffeelink-task7-round1-task6-focused-9-20260815.xcresult`）。
- 首次 unfiltered 暴露 SwiftUI 父容器 accessibility identifier 覆盖顶栏入口 identifier。删除污染标识并把语义绑定到按钮 label 后，入口单项 1 passed、0 failed（`/private/tmp/coffeelink-task7-round1-edit-profile-green-4-20260815.xcresult`）。
- 最终 unfiltered CoffeeLink scheme：61 passed、0 failed，其中 35 unit、26 UI（`/private/tmp/coffeelink-task7-round1-unfiltered-green-61-20260815.xcresult`）。
- 最终 iPhone 16 Pro 独立 build 通过（derived data：`/private/tmp/coffeelink-task7-round1-iphone16-build`）。

### Reviewer Round 2

- RED：新增源码契约测试，枚举 App 全部 Swift 文件，定位 accent 实底 background，要求同一控件显式声明 `CoffeeLinkTheme.onAccent` 且不得硬编码 white。消除透明 accent 与非accent误报后，精确命中 12 处（`/private/tmp/coffeelink-task7-round2-accent-red-clean-20260815.xcresult`）。
- GREEN：12 处全部改为动态 `onAccent`；源码契约测试 1 passed、0 failed（`/private/tmp/coffeelink-task7-round2-accent-green-20260815.xcresult`）。
- Emerald 相关 UI：分享者咖啡 CTA、对谈支付及接受动作均存在且可点击，1 passed、0 failed（`/private/tmp/coffeelink-task7-round2-emerald-ui-green-3-20260815.xcresult`）。
- Task 6 focused 回归：9 passed、0 failed（`/private/tmp/coffeelink-task7-round2-task6-focused-9-20260815.xcresult`）。
- 最终 unfiltered CoffeeLink scheme：63 passed、0 failed，其中 36 unit、27 UI（`/private/tmp/coffeelink-task7-round2-unfiltered-63-20260815.xcresult`）。
- 最终 iPhone 16 Pro 独立 build 通过（derived data：`/private/tmp/coffeelink-task7-round2-iphone16-build`）。

## 测试覆盖

- Profile 核心文案、实名信息、掩码手机号、统计、签名饮品、互换与菜单。
- 澳白咖啡保存后终止并重启，Profile 仍显示 `澳白咖啡（¥26）`。
- 资料、主题、时段、会议链接和互换设置跨 `AppStore` 重建持久化。
- readiness 不满足时拒绝开放分享；保存失败时 Profile、外观和分享开关均原子回滚。
- 分享已开放时，清空资料/主题/饮品、关闭全部时段或写入无效会议链接均失败且状态保持一致；UI 覆盖“全部关闭时段不能保存”。
- 时段 trim 后标签唯一，重复时间被拒绝并完整回滚。
- 6 套外观 palette 实际改变 `app.theme`，并跨 App 重启保持。
- 六套 palette 的 `onAccent` 对比度均不低于 WCAG AA 4.5:1；分享开关与互换周限等 Task 7 选控触控区域均不小于 44pt。
- 源码契约扫描保证新增 accent 实底 background 不能绕过 `onAccent`；该覆盖不是只验证颜色计算器。
- persistent UI 专用凭据跨一次进程重启保留，并在测试结束 reset；探针证明使用 `ui-testing-file`，不触碰 live Keychain。
- 待处理邀请入口进入 incoming + pending 初始筛选。
- 新增控件具备稳定 accessibility identifier、可读 label/value 和选中 trait；主要点击区域不小于 44pt。

## 视觉验收

- 最终 Profile：`ios/VisualTests/Captures/04-mine.png`，与 Web `04-mine.png` 的 Web 左 / Native 右对照为 `ios/VisualTests/Comparisons/04-mine-side-by-side.png`。
- Sharing Center：`ios/VisualTests/Captures/task-7-sharing-center.png`，对照为 `ios/VisualTests/Comparisons/task-7-sharing-center-side-by-side.png`。
- 当前用户公开名片只读预览：`ios/VisualTests/Captures/task-7-profile-preview.png`；该状态没有同构 Web reference，按原生产品约束独立验收。
- Emerald 动态主题代表态：`ios/VisualTests/Captures/task-7-round2-emerald-sharer-detail.png` 与 `ios/VisualTests/Captures/task-7-round2-emerald-chats.png`，均为 `393 × 852`。绿色实底 CTA、segment 和支付动作使用高对比黑色文字/图标；蓝色会议动作与 success/red 状态保持独立语义色。
- 7 类配置 Sheet 均有 `393 × 852` focused capture；编辑资料、饮品、主题、互换和外观有同构 Web reference 及 `786 × 852` side-by-side。
- Web 的 `onEditProfile` 当前未从 Sharing Center 的 Top Bar 接线；参考图使用 `/private/tmp` 中只读 story 将原始 `EditProfileModal` 初始打开，未修改 Web 真源。
- 时段与会议为 PRD 补全，没有同构 Web Modal reference；两者仅提供清晰 Native focused capture，并在 Design QA 中明确标注。
- 首轮 P1：手机号缺少 `+86`、编辑资料 medium Sheet 的 CTA 贴底。分别恢复 Web 文案并改为 large detent 后复拍。
- Reviewer Round 1 初始为 P1: 3、P2: 3；全部修复后重拍 Sharing Center、只读预览及对照图并实际查看，最终 P0: 0、P1: 0、P2: 0。
- Reviewer Round 2 初始为 P2: 1；系统扫描实际修复 12 处后复拍并查看 Emerald 分享者详情与对谈列表，最终 P0: 0、P1: 0、P2: 0。

## 静态检查

- 已从 `ios/` 运行 `xcodegen generate`；`ConfigurationSheets.swift`、`ProfileView.swift` 和 `SharingCenterView.swift` 均进入 CoffeeLink Sources。
- Swift 6 generic simulator build 和 Visual iPhone 15 Pro build 均通过。
- `git diff --check` 退出码 0。
- `rg -n '\\u[0-9A-Fa-f]{4}' ios/CoffeeLink ios/CoffeeLinkTests ios/CoffeeLinkUITests` 无匹配（退出码 1 为预期）。

## 修改文件

- App / route / state：`AppRoute.swift`、`AppStore.swift`、`RootView.swift`。
- 模型：`CoffeeModels.swift`。
- Design System：`CoffeeLinkTheme.swift`、`CoffeeLinkComponents.swift`。
- 凭据 / 持久化：`CredentialPersistence.swift`、`LocalPersistence.swift`。
- Feature：`ProfileView.swift`、`SharingCenterView.swift`、`SharerDetailView.swift`、`ConfigurationSheets.swift`、`BusinessSheets.swift`、`AuthFlowView.swift`、`DiscoverView.swift`、`ChatsListView.swift`、`ChatDetailView.swift`。
- 测试：`AppStoreTests.swift`、`CoreFlowsUITests.swift`。
- 工程与证据：`CoffeeLink.xcodeproj/project.pbxproj`、Task 7 captures/references/comparisons、`task-7-design-qa.md`。

## 待主 Agent 集成

- 本任务没有提交 commit；请主 Agent 复核共享 worktree 状态后统一暂存和提交。
- 当前实现仍是 PRD 约定的本地 Mock 技术原型；真实腾讯会议、支付、结算和服务端同步不属于 Task 7。
