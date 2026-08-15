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
                        orderHeader(session)
                        coffeeCard(session)
                        participantsCard(session)
                        timeCard(session)
                        refundCard
                        paymentMethods
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
            Text("确认邀请付款").font(.system(size: 19, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack { Button(action: onDismiss) { Image(systemName: "chevron.left").font(.system(size: 17, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText).frame(width: 44, height: 44) }.buttonStyle(.plain).accessibilityIdentifier("payment.back"); Spacer() }
        }.frame(height: 56).overlay(alignment: .bottom) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private func orderHeader(_ session: ChatSession) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Text("对方已接受你的电子咖啡邀请").font(.system(size: 19, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            Text("请在支付时限内完成付款，确认后将为你保留 30 分钟对谈时段。").font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2)
            if let deadline = session.paymentDeadline { CoffeeBadge(deadline, tone: .accent) }
        }
    }

    private func coffeeCard(_ session: ChatSession) -> some View {
        HStack(spacing: 13) {
            Image(systemName: "cup.and.saucer.fill").font(.system(size: 25)).foregroundStyle(CoffeeLinkTheme.primaryText).frame(width: 52, height: 52).background(CoffeeLinkTheme.accent.opacity(0.16), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
            VStack(alignment: .leading, spacing: 4) { Text(session.coffeeDrink?.name ?? "签名咖啡").font(.system(size: 16, weight: .bold)); Text(session.coffeeDrink?.description ?? "对谈确认后由平台代为送达").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(2) }.foregroundStyle(CoffeeLinkTheme.primaryText)
            Spacer()
            Text("¥\(decimalText(session.price ?? 0))").font(.system(size: 22, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent)
        }.padding(16).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func participantsCard(_ session: ChatSession) -> some View {
        CoffeeCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("本次对谈").font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                HStack { CoffeeAvatar(name: session.senderName, imageURL: session.senderAvatarURL, size: 38); Text(session.senderName).font(.system(size: 14, weight: .semibold)); Spacer(); Image(systemName: "arrow.left.and.right").foregroundStyle(CoffeeLinkTheme.accent); Spacer(); Text(session.receiverName).font(.system(size: 14, weight: .semibold)); CoffeeAvatar(name: session.receiverName, imageURL: session.receiverAvatarURL, size: 38) }.foregroundStyle(CoffeeLinkTheme.primaryText)
                Divider().overlay(CoffeeLinkTheme.border)
                Text(session.themeTitle).font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                Text("固定 30 分钟 · " + (session.confirmedSlot ?? session.candidateSlots.first ?? "待确认时段")).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
        }
    }

    private func timeCard(_ session: ChatSession) -> some View {
        HStack(spacing: 11) { Image(systemName: "clock.fill").foregroundStyle(CoffeeLinkTheme.accent); VStack(alignment: .leading, spacing: 3) { Text("已确认的对谈时段").font(.system(size: 12, weight: .semibold)); Text(session.confirmedSlot ?? session.candidateSlots.first ?? "30 分钟").font(.system(size: 14, weight: .bold)) }.foregroundStyle(CoffeeLinkTheme.primaryText); Spacer(); Text("30 min").font(.system(size: 12, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }.padding(14).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var refundCard: some View {
        HStack(alignment: .top, spacing: 10) { Image(systemName: "shield.checkered").foregroundStyle(CoffeeLinkTheme.success); VStack(alignment: .leading, spacing: 4) { Text("退款保障").font(.system(size: 13, weight: .bold)); Text("若对方未按约完成对谈，可在订单详情申请售后与退款。平台将在核实后原路退回。 ").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2) }.foregroundStyle(CoffeeLinkTheme.primaryText) }.padding(14).background(CoffeeLinkTheme.success.opacity(0.08), in: RoundedRectangle(cornerRadius: 14, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(CoffeeLinkTheme.success.opacity(0.25), lineWidth: 1))
    }

    private var paymentMethods: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("选择支付方式").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            ForEach(PaymentMethod.allCases, id: \.self) { item in Button { method = item } label: { HStack { Image(systemName: item == .wechat ? "message.fill" : "yensign.circle.fill").foregroundStyle(item == .wechat ? CoffeeLinkTheme.success : .blue).frame(width: 30); Text(item.label).font(.system(size: 14, weight: .semibold)); Spacer(); Image(systemName: method == item ? "checkmark.circle.fill" : "circle").foregroundStyle(method == item ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(15).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(method == item ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain).accessibilityIdentifier("payment.\(item.rawValue)") }
        }
    }

    private func paymentResultCard(_ result: PaymentResult) -> some View {
        let configuration: (String, String, Color) = switch result { case .success: ("支付成功", "订单已确认，正在前往对谈详情。", CoffeeLinkTheme.success); case .failure: ("支付失败", "未能完成支付，请更换支付方式后重试。", .red); case .cancelled: ("已取消支付", "本次支付已取消，订单仍为待付款状态。", CoffeeLinkTheme.secondaryText) }
        return VStack(alignment: .leading, spacing: 5) { Text(configuration.0).font(.system(size: 15, weight: .bold)); Text(configuration.1).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText) }.foregroundStyle(configuration.2).padding(14).frame(maxWidth: .infinity, alignment: .leading).background(configuration.2.opacity(0.12), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
    }

    private func actionBar(_ session: ChatSession) -> some View {
        HStack { VStack(alignment: .leading, spacing: 2) { Text("应付金额").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText); Text("¥\(decimalText(session.price ?? 0))").font(.system(size: 21, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }; Spacer(); CoffeePrimaryButton(title: result == .success ? "查看对谈详情" : result == .failure ? "重新支付" : "确认支付", accessibilityIdentifier: result == .success ? "payment.view-session" : "payment.confirm") { if result == .success { onCompleted(session.id) } else { pay(session) } }.frame(width: 205) }.padding(.horizontal, 20).padding(.vertical, 10).background(CoffeeLinkTheme.background.opacity(0.98)).overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
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
