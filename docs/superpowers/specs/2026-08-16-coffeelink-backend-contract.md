# CoffeeLink 后端契约与数据模型（backend-contract）

> 文档版本：V1.0
> 文档日期：2026-08-16
> 文档定位：NestJS 后端实现的**唯一契约来源**。由 iOS 全部页面、[AppStore 状态机](../../ios/CoffeeLink/App/AppStore.swift)、[领域模型](../../ios/CoffeeLink/Models/CoffeeModels.swift)与 [PRD.md](../../PRD.md) §6/§7/§12/§14 推导；Backend 子 Agent 实现时必须严格对照本文件。
> 技术基线：Node.js 24 LTS + TypeScript strict + NestJS + Prisma + PostgreSQL 16 + Redis 7（见 [tech-stack.md](../../memory-bank/tech-stack.md)）。

## 1. 目标、范围与非目标

**目标**：支撑 iOS MVP 全部页面与流程的后端 API、数据模型、状态机与定时任务；前后端分离、契约先行、Mock 先行（见 tech-stack.md"前后端分离架构"）。

**范围内**：`+86` 手机号注册/登录/找回密码；实名与经验声明；一级品类；分享者发现（搜索/品类筛选/人工排序）；分享中心（资料、主题、签名饮品、时段、互换设置、会议链接、收入摘要）；电子咖啡邀请与主题互换（额度/冷却/排期）；会话状态机（接受/婉拒/重选时间/付款/取消/自动完成）；支付（微信/支付宝，Provider 抽象 + Mock）；评价/投诉/售后；每周结算；业务通知；最小运营后台三模块（预留接口边界）。

**范围外（MVP 不做）**：独立消息中心/私信；应用内音视频、录音、转写；积分/会员/优惠券/预充值；多档时长（MVP 固定 30 分钟）；专家咨询独立定价；智能匹配；内容社区。

## 2. iOS 页面 → 后端需求映射（现状推导）

| iOS 页面/弹层 | 页面动作（AppStore/视图） | 后端 API / 数据需求 |
| --- | --- | --- |
| 认证弹层：登录/注册/找回密码 | `login` / `register` / `resetPassword`；+86 校验、密码 8~20 位含字母数字、60s 重发、5 分钟验证码 | 短信验证码（Mock Provider）、注册/登录/重置、JWT、限流 |
| 发现 Tab | 搜索框 + 行业/品类筛选 + 分享者列表（`DiscoverFilter`） | 分享者列表：品类/关键词筛选、人工排序、分页；受限品类（健康）不进精选 |
| 分享者详情 | 资料、主题、评价、可约时段、发起邀请入口 | 分享者详情：资料、主题、30 天时段、评分/完成次数/按时率/响应中位数、评价列表 |
| 发起邀请（电子咖啡/主题互换） | `submitInvitation` / `submitTopicSwap`：主题+问题(20~300字)+最多3时段；互换需双向主题+双向问题 | 创建邀请/互换（额度、并发上限、冷却期校验）；饮品与价格快照 |
| 接受邀请弹层 | `acceptInvitation`：确认仍可用时段；互换需补 ≥8 字问题 | 接受：校验时段仍可用并占用；咖啡→待付款（2h 期限）；互换→已排期 |
| 婉拒弹层 | `declineInvitation`：标准原因 | 婉拒（4 个标准原因）、冷却期记录 |
| 付款结算页 | `completePayment`：2 小时期限、微信/支付宝、失败/取消重试 | 支付下单、回调（幂等）、退款；金额=饮品快照价，15/85 分成 |
| 对谈列表 | 方向（发出/收到）+ 筛选（全部/待回应/待付款/已排期/已完成）+ 状态角标 | 会话列表：方向、状态筛选、分页、未处理待办数 |
| 对谈详情 | 议题、时间、会议、取消、评价、投诉 | 会话详情、会议链接可见性（仅双方/已确认）、取消/评价/投诉 |
| 会议弹层 | 展示腾讯会议链接（仅已付款/已排期） | 会议链接随会话返回，仅双方可见；失效举报走投诉 |
| 我的 Tab | 统计、分享中心入口、设置、退出登录 | 当前用户资料与统计、会话数/评分/回复率/按时率 |
| 分享中心 | 资料/主题/饮品/时段/互换/会议/收入摘要（`pendingEarnings`/`settledEarnings`） | 分享就绪校验（实名/资料/主题/饮品/时段/会议）、收入摘要、开放/关闭分享 |
| 编辑资料/管理主题/选饮品/时段/互换设置/会议号 | `updateProfile`/`updateThemes`(≤3)/`selectDrink`/`updateAvailableSlots`/`updateTopicSwapSettings`/`updateMeetingLink` | 对应 CRUD，服务端强制同一套校验（主题≤3、时段唯一、会议链接 https meeting.tencent.com 等） |
| 设置弹层 | `updateAppearance`（外观/日历/会议就绪/触感） | 用户设置持久化（客户端本地为主，服务端存副本） |
| 评价/投诉弹层 | `submitReview`（1~5 星+标签+文字）/ `submitComplaint`（类别+说明） | 评价（咖啡：发起人评分享者+分享者轻反馈；互换：双盲）、投诉（完成后 24h 售后窗口） |

