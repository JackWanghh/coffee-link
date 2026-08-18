# CoffeeLink 技术栈（tech-stack.md）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 文档定位：**技术栈决策的唯一事实来源**——每层用什么、为什么选它、边界在哪、哪些被否决、哪些待定。写代码前与 design-document.md、architecture.md 一并阅读。

## 1. 定位与权威关系

- 本文为技术栈决策的唯一权威；[PRD.md](../PRD.md) §15 仅为摘要，指向本文。
- `agents/*.toml` 是角色侧约束（Frontend/Backend 各自的技术边界），必须与本文一致。
- **改栈先改本文**，再同步 PRD §15 摘要与 `agents/*.toml`；本文与任何文件冲突时以本文为准。
- 与 memory-bank 其他文档的分工：design-document.md 管"设计决策在哪"，architecture.md 管"文件结构现状"，progress.md 管"执行进度"，本文管"用什么技术、为什么"。

## 2. 各层决策表

### 前后端分离架构（全局约束）

- **分离形态**：客户端与后端完全分离。iOS 原生客户端与运营后台 Web 前端通过 REST JSON + OpenAPI 契约与 NestJS 后端通信；客户端**不直连数据库**、不依赖后端运行时进程。
- **契约先行 + Mock 先行**：Planner 先输出 OpenAPI 契约；客户端以 Mock 数据/本地持久化独立开发与验证，后端就绪后替换 Mock Provider，双方可并行交付。
- **部署分离**：后端独立容器化部署（CloudBase 云托管）；客户端独立交付（iOS 走 App Store）；运营后台前端独立部署。
- **目录边界**：iOS 客户端限 `/ios`；后端限 `/backend`；运营后台前端待选型后独立建目录；`coffeelink` 仅作视觉与交互基准，不属于分离架构的正式前端。
- **运营后台**：是唯一的"Web 前后端分离"形态（Admin SPA + REST API），分离架构已确定，前端技术栈待定（见 §4）。

### Web 原型（coffeelink）

| 层 | 选择 | 理由 | 边界 |
| --- | --- | --- | --- |
| 框架/构建 | React 19 + Vite 6 + Tailwind 4 + lucide-react | 快速产出移动端视觉与交互基准；实测版本：react 19.0.1、vite 6.2.3、tailwindcss 4.1.14、lucide-react 0.546.0 | 仅作视觉与交互参考（393 × 852、深色），**非正式客户端** |
| 辅助依赖 | express / dotenv / motion | 原型本地服务、环境变量与动效辅助 | 不进正式客户端/后端 |

### iOS 原生（ios）

| 层 | 选择 | 理由 | 边界 |
| --- | --- | --- | --- |
| 语言/UI | Swift 6 + SwiftUI + Observation | 原生体验、状态管理简洁、符合 Apple HIG | iOS 17.0+、iPhone-only（project.yml 实测 deploymentTarget 17.0 / SWIFT_VERSION 6.0） |
| 测试 | XCTest + XCUITest（74 项，含 11 视觉基线） | 单元 + UI + 视觉回归一体 | 视觉基线 393 × 852 |
| 运行时依赖 | 无第三方运行时依赖 | 可控、可审计 | 不引入 UIKit 例外、React Native、WebView |

### 后端（NestJS）——本次定稿

