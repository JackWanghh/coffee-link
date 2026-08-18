# CoffeeLink 后端实施计划（backend-plan）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 执行方式：每步由 Backend 子 Agent 实现，Reviewer 审查，主 Agent 集成验证；**一次只做一步，上一步验证通过后才开始下一步**；每步无代码、只有指令与验收方式。
> 契约依据：[backend-contract.md](../specs/2026-08-16-coffeelink-backend-contract.md)。

## 实施步骤

### Step 1：后端脚手架
- 在仓库根目录创建 `backend/` NestJS 工程（Node.js 24 LTS + TypeScript strict，`@nestjs/cli`），GitHub Actions 可识别；目录边界：Backend 只改 `/backend`。
- 验收：`npm run build` 通过；`git diff --check` 通过；`GET /` 返回默认健康响应。

### Step 2：本地基础设施
- 编写 `docker-compose.yml`（PostgreSQL 16 + Redis 7）与 `.env.example`（DATABASE_URL、REDIS_URL、JWT_SECRET、PORT 等，密钥不入库）。
- 验收：`docker compose up -d` 后 `pg_isready` 与 `redis-cli ping` 通过；README 记录启动命令。

### Step 3：Prisma Schema v1 与迁移
- 建表：users、refreshTokens、smsCodes、categories、coffeeDrinks、themes、credentials、slots、sessions、reviews、complaints、payments、settlements、notifications（契约 §5）；种子：6 品类 + 8 饮品。
- 验收：`prisma migrate dev` 成功；`prisma migrate deploy` 幂等；种子数据可查。

### Step 4：基础设施模块
- `@nestjs/config` 环境校验、pino 日志（reqId）、全局异常过滤器（统一错误码响应）、`@nestjs/terminus` 健康检查、prom-client `/metrics`。
- 验收：单元测试覆盖异常过滤器；`curl /health` 返回 ok；日志含 reqId、不含敏感字段。

### Step 5：Auth 模块
- SMS Provider 抽象 + Mock（60s 重发、5min 有效、单日上限）；注册、登录（JWT access/refresh + Redis 白名单）、刷新、退出、找回密码；argon2 哈希；`@nestjs/throttler` 限流。
- 验收：集成测试覆盖注册→登录→刷新→退出；错误文案不暴露账号是否存在；限流触发 `AUTH_RATE_LIMITED`。

### Step 6：Me 模块（资料与分享中心）
- profile、themes（≤3 + categoryId）、签名饮品、互换设置、slots（30 天/唯一/开放分享至少一个可用）、会议链接（https meeting.tencent.com）、sharing 开关（六项就绪校验）、settings、收入摘要。
- 验收：集成测试覆盖全部校验规则（对照 PRD §12.2）；`GET /me/sharing-center` 字段与 iOS `UserProfile`/`SharingCenterView` 一致。

### Step 7：发现与目录
- categories、coffee-drinks、sharers 列表（品类筛选/关键词/运营排序/受限品类不进精选/游标分页）、sharers 详情（不含会议链接）。
- 验收：`GET /sharers?category=health` 结果不含精选标记；分页 nextCursor 正确；详情字段与 iOS `Sharer` 模型一致。

### Step 8：邀请与会话状态机
- 电子咖啡邀请、主题互换邀请（周额度 3、并发 2、7 天冷却）；接受（事务内锁时段：咖啡→2h 付款期限，互换→排期）；婉拒（标准原因+冷却）；重选时段；取消；12h 过期定时任务。
- 验收：状态机集成测试覆盖契约 §4 全部迁移；并发接受同一时段只有一个成功（`CONFLICT_SLOT_TAKEN`）。

### Step 9：支付模块
- 支付 Provider 抽象 + Mock；下单（Idempotency-Key）、回调（幂等，成功→booked+生成订单）、退款（全额原路、不计平台收入）；2h 付款超时释放时段。
- 验收：集成测试覆盖成功/失败/取消/重复回调；金额=服务端快照；退款后订单 `cancelled`。

### Step 10：评价与投诉
- 评价（咖啡：发起人评分享者+分享者轻反馈；互换双盲，双方或 24h 后可见）；同类型 ≥3 次才公开汇总评分；投诉（completed 且 24h 内→inAfterSale）；运营批准退款/驳回。
- 验收：集成测试覆盖唯一评价、盲评可见性、汇总评分门槛；`GET /sharers/:id` 评分字段正确。

### Step 11：结算与通知
- 每周结算任务（无投诉已完成订单，15/85 分成，settlements 表）；通知事件落库 + Push Provider 抽象（Mock）；待办未读数接口。
- 验收：结算任务幂等（同周不重复）；通知事件覆盖契约 §8 清单；`GET /me/notifications` 未读数正确。

### Step 12：契约核对与全量回归
- `@nestjs/swagger` 生成 OpenAPI 3，逐项对照 backend-contract §6；全量 Jest + Supertest 回归；`prisma migrate deploy` 在干净库上验证。
- 验收：契约差异 0；全部测试通过；`git diff --check` 通过；无 `\uXXXX`。

## 风险与门禁
- 每步完成后 Reviewer 按 agents/reviewer.toml 审查：P1 清零、P2 ≤ 2 才进入下一步；跨步依赖（如支付回调）以 Mock 先行，不阻塞。
- 真实短信/支付/会议接入在后续单独排期，替换 Provider 时保持契约与幂等语义不变。
