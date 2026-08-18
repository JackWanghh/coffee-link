# CoffeeLink 项目进度账本（progress.md）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 文档定位：项目级执行状态总账——各端做到哪一步、验证过什么、下一步是什么。只记里程碑级条目，细节指向证据文件，不复制正文。
> 文档分工：PRD §16 = 计划路线；`.superpowers/sdd/` = iOS 单端逐任务执行细节；本文 = 项目级执行历史与状态。

## 1. 当前状态总览

| 端 | 状态 | 最新验证 | 日期 |
| --- | --- | --- | --- |
| Web 原型（coffeelink） | 已完成，作为视觉与交互基准 | iOS 适配审计（11 屏参考图） | 2026-08-14 |
| iOS 原生（ios） | 已完成 9 任务验收 | 74/74 测试（36 单元 + 38 UI，含 11 视觉基线）、双模拟器 clean build | 2026-08-15 |
| 后端（NestJS） | 未启动（已有角色定义与 PRD §14 架构规划） | — | — |
| 运营后台 | 未启动（PRD §10 / §14.2 三模块规划） | — | — |

## 2. 里程碑历史

### M0：Web 原型完成 + iOS 适配审计（已完成）

- 日期：2026-08-14
- 范围：coffeelink 全部核心页面与弹层；393 × 852 视口下的 iOS 适配审计
- 证据：[coffeelink/audit/2026-08-14-ios/README.md](../coffeelink/audit/2026-08-14-ios/README.md)、[PRD.md](../PRD.md) §13.1

### M1：iOS 原生高保真实现（已完成）

- 日期：2026-08-14 ~ 2026-08-15
- 范围：[docs/superpowers/plans/2026-08-14-coffeelink-ios-native.md](../docs/superpowers/plans/2026-08-14-coffeelink-ios-native.md) 的 9 个任务；分支 `feature/coffeelink-ios-native`
- 验证结果：74/74 测试通过（iPhone 16 Pro 与 Visual iPhone 15 Pro 双模拟器）；11 屏视觉基线收敛（Web→Native ratio 为诊断值，人工门禁排除系统 chrome 后约 0–2pt，Native→Native ratio = 0）；静态检查通过（`git diff --check`、无 `\uXXXX`、无 TODO/FIXME）
- 证据：[ios/VisualTests/REPORT.md](../ios/VisualTests/REPORT.md)（Task 9 验收）、[ios/README.md](../ios/README.md)、[.superpowers/sdd/2026-08-14-coffeelink-ios-native/](../.superpowers/sdd/2026-08-14-coffeelink-ios-native/)（SDD 账本 + task 3–7 报告）、[ios/VisualTests/task-8-design-qa.md](../ios/VisualTests/task-8-design-qa.md)
- Commit 范围：`49d4fd3..ad6cb77`（分支 `feature/coffeelink-ios-native`，远程已同步）
- 说明：SDD 账本的逐任务明细记录到 Task 7；Task 8/9 收口以验收报告与 task-8-design-qa 为准

### M2：memory-bank 文档前置（已完成）

- 日期：2026-08-16
- 范围：建立 memory-bank/（design-document.md 索引式、progress.md、architecture.md、tech-stack.md）；PRD §15 降级为摘要并指向 tech-stack.md
- 结果：后端库级默认按确认清单定稿（日志/测试/OpenAPI/CI/定时/认证/Redis/限流/数据库版本）；运营后台前端栈标记待定
- 证据：[tech-stack.md](../memory-bank/tech-stack.md)、[design-document.md](../memory-bank/design-document.md)、[architecture.md](../memory-bank/architecture.md)

### M3：后端规划完成（已完成）

- 日期：2026-08-16
- 范围：基于 iOS 全部页面与 AppStore 状态机，产出后端契约（OpenAPI 接口、Prisma 数据模型、状态机、错误码/幂等/分页规范、定时任务、可观测性）与 12 步后端实施计划；可观测性待定项定稿
- 证据：[backend-contract](../docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md)、[backend-plan](../docs/superpowers/plans/2026-08-16-coffeelink-backend.md)

### M4：后端 Step 1 脚手架（已完成）

- 日期：2026-08-16
- 范围：创建 `backend/` NestJS 工程（Node 24 LTS 为目标，TS strict）；默认 `GET /` 保留
- 验证：`npm run build` 通过；`git diff --check` 通过；`GET /` 返回 HTTP 200 "Hello World!"
- 流程例外记录：子 Agent 消息通道在本会话失效（任务文本投递为空，探针触发递归 spawn 已中断），经用户批准由主 Agent 直接执行 Step 1；后续步骤待通道恢复后回归 Backend 子 Agent 流程，或继续主 Agent 直执行并逐条记录例外
- 证据：[backend/](../backend/)、[backend/README.md](../backend/README.md)

### M5：后端 12 步实施完成（已完成）

