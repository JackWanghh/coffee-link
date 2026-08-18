# CoffeeLink 设计文档（索引式）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 文档定位：按"方案二"建立的指针式设计文档。本文**不复制正文、不成为第二真相**，只负责回答"设计决策在哪里、写代码前读什么"。

## 1. 本文用途与使用方式

- 写任何代码前，必须完整阅读本文件，并按 §2 索引打开对应的权威文档。
- 所有实现决策以被指向的权威文件为准；本文件与权威文件冲突时，以权威文件为准。
- 本文件与 [PRD.md](../PRD.md)、[tech-stack.md](./tech-stack.md)、[progress.md](./progress.md)、[architecture.md](./architecture.md)、`docs/superpowers/`、`.superpowers/sdd/`、`agents/*.toml` 配套使用，是 memory-bank 的入口。

## 2. 设计决策索引（按主题）

| 主题 | 权威来源 | 覆盖内容 |
| --- | --- | --- |
| 产品定位、用户模型与边界 | [PRD.md](../PRD.md) §4 | 定位与价值、品牌原则、统一用户模型、分享状态、产品边界、经验品类体系 |
| 核心用户流程 | PRD.md §5 | 注册/登录/找回密码、电子咖啡邀请、主题互换、开放分享、取消与售后 |
| 功能需求与优先级 | PRD.md §6 | P0/P1/P2 矩阵与实现状态 |
| 领域模型与状态机 | PRD.md §7 | 会话统一状态、邀请/订单/互换关系、候选时间、付款金额、会议、取消退款、主题互换额度、反馈信誉、通知 |
| 信息架构与页面清单 | PRD.md §8 | 导航、页面清单、对谈列表与详情 |
| 商业模式与指标 | PRD.md §9 | MVP 商业化、路径关系、iOS 首发口径、北极星与 MVP 指标 |
| 最小运营能力 | PRD.md §10 | 用户与内容、邀请/对谈与资金、数据概览 |
| 冷启动与主要风险 | PRD.md §11 | 冷启动策略、产品风险矩阵、项目库特有风险与待办 |
| 验收标准 | PRD.md §12 | 账号安全、用户与分享、电子咖啡、主题互换、履约反馈资金、范围一致性、iOS 工程验收 |
| 工程实现现状与质量证据 | PRD.md §13 | Web 原型与 iOS 原生形态、74/74 测试、视觉基线、构建与静态检查、当前版本边界 |
| 后端与运营后台目标架构 | PRD.md §14 | NestJS 模块化单体、PostgreSQL/Prisma、Redis 边界、集成约束、部署；运营后台三模块 |
| 技术栈与工程约束 | PRD.md §15 | Web 原型 / iOS / 后端 / 协作 / 编码约束 |
| 技术栈决策（唯一权威） | [memory-bank/tech-stack.md](./tech-stack.md) | 各层选择、理由、边界、被否决项、待定项、前后端分离架构；PRD §15 为摘要 |
| 路线图 | PRD.md §16 | 已完成项与下一步建议顺序 |
| iOS 原生实现设计 | [2026-08-14-coffeelink-ios-native-design.md](../docs/superpowers/specs/2026-08-14-coffeelink-ios-native-design.md) | 目标与交付范围、核心页面、认证流程、业务弹层、可交互状态、非目标、实现路径、工程结构、导航设计、状态与数据流、视觉复刻规则、表单与错误处理、测试策略、验收标准、风险与控制、完成定义 |
| iOS 实施计划 | [2026-08-14-coffeelink-ios-native.md](../docs/superpowers/plans/2026-08-14-coffeelink-ios-native.md) | 9 个任务（脚手架 → 模型 → 导航 → 页面 → 流程 → 视觉回归 → 终验），每步含验证方法、无代码 |
| iOS 执行记录与进度 | [.superpowers/sdd/2026-08-14-coffeelink-ios-native/](../.superpowers/sdd/2026-08-14-coffeelink-ios-native/) | progress.md 账本 + task 报告（TDD 证据、review 修复轮次） |
| 后端契约（唯一实现依据） | [2026-08-16-coffeelink-backend-contract.md](../docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md) | 目标范围、页面→API 映射、状态机、Prisma 数据模型、OpenAPI 接口清单、错误码/幂等/分页规范、定时任务、可观测性、测试验收 |
| 后端实施计划 | [2026-08-16-coffeelink-backend.md](../docs/superpowers/plans/2026-08-16-coffeelink-backend.md) | 12 步实施计划（脚手架 → Auth → Me → 发现 → 邀请状态机 → 支付 → 评价投诉 → 结算通知 → 契约核对），每步带验收 |
| 项目执行进度总账 | [memory-bank/progress.md](./progress.md) | 各端状态总览、里程碑历史、进行中工作、待办与阻塞（只引用细节，不复制正文） |
| 实现结构地图 | [memory-bank/architecture.md](./architecture.md) | 重要文件/目录职责、关键数据流与状态源、关键约定、规划中的结构、变更记录 |
| iOS 操作与验收证据 | [ios/README.md](../ios/README.md)、[ios/VisualTests/REPORT.md](../ios/VisualTests/REPORT.md) | 环境、构建、测试、Mock 账号、重置机制、验收矩阵与平台差异 |
| Web 原型与适配审计 | [coffeelink/](../coffeelink/)、[coffeelink/audit/2026-08-14-ios/README.md](../coffeelink/audit/2026-08-14-ios/README.md) | 视觉与交互基准（393 × 852、深色）、iOS 适配审计结论 |
| Agent 角色与边界 | [agents/planner.toml](../agents/planner.toml)、[agents/frontend.toml](../agents/frontend.toml)、[agents/backend.toml](../agents/backend.toml)、[agents/reviewer.toml](../agents/reviewer.toml) | Planner / iOS 客户端 / NestJS 后端 / Reviewer 的职责、边界与输出格式 |
| 协作规范 | [AGENTS.md](../AGENTS.md) | 主 Agent 协调、质量门禁、回退规则、编码规范（中文 UTF-8） |

