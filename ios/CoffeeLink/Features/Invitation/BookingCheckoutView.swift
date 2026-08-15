import SwiftUI

enum PaymentResult: String {
    case success
    case failure
    case cancelled
}

enum CheckoutPaymentResolution {
    static func result(for requested: PaymentResult, didPersist: Bool) -> PaymentResult {
        requested == .success && !didPersist ? .failure : requested
    }
}

struct BookingCheckoutView: View {
    let store: AppStore
    let sessionID: String
    let forcedResult: PaymentResult?
    let onCompleted: (String) -> Void
    let onDismiss: () -> Void
    @State private var method: PaymentMethod = .wechat
    @State private var result: PaymentResult?
    @State private var paymentError: String?

    init(store: AppStore, sessionID: String, forcedResult: PaymentResult? = nil, onCompleted: @escaping (String) -> Void, onDismiss: @escaping () -> Void) {
        self.store = store
        self.sessionID = sessionID
        self.forcedResult = forcedResult
        self.onCompleted = onCompleted
        self.onDismiss = onDismiss
    }

    var body: some View {
        if let session = store.session(id: sessionID) {
            VStack(spacing: 0) {
                navigationBar
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 16) {
                        acceptanceNotice
                        conversationSummary(session)
                        feeBreakdown(session)
                        paymentMethods
                        refundGuarantee
                        if let result { paymentResultCard(result) }
                        if let paymentError { Text(paymentError).font(.system(size: 12, weight: .medium)).foregroundStyle(.red).padding(12).frame(maxWidth: .infinity, alignment: .leading).background(Color.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }
                    }
                    .padding(20).padding(.bottom, 100)
                }
            }
            .background(CoffeeLinkTheme.background)
            .navigationBarHidden(true)
            .safeAreaInset(edge: .bottom, spacing: 0) { actionBar(session) }
            .onAppear { presentForcedResultIfNeeded(session) }
            .accessibilityElement(children: .contain)
            .accessibilityIdentifier("checkout.screen")
        }
    }

    private var navigationBar: some View {
        ZStack {
            Text("请喝咖啡并确认预约").font(.system(size: 18, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack { Button(action: onDismiss) { Image(systemName: "chevron.left").font(.system(size: 17, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText).frame(width: 44, height: 44) }.buttonStyle(.plain).accessibilityIdentifier("payment.back"); Spacer() }
        }.frame(height: 56).overlay(alignment: .bottom) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private var acceptanceNotice: some View {
        HStack(spacing: 11) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 17))
                .foregroundStyle(CoffeeLinkTheme.accent)
                .frame(width: 22)
            VStack(alignment: .leading, spacing: 4) {
                Text("分享者已接受您的邀请，请在 2 小时内完成支付")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text("支付成功后立即生成正式对谈订单并确认时段，超时未付将自动释放该时段。")
                    .font(.system(size: 11))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    .lineSpacing(2)
            }
        }
        .padding(14)
        .frame(minHeight: 84)
        .background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.5), lineWidth: 1))
    }

    private func conversationSummary(_ session: ChatSession) -> some View {
        CoffeeCard {
            VStack(alignment: .leading, spacing: 14) {
                Text("对谈与饮品信息")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                HStack(alignment: .top, spacing: 12) {
                    CoffeeAvatar(name: session.receiverName, imageURL: session.receiverAvatarURL, size: 48)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(session.themeTitle)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.primaryText)
                            .lineLimit(1)
                        Text("分享者：\(session.receiverName) (\(session.receiverTitle))")
                            .font(.system(size: 12))
                            .foregroundStyle(CoffeeLinkTheme.secondaryText)
                            .lineLimit(1)
                    }
                }
                VStack(alignment: .leading, spacing: 5) {
                    Text("您提交的咨询问题：")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                    Text(session.question)
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        .lineSpacing(2)
                        .lineLimit(2)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                Divider().overlay(CoffeeLinkTheme.border)
                VStack(spacing: 10) {
                    summaryRow("已确认时段", value: session.confirmedSlot ?? session.candidateSlots.first ?? "10月24日 14:00 - 14:30", symbol: "calendar")
                    summaryRow("对谈时长", value: "30 分钟 (1对1)", symbol: "clock")
                    summaryRow("会议方式", value: "腾讯会议 (付款后展示链接)", symbol: "video")
                }
            }
            .frame(maxWidth: .infinity, minHeight: 284, alignment: .topLeading)
        }
    }

    private func summaryRow(_ title: String, value: String, symbol: String) -> some View {
        HStack(spacing: 7) {
            Image(systemName: symbol).font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 16)
            Text(title).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            Spacer(minLength: 8)
            Text(value).font(.system(size: 12, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText).lineLimit(1)
        }
    }

    private func feeBreakdown(_ session: ChatSession) -> some View {
        CoffeeCard {
            VStack(alignment: .leading, spacing: 11) {
                Text("费用明细").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                HStack {
                    Text("\(session.coffeeDrink?.icon ?? "☕")  签名饮品：\(session.coffeeDrink?.name ?? "电子咖啡")")
                        .font(.system(size: 13))
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    Spacer()
                    Text("¥\(decimalText(session.price ?? 0)).00").font(.system(size: 13, weight: .semibold, design: .monospaced)).foregroundStyle(CoffeeLinkTheme.primaryText)
                }
                HStack {
                    Text("平台服务费").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText.opacity(0.72))
                    Spacer()
                    Text("免收发起人服务费").font(.system(size: 12, weight: .medium)).foregroundStyle(CoffeeLinkTheme.success)
                }
                Divider().overlay(CoffeeLinkTheme.border)
                HStack {
                    Text("实付金额").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                    Spacer()
                    Text("¥\(decimalText(session.price ?? 0)).00").font(.system(size: 20, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent)
                }
            }
            .frame(maxWidth: .infinity, minHeight: 140, alignment: .topLeading)
        }
    }

    private var refundGuarantee: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "shield.checkered").font(.system(size: 16)).foregroundStyle(CoffeeLinkTheme.success)
            Text("履约与退款保障：")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.success)
            + Text("对谈开始前取消全额原路退款；若分享者未到场或会议失效全额退款并记异常；完成后24小时内支持售后反馈。")
                .font(.system(size: 11))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
        }
        .padding(14)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var paymentMethods: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("支付方式").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            ForEach(PaymentMethod.allCases, id: \.self) { item in Button { method = item } label: { HStack { Image(systemName: item == .wechat ? "message.fill" : "yensign.circle.fill").foregroundStyle(item == .wechat ? CoffeeLinkTheme.success : .blue).frame(width: 30); Text(item.label).font(.system(size: 14, weight: .semibold)); Spacer(); Image(systemName: method == item ? "checkmark.circle.fill" : "circle").foregroundStyle(method == item ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(15).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(method == item ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain).accessibilityIdentifier("payment.\(item.rawValue)") }
        }
    }

    private func paymentResultCard(_ result: PaymentResult) -> some View {
        let configuration: (String, String, Color) = switch result { case .success: ("支付成功", "订单已确认，正在前往对谈详情。", CoffeeLinkTheme.success); case .failure: ("支付失败", "未能完成支付，请更换支付方式后重试。", .red); case .cancelled: ("已取消支付", "本次支付已取消，订单仍为待付款状态。", CoffeeLinkTheme.secondaryText) }
        return VStack(alignment: .leading, spacing: 5) { Text(configuration.0).font(.system(size: 15, weight: .bold)); Text(configuration.1).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText) }.foregroundStyle(configuration.2).padding(14).frame(maxWidth: .infinity, alignment: .leading).background(configuration.2.opacity(0.12), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
    }

    private func actionBar(_ session: ChatSession) -> some View {
        HStack { VStack(alignment: .leading, spacing: 2) { Text("实付总额").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText); Text("¥\(decimalText(session.price ?? 0)).00").font(.system(size: 21, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }; Spacer(); CoffeePrimaryButton(title: result == .success ? "查看对谈详情" : result == .failure ? "重新支付" : "立即支付", accessibilityIdentifier: result == .success ? "payment.view-session" : "payment.confirm") { if result == .success { onCompleted(session.id) } else { pay(session) } }.frame(width: 200) }.padding(.horizontal, 16).padding(.vertical, 10).background(CoffeeLinkTheme.background.opacity(0.98)).overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private func pay(_ session: ChatSession) {
        let requested = forcedResult ?? .success
        guard requested == .success else {
            result = requested
            paymentError = nil
            return
        }
        let didPersist = store.completePayment(id: session.id, method: method)
        result = CheckoutPaymentResolution.result(for: requested, didPersist: didPersist)
        guard didPersist else {
            paymentError = store.lastErrorMessage ?? "支付信息保存失败，请稍后重试。"
            return
        }
        paymentError = nil
    }

    private func presentForcedResultIfNeeded(_ session: ChatSession) {
        guard let forcedResult else { return }
        if forcedResult == .success { pay(session) }
        else { result = forcedResult }
    }
}
