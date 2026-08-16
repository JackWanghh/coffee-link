# CoffeeLink - 主 Agent 协调规范

## 1. 任务分发原则

- Frontend 角色 = **iOS 客户端工程师**（目录 `/ios`，Swift 6 + SwiftUI）：涉及 `/ios` 代码改动必须 spawn Frontend 子 Agent，主 Agent 不得直接修改
- Backend 角色 = **NestJS 后端工程师**（目录 `/backend`，Node.js 24 + TypeScript + NestJS + Prisma + PostgreSQL）：涉及 `/backend` 代码改动必须 spawn Backend 子 Agent，主 Agent 不得直接修改
- 运营后台（Web 管理端）前端技术栈待定：启动前先回填 `memory-bank/tech-stack.md` 待定清单，再按角色分工执行
- 主 Agent 职责：协调流程、集成验证、修复配置文件（PRD.md、AGENTS.md、memory-bank/、agents/*.toml、config.toml）以及不归属于任何子 Agent 的问题
- 违反此原则视为流程违规

## 2. 质量门禁与自动修复循环

### 2.1 循环流程

Planner（出规划）→ Frontend + Backend（并行开发）
  → Reviewer（质量审查）
    → 存在 P1/P2 问题时由对应子 Agent 修复（Frontend 修 `/ios`，Backend 修 `/backend`）
    → Reviewer 重新审查，重复直到 P1 清零、P2 ≤ 2 或达到最大循环次数
    → 通过后进入集成验证
  → 集成验证（主 Agent 执行）
    → 启动前后端服务、联调测试、检查核心流程
    → 发现集成问题 → 回退给对应子 Agent 修复 → 回到 Reviewer
    → 通过后结束

### 2.2 回退规则

- **P1 问题**：必须修复，阻塞发布
- **P2 问题**：建议修复，同一模块循环上限 3 次后自动降级为建议项
- **P3 问题**：记录到待办清单，不阻塞当前循环
- 子 Agent 修复时只修改自己负责的目录（Frontend 只改 `/ios`，Backend 只改 `/backend`）
- 修复完成后必须注明修改的文件列表，方便 Reviewer 增量审查

### 2.3 集成验证

代码审查通过后，由主 Agent 执行集成验证，检查以下内容：

- iOS 构建与测试：`xcodebuild clean build/test`，维持 74 项自动化套件（36 单元 + 38 UI，含 11 视觉基线）与静态门禁
- 后端启动与依赖：Docker Compose（PostgreSQL 16 + Redis 7）正常、端口与健康检查、Prisma migrate、编译与单元/集成测试
- 联调：客户端与后端按 OpenAPI 契约校验路径、DTO、错误码与状态机；鉴权、幂等与金额语义一致（CORS/API 代理仅适用于未来的运营后台 Web 端）
- 部署配置：Docker Compose、CloudBase 云托管、GitHub Actions CI、.env 环境变量清单
- 运行环境兼容：Node.js 24 LTS、PostgreSQL 16、Redis 7、Prisma 迁移与驱动

集成验证发现的问题按同等级别回退到修复循环中处理。

### 2.4 人工介入条件

- 同一问题反复出现 3 次仍未解决 → 标记为需人工介入，跳出循环
- 跨模块/跨目录的架构问题 → 通知主 Agent 人工决策
- 集成验证发现的环境/配置问题，子 Agent 无法独立解决 → 主 Agent 人工处理

## 3. 编码规范（所有子 Agent 必须遵守）

### 3.1 中文字符编码

- 所有源码文件（.swift、.ts、.js、.css、.html、.go、.yaml、.toml、.md 等）中的中文文本**必须保存为实际 UTF-8 中文字符**，禁止使用 Unicode 转义序列（\uXXXX）
- 写入文件时，必须确保非 ASCII 字符原样保持，不被转义为 \uXXXX 序列
- 所有文件必须使用 UTF-8 编码，不含 BOM

### 3.2 文本用于界面展示

模板、组件与文案中的中文文本（label、placeholder、message、Text 等）必须是可读的中文字符，而非编码后的转义序列。示例：

正确：

```swift
Text("部门名称")
TextField("请输入部门名称", text: $name)
```

错误：

```swift
Text("\u90e8\u95e8\u540d\u79f0")
TextField("\u8bf7\u8f93\u5165\u90e8\u95e8\u540d\u79f0", text: $name)
```

### 3.3 Reviewer 审查项

Reviewer 在审查代码时，必须检查源码中是否存在 \uXXXX 形式的 Unicode 转义序列，将其标记为 P1 问题。

## 4. Memory-Bank 规则（Always）

- 写任何代码前，必须完整阅读 `memory-bank/design-document.md`（设计决策索引）、`memory-bank/tech-stack.md`（技术栈唯一权威）与 `memory-bank/architecture.md`（文件结构地图）；涉及执行进度时阅读 `memory-bank/progress.md`
- 每完成一个重大功能或里程碑后，更新 `memory-bank/progress.md` 与 `memory-bank/architecture.md`
- 技术栈变更先改 `memory-bank/tech-stack.md`，再同步 PRD §15 与 `agents/*.toml`
- Planner 产出后端契约（OpenAPI / 数据模型）后，登记到 `memory-bank/design-document.md` 索引与 `memory-bank/tech-stack.md` 待定清单