## 3. 各端设计落点

- **Web 原型（coffeelink）**：视觉与交互基准，已完成全部核心页面与弹层，含 iOS 适配审计。
- **iOS 原生（ios）**：设计规格与 9 任务实施计划已定稿，74/74 测试通过、11 屏视觉基线收敛。
- **后端（NestJS）**：契约与实施计划已产出（[backend-contract](../docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md)、[backend-plan](../docs/superpowers/plans/2026-08-16-coffeelink-backend.md)），实现代码位于 [backend/](../backend/)（见 architecture.md §2），12 步已全部完成并自测通过。
- **运营后台**：范围限定为 PRD §10、§14.2 三模块，未启动；启动时同样以本文索引为准。

## 4. 已知不一致与待决项

| 事项 | 状态 | 出处 |
| --- | --- | --- |
| AGENTS.md 已同步为 iOS/NestJS 口径并写入 memory-bank Always 规则 | 已完成（2026-08-16） | PRD §11.3、§15 |
| 深色 vs 浅色口径：PRD §4.2 历史表述与实现（深色 + 6 套外观）不一致 | 待产品决策 | PRD §11.3 |
| 后端设计契约已产出（backend-contract.md + backend-plan.md） | 已完成（2026-08-16），待 Backend 子 Agent 实施 | PRD §14、§16.2 |
| Web→Native 视觉差异 ratio 0.29–0.47 为诊断值，非通过阈值 | 持续监控 | PRD §13.3 |

## 5. 维护规则

- 权威文件（PRD、specs、plans、SDD 账本）更新后，同步维护本文索引；**不把正文复制进本文**，避免双份真相。
- memory-bank 四文档按各自定位维护：design-document.md 管"设计决策在哪"，tech-stack.md 管"技术栈决策与理由"，architecture.md 管"文件结构现状与职责"，progress.md 管"执行进度与验证"；变更时互相检查是否需要联动。
- 后端契约、运营后台设计产出后，在 §3、§2 登记对应路径。
- 每完成一个里程碑，检查本文件索引是否过期、§4 待决项是否已闭环。
