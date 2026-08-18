<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## CoffeeLink 项目说明

- 技术栈与约束：Node.js 24 LTS（目标运行时）+ TypeScript strict + NestJS 模块化单体；详见仓库根 `memory-bank/tech-stack.md`。
- 契约依据：`docs/superpowers/specs/2026-08-16-coffeelink-backend-contract.md`；实施计划：`docs/superpowers/plans/2026-08-16-coffeelink-backend.md`。
- 本地开发 Node 版本可能与目标（24 LTS）不一致，CI 与 CloudBase 部署以 Node 24 LTS 为准。

## 本地快速开始

前置：Node.js 20+（目标 24 LTS）、Docker Desktop。

```bash
cd backend
cp .env.example .env   # 按需修改
docker compose up -d   # PostgreSQL 16（本机映射 5433）、Redis 7（6380）
npx prisma migrate dev
npx prisma db seed
npm run start:dev      # http://localhost:3000，Swagger 文档 /docs
```

测试：

```bash
npm test          # 单元测试
npm run test:e2e  # 端到端测试（需 docker compose 已启动）
```

说明：容器端口映射为 5433/6380，避免与本机已存在的 PostgreSQL/Redis 冲突；本地 PostgreSQL 端口占用情况见 `docker-compose.yml`。

## 演示数据

`npx prisma db seed` 会写入与 iOS 演示一致的数据（8 款饮品、Alex + Elena/David/Sophia/Leo 等 12 用户、6 条演示会话、评价），种子可重复执行（先清空业务表）。

- Alex Chen：`13800000001` / `Pass123456`（当前用户，含演示会话与待处理邀请）
- Elena / David / Sophia / Leo：分享者演示账号（`13800000002` ~ `13800000005` / `Pass123456`）

实名认证为 Mock：`POST /me/verification` 直接置为已实名（真实核验后续接入）。

## iOS 联调（远端模式）

```bash
cd ios && xcodegen generate
xcrun simctl install booted /private/tmp/coffeelink-dd/Build/Products/Debug-iphonesimulator/CoffeeLink.app
xcrun simctl launch booted com.coffeelink.app -remote-api http://127.0.0.1:3000
```

不带 `-remote-api` 时保持本地 Mock 演示模式；带该参数时 App 启动会登录演示账号（13800000001 / Pass123456）并从后端加载数据。