| 层 | 选择 | 理由 | 边界/出处 |
| --- | --- | --- | --- |
| 运行时 | Node.js 24 LTS + TypeScript strict | LTS 支持期、类型安全 | agents/backend.toml |
| 框架 | NestJS 模块化单体 | DI、模块边界、生态成熟 | 不拆微服务 |
| API | REST JSON + OpenAPI（@nestjs/swagger） | 机器可读契约，客户端与后端并行 | 契约先行，Planner 输出 |
| 校验 | class-validator + class-transformer | NestJS 标准能力 | 所有外部输入 |
| ORM/数据库 | Prisma + PostgreSQL 16 | 类型安全迁移，事务与约束显式 | MySQL 已否决（见 §3） |
| 缓存 | Redis 7 + ioredis | 验证码、限流、短期状态、幂等锁 | **不得作为订单事实来源** |
| 配置 | @nestjs/config + .env 清单 | 12-factor | 密钥不入代码/日志/提交 |
| 定时任务 | @nestjs/schedule | 12 小时邀请过期、2 小时付款关闭、对谈自动完成 | 显式状态机驱动 |
| 限流 | @nestjs/throttler | 验证码/登录接口防刷 | 服务端强制 |
| 认证 | JWT（access + refresh）+ argon2 | 无状态令牌、强哈希 | 客户端令牌入 Keychain |
| 日志 | pino | 结构化、性能好 | 不记录密码、验证码、令牌、完整手机号 |
| 测试 | Jest（单元）+ Supertest（集成，基于 Docker Compose PostgreSQL） | NestJS 默认、可覆盖状态机/幂等/金额 | 关键 REST 流程必须有集成或 E2E |
| 外部集成 | Provider 抽象 + Mock 先行（腾讯云 SMS、微信支付 v3、腾讯会议、内容审核） | 隔离外部依赖、Mock 语义与真实一致 | Mock 不得绕过"接受后付款"等核心状态 |
| 文件 | COS（cos-nodejs-sdk-v5） | 对象存储 | 经 ObjectStorage 接口抽象 |

### 部署与 CI

| 层 | 选择 | 理由 | 边界 |
| --- | --- | --- | --- |
| 本地 | Docker Compose（PostgreSQL 16 + Redis 7） | 不依赖个人机器全局服务 | 开发流程一致 |
| 生产 | 腾讯云 CloudBase 云托管 | 容器化、无状态、环境变量配置 | 不保存持久数据于容器本地 |
| CI | GitHub Actions | 仓库位于 GitHub（JackWanghh/coffee-link） | 提交后测试 + 构建门禁 |

## 3. 被否决与替代方案

| 方案 | 否决理由 |
| --- | --- |
| MySQL | 项目已按 PostgreSQL/Prisma 语义定稿（planner.toml 明确"不再输出 MySQL 专属设计"） |
| 微服务 | MVP 规模下模块化单体足够，避免过早复杂基础设施 |
| React Native / UIKit / WebView / 跨平台框架 | iOS 首发原生体验与自动化测试门禁要求（frontend.toml 明确不引入） |
| Vue/Go 旧管理后台栈 | 已被 iOS 客户端 + NestJS 后端口径取代；AGENTS.md 已于 2026-08-16 同步修订 |

## 4. 待定清单

| 待定项 | 说明 | 触发条件 |
| --- | --- | --- |
| 运营后台前端栈 | 用户与内容 / 邀请对谈与资金 / 数据概览三模块 | 运营后台启动选型后回填（PRD §16.2 第 5 项） |
| 后端可观测性细节 | **已定稿**：@nestjs/terminus 健康检查 + pino 结构化日志（reqId、错误码）+ prom-client `/metrics`；APM 接入真实短信/支付后评估腾讯云 APM（P1） | 已定稿（2026-08-16，见 backend-contract §9） |

## 5. 变更记录

- 2026-08-16（V1.0）：建立本文；后端库级默认按确认清单定稿（日志 pino、测试 Jest+Supertest、OpenAPI @nestjs/swagger、CI GitHub Actions、定时 @nestjs/schedule、认证 JWT+argon2、Redis 客户端 ioredis、限流 @nestjs/throttler、PG16 + Redis7）；运营后台前端栈标记待定。
- 2026-08-16：补充"前后端分离架构（全局约束）"小节，明确客户端/后端/运营后台的分离形态、契约先行与目录边界。
- 2026-08-16：后端可观测性待定项定稿（健康检查 + pino reqId 日志 + prom-client 指标；APM 列 P1）。

## 6. 维护规则

- 改栈先改本文，再同步 [PRD.md](../PRD.md) §15 摘要与 `agents/*.toml`。
- 每完成一个里程碑，在本文件追加变更记录。
- 待定项定案后回填到 §2/§4，并移除"待定"标记。
- 版本与约束变更需与 [coffeelink/package.json](../coffeelink/package.json)、[ios/project.yml](../ios/project.yml) 实测一致。