> 视觉验证结论（2026-08-16）：模拟器实机截图 11 屏（发现/分享者详情/发起邀请/我的/登录/注册/找回密码/对谈管理/付款结算/已排期对谈详情/分享中心）与已验证 Captures 逐字节一致，页面清单与字段口径确认无误。发现页当前筛选为"行业"口径（AI 与算法 / 互联网产品 / 研发与架构 / 战略与咨询 / 设计与体验 / 出海与商业化），后端按一级品类（career/travel/health 等）建模；品类体系落地后客户端筛选改为品类，行业标签保留为分享者资料字段（对齐 PRD §6.1）。

## 3. 已确认事实、假设与待决问题

**已确认（来自 PRD 与现有实现）**：
1. 会话统一状态 11 态（`SessionStatus`），电子咖啡订单状态链：已预约→已完成→售后中→退款中→已取消；互换链：已排期→已完成/已取消。
2. 邀请不是订单：提交不付款、不生成订单、不独占时段；付款成功才生成订单。
3. 电子咖啡：接受后 2 小时付款期限；发起人开始前取消全额退款，开始后取消/缺席不退；分享者取消/缺席全额退款。
4. 主题互换：每周主动发起 ≤3 次、同时待处理 ≤2 个、同一对象婉拒后 7 天冷却；互换不收费。
5. 金额：饮品目录统一定价，发起人实付=邀请页展示金额；平台 15% / 分享者 85%；退款订单无平台收入；不发行代币。
6. 评价：电子咖啡与互换分开统计；互换双盲（双方提交或 24h 后公开）；同类型 ≥3 次完成才公开汇总评分。
7. 会议：MVP 只用分享者默认腾讯会议链接（https meeting.tencent.com），App 外进行；链接仅双方可见。
8. 短信只用于注册/找回密码验证码；业务通知走 iOS 推送 + 页面待办。

**假设（实现时按此执行，如有异议由 Reviewer 提出）**：
1. 主键统一 UUID（`gen_random_uuid()`）；金额统一 `int` 最小货币单位（分）；时间统一 `timestamptz` UTC，对外 ISO 8601。
2. 会话候选时段以"slot 快照"（label + 时间）+ slotId 存储；确认时校验 slot 实时可用并占用（Redis 锁 + DB 事务）。
3. 令牌：JWT access（短期，如 2h）+ refresh（如 14d，Redis 白名单）；密码 argon2。
4. 列表分页统一游标式（`afterId` + `limit`，默认 20，上限 50）；运营后台用页码式。
5. 通知先落库（notifications 表）+ Provider 抽象（iOS 推送 Mock 先行），不建消息中心。
6. `needsNewTime` 重选后回到 `pendingResponse`，重新开始 12h 计时。

**待决问题（不阻塞规划，Backend 实施前需确认）**：
1. 验证码 Mock 语义：60 秒重发、5 分钟有效、单日次数上限的具体数值已在 PRD §12.1，按此实现；真实短信接入时间待定。
2. 支付回调与退款的具体 Provider（微信支付 v3 / 支付宝）选型在接真实支付时再定，Mock 先行。
3. 运营后台接口与权限模型（管理员账号、操作审计）在运营后台规划时产出，本契约仅预留模块边界。

## 4. 业务状态机（服务端唯一口径）

