# CoffeeLink 架构地图（architecture.md）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 文档定位：重要文件的职责地图——文件/目录现在是什么、为什么存在、怎么连接。面向写代码的人，写任何代码前必读。
> 文档分工：[PRD.md](../PRD.md) §2 = 项目库全景（文档视角）；[design-document.md](./design-document.md) = 设计决策索引；本文 = 实现结构地图。

## 1. 顶层结构

| 路径 | 职责 |
| --- | --- |
| [PRD.md](../PRD.md) | 唯一权威产品与设计文档（V2.2，自包含） |
| [AGENTS.md](../AGENTS.md) | 协作规范与质量门禁（iOS/NestJS 口径 + memory-bank Always 规则） |
| [config.toml](../config.toml) | Codex 运行配置：审批策略、沙箱模式、推理强度 |
| [coffeelink/](../coffeelink/) | Web 视觉与交互原型（React + Vite），非正式客户端 |
| [ios/](../ios/) | iOS 原生 App（Swift 6 + SwiftUI） |
| [docs/superpowers/](../docs/superpowers/) | 设计规格与实施计划 |
| [agents/](../agents/) | Planner / Frontend（iOS 客户端）/ Backend（NestJS）/ Reviewer 角色定义 |
| [memory-bank/](../memory-bank/) | 长期事实来源入口：design-document / tech-stack / progress / architecture |
| [.superpowers/sdd/](../.superpowers/sdd/) | SDD 执行账本与任务报告 |
| [.worktrees/](../.worktrees/) | 本地工作树目录（已 gitignore） |

## 2. 各端职责地图

### ios/（iOS 原生）

| 路径 | 职责 |
| --- | --- |
| [ios/CoffeeLink/App/](../ios/CoffeeLink/App/) | 入口、路由、AppStore（唯一状态源） |
| [ios/CoffeeLink/Models/](../ios/CoffeeLink/Models/) | 领域模型 |
| [ios/CoffeeLink/Data/](../ios/CoffeeLink/Data/) | 确定性 Mock 数据与本地持久化（JSON 快照 + Keychain 凭据） |
| [ios/CoffeeLink/DesignSystem/](../ios/CoffeeLink/DesignSystem/) | 主题、组件、表单、Tab Bar |
| [ios/CoffeeLink/Features/](../ios/CoffeeLink/Features/) | 发现、分享者详情、邀请、付款、对谈、我的、分享中心、认证 |
| [ios/CoffeeLink/Resources/](../ios/CoffeeLink/Resources/) | 图标与本地头像 |
| [ios/CoffeeLinkTests/](../ios/CoffeeLinkTests/) | 单元测试（36 个） |
| [ios/CoffeeLinkUITests/](../ios/CoffeeLinkUITests/) | UI 测试（38 个，含 11 个视觉基线） |
| [ios/VisualTests/](../ios/VisualTests/) | 参考图、截图、compare.swift、验收报告 |
| [ios/project.yml](../ios/project.yml) | XcodeGen 工程定义（唯一真相）；`CoffeeLink.xcodeproj` 为生成产物 |

### coffeelink/（Web 原型）

| 路径 | 职责 |
| --- | --- |
| [coffeelink/src/components/pages/](../coffeelink/src/components/pages/) | 8 个页面视图 |
| [coffeelink/src/components/modals/](../coffeelink/src/components/modals/) | 认证、业务与设置弹层 |
| [coffeelink/src/components/](../coffeelink/src/components/) | TopAppBar / BottomTabBar / DeviceFrame 等通用组件 |
| [coffeelink/src/data/](../coffeelink/src/data/) | mockData.ts、swiftCodeData.ts |
| [coffeelink/src/](../coffeelink/src/) | theme.tsx、types.ts、App.tsx、main.tsx、index.css |
| [coffeelink/audit/](../coffeelink/audit/) | iOS 适配审计（截图与结论） |

边界：coffeelink 只作为视觉与交互基准，不进入正式客户端实现。

### agents/（Agent 角色）

| 文件 | 职责 |
| --- | --- |
| [planner.toml](../agents/planner.toml) | 产品与系统规划师（只读模式，输出契约与任务拆解） |
| [frontend.toml](../agents/frontend.toml) | iOS 客户端工程师（只改 /ios） |
| [backend.toml](../agents/backend.toml) | NestJS 后端工程师（只改 /backend） |
| [reviewer.toml](../agents/reviewer.toml) | QA 与代码审查员（只输出审查报告） |

### memory-bank/（长期事实来源）

| 文件 | 职责 |
| --- | --- |
| [design-document.md](./design-document.md) | 设计决策索引：各主题设计决策的权威来源在哪 |
| [tech-stack.md](./tech-stack.md) | 技术栈唯一权威：各层选择、理由、边界、被否决项、待定项 |
| [progress.md](./progress.md) | 项目级执行进度总账 |
| [architecture.md](./architecture.md) | 本文：实现结构地图 |

## 3. 关键数据流与状态源

- **iOS 状态源**：AppStore（@Observable）为单一状态源，View 不直接持有业务状态；导航使用 NavigationStack + 类型安全路由 + 自定义三 Tab。
- **本地持久化**：业务快照存 `Application Support/CoffeeLink/state.json`；演示凭据存 Keychain；删除 App 或 state.json 即恢复初始演示数据。
- **测试隔离**：UI 测试默认使用 `-ui-testing` / `-reset-demo` 的内存持久化，不读写真实用户数据；跨进程持久化测试使用 `-persistent-ui-testing` + `COFFEELINK_RESET_PERSISTENT_DEMO=1`，数据位于 CoffeeLinkUITests/state.json。
- **视觉测试**：`-visual-screen <screen>` 直达状态、关闭动画，保证截图可复现。

## 4. 关键约定

- iOS：Swift 6、iOS 17.0+、iPhone-only、纯 SwiftUI、无第三方运行时依赖、深色默认。
- 金额：以最小货币单位整数存储；时间：UTC + ISO 8601 交换。
- 状态机：邀请、订单、互换等状态显式约束，客户端不得自行跳过（原型 SessionStatus 覆盖 10 态）。
- 中文：所有源码使用实际 UTF-8 中文字符，禁止 `\uXXXX` 转义，文件无 BOM。
- 演示账号：`13800138000` / `Pass123456`，注册验证码 `123456`（仅本地演示与自动化测试）。

## 5. 规划中的结构（尚未创建）

- **backend/**：NestJS 模块化单体 + PostgreSQL/Prisma + Redis；模块清单与约束见 [PRD.md](../PRD.md) §14、[agents/backend.toml](../agents/backend.toml)。
- **运营后台**：用户与内容、邀请/对谈与资金、数据概览三模块（[PRD.md](../PRD.md) §10 / §14.2）。
- 上述目录实际创建后，从本节移入 §2 并追加变更记录。

## 6. 变更记录

- 2026-08-16：建立 memory-bank/（design-document.md、progress.md、architecture.md）——为后端/运营后台启动做文档前置，防止上下文漂移。

后续每完成一个里程碑或新增/变更重要文件，在此追加一条（日期、文件、原因），保持本文与代码同步。
