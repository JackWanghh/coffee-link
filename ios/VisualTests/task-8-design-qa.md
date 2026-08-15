# Task 8 可重复视觉回归 Design QA

## 验收范围

- 设备：`CoffeeLink Visual iPhone 15 Pro`（iOS 18.4，393 × 852 point viewport）。
- Web reference：01–08 原始审计图原样复制；09 结算、10 已排期详情、11 分享中心均从未修改的 React Web 原型真实运行态采集。
- Native capture：`simctl` 原始输出严格为 1179 × 2556，再规范化为 393 × 852；raw 文件只保留在 `/private/tmp`，不提交仓库。
- 自动附件：`VisualBaselineUITests` 11 个独立测试均等待对应 `visual.<screen>.ready` 根标识，随后使用 `XCUIScreen.main.screenshot()` 并设置 `keepAlways`。
- 比较器：两图严格同尺寸，统一解码为 8-bit sRGB RGBA；单像素最大 RGB 通道差不超过 12 视为相等。

## 正式矩阵

| 编号 | 状态 | Web→Native 诊断 ratio | Native→Native repeat ratio | 人工门禁 |
| --- | --- | ---: | ---: | --- |
| 01 | 发现 | 0.290389922231 | 0 | pass |
| 02 | 分享者详情 | 0.447347358110 | 0 | pass |
| 03 | 发起电子咖啡邀请 | 0.406339222784 | 0 | pass |
| 04 | 我的 | 0.306741210623 | 0 | pass |
| 05 | 登录 | 0.469895710139 | 0 | pass |
| 06 | 注册 | 0.421239054343 | 0 | pass |
| 07 | 找回密码 | 0.441580355756 | 0 | pass |
| 08 | 对谈管理 | 0.409027105807 | 0 | pass |
| 09 | 接受后付款结算 | 0.372074687310 | 0 | pass |
| 10 | 已排期对谈详情 | 0.423177316657 | 0 | pass |
| 11 | 分享中心 | 0.401178487379 | 0 | pass |

Web→Native ratio 只用于诊断，不作为跨平台像素一致阈值。React 与 SwiftUI 的系统字体栅格、SF Symbols、状态栏、Dynamic Island、底部 home indicator 与安全区必然产生大面积像素差；因此最终发布门禁由重要几何、内容与状态人工检查，加上 Native→Native 重复性共同决定。

## 人工逐图检查

- 01–08：逐张查看 reference、capture、side-by-side、overlay 与 difference；核心 fixture、文案、卡片顺序、选中态、CTA、截断语义均一致，没有异步远程头像。
- 09：将原先分散的订单头、饮品、参与者、时段和退款卡收敛为 Web 的“接受通知 → 对谈与饮品信息 → 费用明细 → 支付方式”结构；去除系统 chrome 偏移后，通知、摘要与费用卡的重要边界差异为约 0–2pt。
- 10：用“已确认排期”状态 pill 与四步 timeline 替换大圆形状态头；对手卡、议题卡和腾讯会议卡起点与高度在排除系统 chrome 后均控制在约 0–2pt。
- 11：恢复 Web 主顺序“开放分享 → 指标 → 签名饮品 → 主题互换 → 分享主题”；Task 7 的 readiness、待处理邀请与结算能力保留在主原型区块之后，不再挤压首屏。状态、指标与主区块几何在排除系统 chrome 后为约 0–2pt。
- 所有 11 页均无错误 fixture、缺失主 CTA、文案替换、不可解释截断、重叠、自动焦点键盘或异步头像漂移。

## 重复性门禁

- `viewDidAppear` 只发布 direct route 的 ready token，不执行导航或状态构造；路径仍由 `RootView.init` 直接初始化。
- 发现单独等待 ready token 仍可能截到 SpringBoard 启动 crossfade 后，没有放宽阈值或伪报通过；正式抓图会比较相邻 simctl 帧，直到 ratio ≤ 0.005 才落盘。
- 第一轮各页在 3–4 帧收敛，第二轮各页在 4 帧收敛；每页末两帧 ratio 都是 0。
- 两次独立启动后形成的正式 393 × 852 captures 再比较，01–11 的 Native→Native ratio 全部为 0。

## 允许的平台差异

- iOS 状态栏、Dynamic Island、底部 home indicator 与相应安全区占用。
- SwiftUI 系统字体与浏览器字体的字形度量、字重和抗锯齿细节。
- Lucide 图标映射到语义相同的 SF Symbols。
- iOS 原生触控区域与滚动视口导致底部固定操作条上方可见内容略少；内容本身仍可滚动到达。

以上差异不包括 frame 错位、文案不一致、fixture 错误、截断错误或异步头像；这些均按 P1/P2 修复，不能归类为平台差异。

## 最终计数

- P0: 0
- P1: 0
- P2: 0
- 验证阻塞: 1（iPhone 16 首轮仅“取消对谈后精确状态文案”失败；文案已统一，但复跑被平台 usage limit 拒绝）

final result: blocked