```text
pendingResponse（待回应，12h 自动过期）
  ├─ 接受（咖啡）→ acceptedPendingPayment（待付款，2h 期限）
  ├─ 接受（互换）→ swapScheduled
  ├─ 要求重选时间 → needsNewTime（发起人重选 → 回到 pendingResponse）
  ├─ 婉拒 → declined（终态）
  ├─ 超时 → expired（终态）
  └─ 发起人取消 → cancelled（终态）

acceptedPendingPayment → 支付成功 → booked（生成订单）
                       → 支付超时/取消 → expired / cancelled（释放时段）

booked / swapScheduled → 开始前发起人取消 → cancelled（电子咖啡全额原路退款）
                       → 分享者取消/缺席 → refunding → cancelled（全额退款）
                       → 到达结束时间 → completed

completed → 24h 内投诉 → inAfterSale
          → 评价 →（咖啡：发起人评分享者 + 分享者轻反馈；互换：双盲，双方或 24h 后公开）

inAfterSale → 运营批准退款 → refunding → cancelled
            → 运营驳回 → completed
```

约束：支付中/失败/超时是付款流程状态，不属于订单状态；退款完成才进入 `cancelled`；同一会话同一用户只能评价一次。

## 5. 数据模型（PostgreSQL / Prisma）

金额一律 `Int` 分；时间一律 `DateTime @db.Timestamptz`；主键 `String @id @default(uuid()) @db.Uuid`；软删除 `deletedAt DateTime?`；表名与枚举统一 snake_case / PascalCase 语义。

| 表 | 关键字段与约束 |
| --- | --- |
| `users` | phone（唯一）、passwordHash、name/title/company、avatarUrl、isVerified、declarationNote、isSharingOpen、signatureDrinkId FK、acceptsTopicSwap、weeklySwapLimit（默认 3）、appearanceThemeId、autoCalendarSync、defaultMeetingReady、hapticsEnabled、createdAt/updatedAt/deletedAt |
| `refreshTokens` | userId FK、tokenHash、expiresAt；索引 (userId) |
| `smsCodes` | phone、purpose(register/reset)、codeHash、expiresAt、sentAt、attempts；索引 (phone, purpose, createdAt) |
| `categories` | code（唯一，如 career/travel/health/...）、name、isRestricted（健康=true）、sortOrder；种子数据 |
| `coffeeDrinks` | code（唯一）、name、nameEn、priceCents、icon、description、tag、active |
| `themes` | userId FK、categoryId FK、title、description、durationMinutes=30、includes/excludes（String[]）、active；唯一 (userId, title)；用户活跃主题 ≤3（应用层+触发器校验） |
| `credentials` | userId FK、title、issuer、status(declared/verified)、url、createdAt |
| `slots` | userId FK、slotAt timestamptz、label（如"10月24日 14:00-14:30"）、isAvailable；唯一 (userId, slotAt)；索引 (userId, isAvailable, slotAt)；未来 30 天口径由应用层约束 |
| `sessions` | type(coffee/topicSwap)、orderNumber（唯一，生成规则 INV-/SWP-+序号）、senderId/receiverId FK、themeId FK、offeredThemeId?、question、offering?、receiverQuestion?、candidateSlots Json（id/label 快照）、confirmedSlotId?/confirmedSlotLabel?、drinkSnapshot Json?、priceCents?、paymentMethod?、paymentDeadlineAt?、expiresAt?（12h）、startsAt/endsAt、status、declineReason?、meetingLink?、createdAt/updatedAt；索引 (senderId,status)、(receiverId,status)、(status,expiresAt)、(status,endsAt) |
| `reviews` | sessionId FK、reviewerId FK、revieweeId FK、rating(1..5)、comment、tag?、isSwapReview、isBlindVisible、visibleAt?；唯一 (sessionId, reviewerId)；索引 (revieweeId, isSwapReview) |
| `complaints` | sessionId FK、reporterId FK、category、description、status(open/resolved/refunded)、adminNote?、createdAt |
| `payments` | sessionId FK（唯一）、amountCents、method(wechat/alipay)、providerTradeNo?、status(pending/success/failed/refunded)、idempotencyKey（唯一）、createdAt/updatedAt |
| `settlements` | userId FK、periodStart/periodEnd、platformCents、sharerCents、status(pending/settled)、createdAt；唯一 (userId, periodStart) |
| `notifications` | userId FK、type、title、body、sessionId?、readAt?、pushSentAt?、createdAt；索引 (userId, readAt) |