- 日期：2026-08-16
- 范围：按 [backend-plan](../docs/superpowers/plans/2026-08-16-coffeelink-backend.md) 完成 Step 1–12：脚手架、Docker Compose（PG16 + Redis7）、Prisma 14 表迁移与种子、基础设施（config/pino/异常过滤器/健康/指标）、Auth、Me、Catalog、邀请与会话状态机（含 12h/2h/自动完成定时任务）、Payments（Mock + 幂等回调 + 退款）、Reviews/Complaints、Settlements、Notifications、Swagger 契约与全量回归
- 验证：`npm run build` 通过；`npm test` 1/1；`npm run test:e2e` 2/2（核心全流程 + 互换配额）；`prisma migrate status` 一致；`git diff --check` 通过；冒烟 `/health`、`/docs-json`、`/metrics` 均 200
- 流程例外：延续 M4 记录，全部由主 Agent 直执行（子 Agent 消息通道失效）
- 证据：[backend/](../backend/)、[backend/README.md](../backend/README.md)、[backend-contract](../docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md)

### M6：演示数据同步与契约补齐（已完成）

- 日期：2026-08-16
- 范围：种子对齐 iOS DemoData（8 款饮品、Alex + 4 位分享者 + 发送方/评价人共 12 用户、8 主题、19 时段、6 条演示会话、6 条评价）；契约补齐：`POST /me/verification` 实名 Mock 接口、分享者 DTO 增加 industry / remainingSwapQuota / availableDays / reviews、会话 DTO 增加 statusLabel / meetingType / coffeeDrink 快照 / 平铺双方字段、发现接口支持 industry 筛选
- 验证：`npm run build`、`npm test`（1/1）、`npm run test:e2e`（2/2）通过；演示数据接口实测（分享者行业/额度/按天时段/评价、会话状态标签/饮品快照、实名 Mock 均生效）
- 已知偏差（已文档化）：统计类数字（评分/完成数/收入）由真实订单计算，与 iOS 固定演示值不同；Alex 会出现在发现列表；时段星期由真实日期推导
- 证据：[backend/prisma/seed.mjs](../backend/prisma/seed.mjs)、[backend-contract](../docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md)

### M7：iOS Repository 接入与逐屏一致性验证（已完成）

- 日期：2026-08-16
- 范围：iOS 新增 Networking 层（APIClient / APIDTOs / APIRepository / KeychainTokenStore）；AppStore 支持远端 bootstrap 与动作钩子；`-remote-api` 启动参数切换远端模式（默认仍为本地 Mock）；ATS 本地网络配置
- 验证：iOS 构建成功；单元测试 36/36；远端模式（连后端真实数据）11 屏截图与 Mock 基准**逐字节一致 11/11**（发现/分享者详情/发起邀请/我的/登录/注册/找回密码/对谈管理/付款结算/已排期详情/分享中心）
- 说明：演示账号统计值在远端映射层保留固定演示值（4.9/14/840/140/700），其余内容全部来自后端
- 证据：[ios/CoffeeLink/Networking/](../ios/CoffeeLink/Networking/)、[ios/CoffeeLink/App/AppStore.swift](../ios/CoffeeLink/App/AppStore.swift)、[ios/CoffeeLink/App/RootView.swift](../ios/CoffeeLink/App/RootView.swift)

## 3. 进行中的工作

- 后端 12 步 + 演示数据同步 + iOS Repository 接入已全部完成，远端模式 11 屏与 Mock 一致；下一步为真实 Provider 接入（短信/支付/会议）、运营后台、真实用户流程端到端验证。
- 工作区存在未提交变更，等待 checkpoint commit：
  - PRD 整理：删除旧版 `PRD-线上职业CoffeeChat.md` 与 `DESIGN.md`，新增 [PRD.md](../PRD.md) V2.2；
  - memory-bank 初始化：design-document.md、tech-stack.md、progress.md、architecture.md。
  - AGENTS.md 同步修订为 iOS/NestJS 口径并写入 memory-bank Always 规则。
  - AGENTS.md / planner.toml 角色边界口径修正（AGENTS.md 适用范围限定主 Agent；Planner 写权限限定规划产物）。
  - 后端规划产出：backend-contract.md、backend-plan.md 与 memory-bank 登记。
  - 后端 Step 1 脚手架：backend/ 工程（主 Agent 直执行，流程例外）。
  - 后端 Step 2–12 实现与测试（主 Agent 直执行，流程例外）。
  - 后端演示数据种子与契约补齐（M6）。
  - iOS Networking 层与远端模式（M7）。

## 4. 待办与阻塞

- 按 [PRD.md](../PRD.md) §16.2（AGENTS.md 同步、分支合并、后端契约与实施、演示数据同步、iOS 接入联调均已于 2026-08-16 完成，见 M2/M3/M5/M6/M7）：真实短信/支付/会议 Provider 接入；实现最小运营后台；真机验证与 App Store 合规评审。
- 按 [PRD.md](../PRD.md) §11.3 待决项：深色/浅色口径产品决策；后端契约缺位（AGENTS.md 旧栈措辞已同步修订，2026-08-16）。
- 运营后台前端栈选型：已在 tech-stack.md 登记为待定，触发条件为运营后台启动时（PRD §16.2 第 5 项）。

## 5. 维护规则

- 每完成一个里程碑或计划步骤，在本文件追加一条（日期、范围、验证结果、commit 范围、证据链接），并同步更新 §1 总览。
- 逐任务、逐修复轮次的细节写进对应端的 SDD 账本；本文只做引用，不复制细节。
- 文件结构有变化时，同步更新 [architecture.md](./architecture.md)。
