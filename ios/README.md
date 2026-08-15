# CoffeeLink iOS 原生 App

CoffeeLink 线上职业 Coffee Chat 的 iOS 原生高保真原型，使用 **Swift 6 + SwiftUI** 实现，位于本仓库 `ios` 目录。当前版本为本地 Mock 数据与本地持久化的可独立运行原型，不连接真实后端、短信、支付或腾讯会议服务。

## 技术栈与约束

- Xcode 16.3（已验证），Swift 6 语言模式
- Deployment Target：iOS 17.0，仅支持 iPhone（`TARGETED_DEVICE_FAMILY=1`）
- 无第三方运行时依赖；不使用 WKWebView，全部为纯 SwiftUI
- 深色主题固定（`INFOPLIST_KEY_UIUserInterfaceStyle=Dark`），视觉基准视口为 393 × 852

## 环境准备

安装工程生成器（仅开发工具，不进入 App）：

```bash
brew install xcodegen
```

创建视觉对比专用模拟器（若不存在）：

```bash
xcrun simctl create 'CoffeeLink Visual iPhone 15 Pro' \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-18-4
```

## 生成与构建

```bash
cd ios && xcodegen generate
```

构建（验收设备为 iPhone 16 Pro / iOS 18.4）：

```bash
xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' \
  clean build
```

## 测试

运行完整自动化套件（36 个单元测试 + 38 个 UI 测试，其中 11 个视觉基线）：

```bash
xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.4' \
  test
```

视觉基线应在 393 × 852 的专用模拟器上运行：

```bash
xcodebuild -project ios/CoffeeLink.xcodeproj -scheme CoffeeLink \
  -destination 'platform=iOS Simulator,name=CoffeeLink Visual iPhone 15 Pro,OS=18.4' \
  test
```

## 视觉对比工具

`ios/VisualTests/compare.swift` 对比 Web 参考图与原生截图，输出差异率、叠加图和差分图：

```bash
xcrun swift -module-cache-path /private/tmp/coffeelink-compare-module-cache \
  ios/VisualTests/compare.swift \
  ios/VisualTests/References/01-home.png \
  ios/VisualTests/Captures/01-home.png \
  01-home
```

运行比较器自测：

```bash
ios/VisualTests/test-compare.sh
```

## Mock 演示账号

- 演示手机号：`13800138000`
- 密码：`Pass123456`
- 注册演示验证码：`123456`

## 数据与重置机制

- 正常运行使用本地 JSON 快照（Application Support/CoffeeLink/state.json）与 Keychain（仅保存演示凭据）。
- 删除 App 或删除 `state.json` 即恢复初始演示数据。
- UI 测试默认使用隔离的内存持久化（`-ui-testing` / `-reset-demo`），不会读写真实用户数据。
- 跨进程持久化 UI 测试使用 `-persistent-ui-testing` + `COFFEELINK_RESET_PERSISTENT_DEMO=1`，数据位于 `CoffeeLinkUITests/state.json`，凭据为测试专用文件，不触碰真实 Keychain。
- 视觉测试直达状态使用 `-visual-screen <screen>`，关闭动画并提供稳定的 ready 标识。

## 工程结构

```text
ios/
├── project.yml                     XcodeGen 工程定义
├── CoffeeLink.xcodeproj/           生成的 Xcode 工程
├── CoffeeLink/
│   ├── App/                        App 入口、路由、AppStore 状态源
│   ├── Models/                     领域模型
│   ├── Data/                       确定性 Mock 数据与本地持久化
│   ├── DesignSystem/               主题、组件、表单、Tab Bar
│   ├── Features/                   发现、分享者详情、邀请、付款、对谈、我的、分享中心、认证
│   ├── Resources/                  图标与本地头像资源
├── CoffeeLinkTests/                单元测试
├── CoffeeLinkUITests/              UI 测试（功能流程 + 视觉基线）
└── VisualTests/                    视觉参考、截图、对比工具与报告
```

## 范围边界

- 不实现 NestJS API、数据库或远程账号系统；不发真实短信验证码。
- 不调用微信支付、支付宝或腾讯会议 SDK；不接入推送、埋点或生产级安全策略。
- 演示账号与凭据仅用于本地演示与自动化测试。