Redis 用途（不得作为事实来源）：验证码限流计数、JWT refresh 白名单、时段占用短期锁、幂等键去重辅助、待办计数缓存。

## 6. OpenAPI 接口清单（Method / Path / Auth / 要点）

**认证与账户**
| Method/Path | Auth | 要点 |
| --- | --- | --- |
| POST `/auth/sms/send` | 公开 | body: phone, purpose；60s 重发、5min 有效、单日上限；Mock Provider |
| POST `/auth/register` | 公开 | phone+code+password+同意协议；唯一手机号 |
| POST `/auth/login` | 公开 | phone+password → access+refresh；失败不暴露账号是否存在 |
| POST `/auth/password/reset` | 公开 | phone+code+newPassword |
| POST `/auth/refresh` | refresh | 轮换 refresh token |
| POST `/auth/logout` | Bearer | 吊销 refresh |
| GET `/me` | Bearer | 当前用户完整资料（含设置、收入摘要） |
| POST `/me/verification` | Bearer | 实名认证 Mock：标记 isVerified=true；真实核验后续接入 |

**发现与目录**
| GET `/categories` | 可选 | 一级品类（受限标记不对外，精选逻辑服务端） |
| GET `/coffee-drinks` | 可选 | 饮品目录（价格分） |
| GET `/sharers` | 可选 | query: category?、industry?、q?、afterId?、limit?；运营排序；健康品类不进精选；分页 |
| GET `/sharers/:id` | 可选 | 资料、主题、30 天时段、评分、完成次数、按时率、响应中位数、评价；**不含会议链接** |

**我的资料与分享中心**
| PUT `/me/profile` | Bearer | name/title/company/avatar/declarationNote/highlights |
| PUT `/me/themes` | Bearer | 全量替换 ≤3；categoryId 必填；includes/excludes |
| PUT `/me/signature-drink` | Bearer | drinkId；已发邀请保留快照 |
| PUT `/me/topic-swap-settings` | Bearer | accepts、weeklyLimit ∈ {1,2,3,5} |
| GET/PUT `/me/slots` | Bearer | 未来 30 天；label 唯一；开放分享期间至少一个可用 |
| PUT `/me/meeting-link` | Bearer | https meeting.tencent.com 校验 |
| PUT `/me/sharing` | Bearer | open/close；开放前服务端校验就绪六项 |
| GET `/me/sharing-center` | Bearer | 公开资料预览、主题、饮品、时段、互换设置、会议链接、收入摘要（待结算/已结算） |
| PUT `/me/settings` | Bearer | 外观主题/日历同步/会议就绪/触感 |

**邀请与会话**
| POST `/invitations/coffee` | Bearer | sharerId、themeId、question(20~300)、slotIds(1~3) → 创建待回应，不付款不占时段 |
| POST `/invitations/topic-swaps` | Bearer | requestedThemeId、offeredThemeId、question、offering、slotIds；校验互换开启、周额度≤3、并发≤2、7 天冷却 |
| GET `/sessions` | Bearer | query: direction(sent/incoming)、filter(all/pending/payment/scheduled/completed)、afterId、limit |
| GET `/sessions/:id` | Bearer | 仅参与双方；含会议链接（已确认后） |
| POST `/sessions/:id/accept` | Bearer(接收方) | confirmedSlotId、receiverQuestion?（互换必填≥8 字）；事务内校验并占用时段；咖啡→2h 付款期限 |
| POST `/sessions/:id/decline` | Bearer(接收方) | reason ∈ 4 标准原因；记录冷却 |
| POST `/sessions/:id/slots/resubmit` | Bearer(发起人) | 重选时段 → 回到 pendingResponse，重启 12h |
| POST `/sessions/:id/cancel` | Bearer(双方) | 按状态机：已付款订单开始前取消→退款；释放时段 |

