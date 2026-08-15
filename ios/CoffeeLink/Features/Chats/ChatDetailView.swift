import SwiftUI

struct ChatDetailView: View {
    let store: AppStore
    let sessionID: String
    let onBack: () -> Void
    let openCheckout: (String) -> Void
    let presentSheet: (SheetRoute) -> Void
    @State private var cancellationSessionID: String?

    var body: some View {
        if let session = store.session(id: sessionID) {
            VStack(spacing: 0) {
                navigationBar
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 15) {
                        statusHeader(session)
                        counterpartCard(session)
                        topicCard(session)
                        if session.status == .booked || session.status == .swapScheduled { meetingCard(session) }
                        if session.type == .coffee { coffeeCard(session) }
                        if let decline = session.declineReason { detailCard(title: "婉拒原因", detail: decline, color: .red) }
                        if let review = session.review { detailCard(title: "我的评价 · \(review.rating) 星", detail: review.comment.isEmpty ? review.tag ?? "已提交评价" : review.comment, color: CoffeeLinkTheme.success) }
                        if let complaint = session.complaintReason { detailCard(title: "售后申请已提交", detail: complaint, color: .orange) }
                        actionArea(session)
                    }.padding(20).padding(.bottom, 28)
                }
            }
            .background(CoffeeLinkTheme.background)
            .navigationBarHidden(true)
            .confirmationDialog("确认取消本次对谈？", isPresented: cancelConfirmationIsPresented, titleVisibility: .visible) {
                Button("确认取消对谈", role: .destructive) {
                    guard let cancellationSessionID else { return }
                    self.cancellationSessionID = nil
                    _ = store.cancelSession(id: cancellationSessionID)
                }
                Button("继续保留", role: .cancel) { cancellationSessionID = nil }
            } message: {
                Text("取消后该时段将被释放，且无法在当前订单中恢复。")
            }
            .accessibilityIdentifier("chat-detail.\(session.id)")
        } else {
            ContentUnavailableView("未找到对谈", systemImage: "bubble.left.and.exclamationmark")
        }
    }

    private var navigationBar: some View {
        ZStack { Text("对谈详情").font(.system(size: 19, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText); HStack { Button(action: onBack) { Image(systemName: "chevron.left").font(.system(size: 17, weight: .semibold)).frame(width: 44, height: 44).foregroundStyle(CoffeeLinkTheme.primaryText) }.buttonStyle(.plain); Spacer() } }.frame(height: 56).overlay(alignment: .bottom) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private func statusHeader(_ session: ChatSession) -> some View {
        VStack(spacing: 21) {
            Label(statusPillTitle(session), systemImage: statusPillSymbol(session.status))
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(statusColor(session.status))
                .padding(.horizontal, 16)
                .padding(.vertical, 7)
                .background(statusColor(session.status).opacity(0.12), in: Capsule())
                .overlay(Capsule().stroke(statusColor(session.status).opacity(0.36), lineWidth: 1))
            progressTimeline(session)
        }
        .frame(maxWidth: .infinity)
        .overlay {
            Text(statusTitle(session))
                .font(.system(size: 1))
                .foregroundStyle(.clear)
                .frame(width: 1, height: 1)
                .accessibilityHidden(false)
        }
    }

    private func progressTimeline(_ session: ChatSession) -> some View {
        let accepted = session.status != .pendingResponse && session.status != .needsNewTime && session.status != .declined
        let ready = session.status == .booked || session.status == .swapScheduled || session.status == .completed
        let completed = session.status == .completed
        return HStack(spacing: 0) {
            timelineStep(title: session.type == .coffee ? "发起邀请" : "提出互换", isComplete: true, color: CoffeeLinkTheme.accent)
            timelineConnector(isComplete: accepted, color: CoffeeLinkTheme.accent)
            timelineStep(title: "确认时间", isComplete: accepted, color: CoffeeLinkTheme.accent)
            timelineConnector(isComplete: ready, color: CoffeeLinkTheme.success)
            timelineStep(title: session.type == .coffee ? "完成付款" : "就绪", isComplete: ready, color: CoffeeLinkTheme.success)
            timelineConnector(isComplete: completed, color: CoffeeLinkTheme.success)
            timelineStep(title: "对谈评价", isComplete: completed, color: CoffeeLinkTheme.success)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 17)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func timelineStep(title: String, isComplete: Bool, color: Color) -> some View {
        VStack(spacing: 5) {
            ZStack {
                Circle().fill(isComplete ? color : CoffeeLinkTheme.elevatedSurface).frame(width: 15, height: 15)
                if isComplete { Image(systemName: "checkmark").font(.system(size: 8, weight: .bold)).foregroundStyle(.white) }
            }
            Text(title)
                .font(.system(size: 10, weight: isComplete ? .bold : .regular))
                .foregroundStyle(isComplete ? color : CoffeeLinkTheme.secondaryText)
                .lineLimit(1)
        }
        .frame(width: 62)
    }

    private func timelineConnector(isComplete: Bool, color: Color) -> some View {
        Rectangle()
            .fill(isComplete ? color : CoffeeLinkTheme.border)
            .frame(maxWidth: .infinity)
            .frame(height: 2)
            .offset(y: -10)
    }

    private func counterpartCard(_ session: ChatSession) -> some View {
        let isSent = session.senderID == store.snapshot.currentUser.id
        let name = isSent ? session.receiverName : session.senderName
        let title = isSent ? session.receiverTitle : session.senderTitle
        let avatar = isSent ? session.receiverAvatarURL : session.senderAvatarURL
        return CoffeeCard { HStack(spacing: 14) { CoffeeAvatar(name: name, imageURL: avatar, size: 54); VStack(alignment: .leading, spacing: 5) { HStack(spacing: 6) { Text(name).font(.system(size: 16, weight: .bold)); Text("身份已核验").font(.system(size: 10, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent).padding(.horizontal, 7).padding(.vertical, 4).background(CoffeeLinkTheme.accent.opacity(0.12), in: Capsule()) }; Text(title).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1) }.foregroundStyle(CoffeeLinkTheme.primaryText); Spacer() } }
    }

    private func topicCard(_ session: ChatSession) -> some View {
        CoffeeCard { VStack(alignment: .leading, spacing: 12) { HStack { Text("对谈议题与交流内容").font(.system(size: 15, weight: .bold)); Spacer(); typeBadge(session) }.foregroundStyle(CoffeeLinkTheme.primaryText); detailBlock(title: "探讨主题：\(session.themeTitle)", detail: session.themeDescription ?? "围绕此主题进行固定 30 分钟的深度交流。", tint: CoffeeLinkTheme.accent).frame(minHeight: 84); detailBlock(title: "\(session.senderName) 提出的咨询问题", detail: session.question, tint: CoffeeLinkTheme.primaryText).frame(minHeight: 118); if session.type == .topicSwap, let title = session.offeredThemeTitle { detailBlock(title: "交换主题：\(title)", detail: session.offering ?? session.offeredThemeDescription ?? "主题互换", tint: .blue); if let receiverQuestion = session.receiverQuestion { detailBlock(title: "\(session.receiverName) 补充的问题", detail: receiverQuestion, tint: .blue) } } } }
    }

    private func meetingCard(_ session: ChatSession) -> some View {
        VStack(alignment: .leading, spacing: 12) { HStack { Label("腾讯会议接入信息", systemImage: "video.fill").font(.system(size: 15, weight: .bold)); Spacer(); Text("准时接入").font(.system(size: 10, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent).padding(.horizontal, 8).padding(.vertical, 4).background(CoffeeLinkTheme.accent.opacity(0.12), in: Capsule()) }.foregroundStyle(CoffeeLinkTheme.primaryText); detailBlock(title: "已确认时段", detail: session.confirmedSlot ?? session.candidateSlots.first ?? "待确认", tint: CoffeeLinkTheme.primaryText); detailBlock(title: "会议号", detail: session.meetingID, tint: CoffeeLinkTheme.accent); Button { presentSheet(.meeting(sessionID: session.id)) } label: { Label("进入腾讯会议房间", systemImage: "video").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain).accessibilityIdentifier("meeting.enter") }.padding(16).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.55), lineWidth: 1))
    }

    private func coffeeCard(_ session: ChatSession) -> some View {
        HStack(spacing: 12) { Image(systemName: "cup.and.saucer.fill").font(.system(size: 24)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 45, height: 45).background(CoffeeLinkTheme.accent.opacity(0.13), in: RoundedRectangle(cornerRadius: 12, style: .continuous)); VStack(alignment: .leading, spacing: 4) { Text("签名饮品：\(session.coffeeDrink?.name ?? "电子咖啡")").font(.system(size: 14, weight: .bold)); Text(session.coffeeDrink?.description ?? "接受后付款并锁定对谈时段").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(2) }.foregroundStyle(CoffeeLinkTheme.primaryText); Spacer(); Text("¥\(decimalText(session.price ?? 0))").font(.system(size: 20, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }.padding(14).background(CoffeeLinkTheme.accent.opacity(0.10), in: RoundedRectangle(cornerRadius: 14, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.3), lineWidth: 1))
    }

    @ViewBuilder private func actionArea(_ session: ChatSession) -> some View {
        let isSent = session.senderID == store.snapshot.currentUser.id
        switch session.status {
        case .pendingResponse, .needsNewTime:
            if isSent { destructiveButton("取消邀请", symbol: "xmark") { _ = store.cancelSession(id: session.id) } } else { HStack(spacing: 10) { Button { presentSheet(.declineInvitation(session.id)) } label: { Label("婉拒邀请", systemImage: "xmark.circle").font(.system(size: 13, weight: .bold)).foregroundStyle(.red).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain); Button { presentSheet(.acceptInvitation(session.id)) } label: { Label("接受邀请", systemImage: "checkmark").font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain) } }
        case .acceptedPendingPayment:
            if isSent { Button { openCheckout(session.id) } label: { Label("立即完成支付（¥\(decimalText(session.price ?? 0))）", systemImage: "creditcard").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(maxWidth: .infinity).padding(.vertical, 14).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 13, style: .continuous)) }.buttonStyle(.plain) } else { readonly("等待对方付款") }
        case .booked, .swapScheduled:
            HStack(spacing: 10) { Button { presentSheet(.meeting(sessionID: session.id)) } label: { Label("进入会议", systemImage: "video").font(.system(size: 13, weight: .bold)).foregroundStyle(.blue).frame(maxWidth: .infinity).padding(.vertical, 13).background(.blue.opacity(0.10), in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain); destructiveButton("取消对谈", symbol: "xmark") { cancellationSessionID = session.id } }
        case .completed:
            HStack(spacing: 10) { Button { presentSheet(.review(session.id)) } label: { Label(session.review == nil ? "完成评价" : "查看评价", systemImage: "star").font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain); Button { presentSheet(.complaint(session.id)) } label: { Label("投诉", systemImage: "exclamationmark.shield").font(.system(size: 13, weight: .bold)).foregroundStyle(.red).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain) }
        case .declined, .expired, .cancelled, .inAfterSale, .refunding:
            readonly(session.status == .cancelled ? "邀请已取消" : session.statusLabel)
        }
    }

    private func destructiveButton(_ title: String, symbol: String, action: @escaping () -> Void) -> some View { Button(action: action) { Label(title, systemImage: symbol).font(.system(size: 13, weight: .bold)).foregroundStyle(.red).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain) }
    private var cancelConfirmationIsPresented: Binding<Bool> {
        Binding(
            get: { cancellationSessionID != nil },
            set: { if !$0 { cancellationSessionID = nil } }
        )
    }
    private func readonly(_ text: String) -> some View { Text(text).font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.secondaryText).frame(maxWidth: .infinity).padding(.vertical, 13).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }
    private func detailCard(title: String, detail: String, color: Color) -> some View { detailBlock(title: title, detail: detail, tint: color).padding(14).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous)) }
    private func detailBlock(title: String, detail: String, tint: Color) -> some View { VStack(alignment: .leading, spacing: 5) { Text(title).font(.system(size: 12, weight: .bold)).foregroundStyle(tint); Text(detail).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2).fixedSize(horizontal: false, vertical: true) }.padding(12).frame(maxWidth: .infinity, alignment: .leading).background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 11, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 11, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1)) }
    private func typeBadge(_ session: ChatSession) -> some View { Text(session.type == .coffee ? "电子咖啡 ¥\(decimalText(session.price ?? 0))" : "主题互换 0元").font(.system(size: 11, weight: .bold)).foregroundStyle(session.type == .coffee ? CoffeeLinkTheme.accent : .blue).padding(.horizontal, 8).padding(.vertical, 5).background((session.type == .coffee ? CoffeeLinkTheme.accent : .blue).opacity(0.12), in: RoundedRectangle(cornerRadius: 7, style: .continuous)) }
    private func statusTitle(_ session: ChatSession) -> String { switch session.status { case .pendingResponse, .needsNewTime: return session.senderID == store.snapshot.currentUser.id ? "等待对方回应" : "等待你的回应"; case .acceptedPendingPayment: return session.senderID == store.snapshot.currentUser.id ? "对方已接受，等待你付款" : "等待对方付款"; case .booked, .swapScheduled: return "对谈已排期"; case .completed: return "对谈已完成"; case .declined: return "邀请已婉拒"; case .expired: return "邀请已过期"; case .cancelled: return "邀请已取消"; case .inAfterSale, .refunding: return "售后处理中" } }
    private func statusPillTitle(_ session: ChatSession) -> String { switch session.status { case .pendingResponse, .needsNewTime: return session.senderID == store.snapshot.currentUser.id ? "待对方回应" : "待您回应"; case .acceptedPendingPayment: return session.senderID == store.snapshot.currentUser.id ? "对方已接受 · 请在2小时内付款" : "您已接受 · 待对方付款"; case .booked, .swapScheduled: return "已确认排期 · 即将开始"; case .completed: return "对谈已完成"; case .declined: return "邀请已婉拒"; case .expired, .cancelled: return "对谈已取消"; case .inAfterSale, .refunding: return "售后处理中" } }
    private func statusPillSymbol(_ status: SessionStatus) -> String { switch status { case .booked, .swapScheduled, .completed: "checkmark.circle"; case .acceptedPendingPayment, .pendingResponse, .needsNewTime: "clock"; case .declined, .cancelled, .expired: "exclamationmark.triangle"; case .inAfterSale, .refunding: "exclamationmark.shield" } }
    private func statusSubtitle(_ session: ChatSession) -> String { session.confirmedSlot ?? "固定 \(session.durationMinutes) 分钟，选择双方可用的时段。" }
    private func statusSymbol(_ status: SessionStatus) -> String { switch status { case .booked, .swapScheduled: "calendar.badge.checkmark"; case .completed: "checkmark.circle.fill"; case .declined, .cancelled, .expired: "xmark.circle.fill"; case .inAfterSale, .refunding: "exclamationmark.shield.fill"; case .acceptedPendingPayment: "creditcard.fill"; case .pendingResponse, .needsNewTime: "clock.fill" } }
    private func statusColor(_ status: SessionStatus) -> Color { switch status { case .booked, .swapScheduled, .completed: CoffeeLinkTheme.success; case .declined, .cancelled, .expired: .red; case .inAfterSale, .refunding: .orange; case .acceptedPendingPayment: CoffeeLinkTheme.accent; case .pendingResponse, .needsNewTime: .orange } }
}
