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

## 3. 进行中的工作

- 当前无进行中的实现步骤（处于 iOS 完成、后端未启动的空档期）。
- 工作区存在未提交变更，等待 checkpoint commit：
  - PRD 整理：删除旧版 `PRD-线上职业CoffeeChat.md` 与 `DESIGN.md`，新增 [PRD.md](../PRD.md) V2.2；
  - memory-bank 初始化：design-document.md、tech-stack.md、progress.md、architecture.md。
  - AGENTS.md 同步修订为 iOS/NestJS 口径并写入 memory-bank Always 规则。

## 4. 待办与阻塞

- 按 [PRD.md](../PRD.md) §16.2（AGENTS.md 同步已于 2026-08-16 完成）：合并 `feature/coffeelink-ios-native` 到 main；演示数据与品类同步；制定 OpenAPI 契约并启动后端；实现最小运营后台；真机验证与 App Store 合规评审。
- 按 [PRD.md](../PRD.md) §11.3 待决项：深色/浅色口径产品决策；后端契约缺位（AGENTS.md 旧栈措辞已同步修订，2026-08-16）。
- 运营后台前端栈选型：已在 tech-stack.md 登记为待定，触发条件为运营后台启动时（PRD §16.2 第 5 项）。

## 5. 维护规则

- 每完成一个里程碑或计划步骤，在本文件追加一条（日期、范围、验证结果、commit 范围、证据链接），并同步更新 §1 总览。
- 逐任务、逐修复轮次的细节写进对应端的 SDD 账本；本文只做引用，不复制细节。
- 文件结构有变化时，同步更新 [architecture.md](./architecture.md)。