**支付**
| POST `/sessions/:id/payments` | Bearer(发起人) | method(wechat/alipay)；返回支付参数/模拟收银台；幂等（Idempotency-Key） |
| POST `/sessions/:id/payments/callback` | Provider 签名 | 支付回调；幂等处理；成功后生成订单、booked |
| POST `/sessions/:id/payments/refund` | 内部/运营 | 全额原路退款；退款订单不计平台收入 |

**评价、投诉与通知**
| POST `/sessions/:id/review` | Bearer | rating(1..5)、tag、comment；咖啡：发起人评分享者+分享者轻反馈；互换双盲 |
| POST `/sessions/:id/complaint` | Bearer | category、description；仅 completed 且 24h 内 |
| GET `/me/notifications` | Bearer | 待办与通知列表；未读数 |
| POST `/me/notifications/read` | Bearer | 标记已读 |

**运营后台（预留，不在 MVP 实施）**：`/admin/users`、`/admin/sessions`、`/admin/complaints`、`/admin/settlements`、`/admin/categories`、`/admin/metrics`。

## 7. 错误码、认证、限流、幂等与分页规范

- **统一响应**：成功 `{ data }`；失败 `{ error: { code, message, details? } }`；HTTP 语义与业务错误码分离。
- **错误码命名空间**：`AUTH_*`（含 RATE_LIMITED、CODE_EXPIRED、CODE_ATTEMPT_LIMIT）、`VALIDATION_*`、`NOT_FOUND`、`CONFLICT_SLOT_TAKEN`、`STATE_INVALID`、`QUOTA_EXCEEDED`（周额度/并发/冷却）、`PAYMENT_*`、`IDEMPOTENCY_REPLAY`、`MEETING_LINK_INVALID`。
- **认证**：Bearer JWT（access 2h / refresh 14d，Redis 白名单）；登录接口不得暴露账号是否存在（失败统一文案）。
- **限流**：`@nestjs/throttler`；验证码发送 60s/次/手机号、单日上限；登录错误次数阶梯限制。
- **幂等**：支付下单/回调/退款使用 `Idempotency-Key`（Redis 去重 + DB 唯一约束兜底）；回调重复投递安全。
- **分页**：客户端游标 `afterId + limit`（默认 20，≤50）；响应含 `nextCursor`。
- **并发与一致性**：时段确认在事务内 `SELECT ... FOR UPDATE` + Redis 锁；金额计算用服务端快照，禁止客户端传价。

## 8. 定时任务与通知

`@nestjs/schedule`（cron + interval，幂等）：
1. `pendingResponse` 12h 未处理 → `expired`；
2. `acceptedPendingPayment` 2h 未付款 → `expired` + 释放时段；
3. 到达 `endsAt` → `completed`（自动完成，开放反馈）；
4. 完成后 24h 售后窗口关闭 → 可结算；
5. 每周结算：按周汇总已完成且无投诉订单，平台 15% / 分享者 85%，生成 settlement；
6. 互换周额度与冷却期按周重置/校验（查询即可，无需物理重置）；
7. 通知事件：新邀请、即将过期、被接受/婉拒、需重选时间、付款期限、付款成功、开始前 24h/1h、取消退款、互换反馈、结算完成。

## 9. 可观测性

**本次定稿（回填 tech-stack 待定项）**：
- 健康检查：`@nestjs/terminus`，`GET /health`（含 DB/Redis 探针）；
- 结构化日志：pino，统一请求关联 ID（`reqId`）、错误码、耗时；日志禁止密码/验证码/令牌/完整手机号；
- 指标：prom-client 暴露 `GET /metrics`（HTTP 计数/延迟、状态机计数）；CloudBase 内置监控兜底；
- APM：MVP 不引入独立 APM 服务，接入真实短信/支付/会议后评估腾讯云 APM（列为 P1）。

## 10. 测试与验收

- 单元：状态机、额度/冷却、金额、幂等、校验规则（Jest）；
- 集成：基于 Docker Compose PostgreSQL 的 Supertest 端到端（注册→发现→邀请→接受→付款→预约→完成→评价）；
- 契约：`@nestjs/swagger` 生成 OpenAPI 3 并与本文件接口清单逐项核对；
- 安全门禁：RBAC/越权（他人会话不可访问）、限流、日志脱敏、UTF-8 中文无 `\uXXXX`；
- 验收对照：[PRD.md](../../PRD.md) §12 全量验收标准逐条映射。
