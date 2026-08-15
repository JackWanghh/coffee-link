import SwiftUI

struct ChatsListView: View {
    enum Direction: CaseIterable { case sent, incoming }
    enum Filter: String, CaseIterable { case all = "全部", pending = "待回应", payment = "待付款", scheduled = "已排期", completed = "已完成" }

    let store: AppStore
    @Binding var path: [AppRoute]
    let presentSheet: (SheetRoute) -> Void
    @State private var direction: Direction = .sent
    @State private var filter: Filter = .all

    private var currentUserID: String { store.snapshot.currentUser.id }
    private var sentCount: Int { store.snapshot.sessions.filter { $0.senderID == currentUserID }.count }
    private var incomingCount: Int { store.snapshot.sessions.filter { $0.senderID != currentUserID }.count }
    private var sessions: [ChatSession] {
        store.snapshot.sessions.filter { session in
            let sent = session.senderID == currentUserID
            guard direction == .sent ? sent : !sent else { return false }
            switch filter {
            case .all: return true
            case .pending: return session.status == .pendingResponse || session.status == .needsNewTime
            case .payment: return session.status == .acceptedPendingPayment
            case .scheduled: return session.status == .booked || session.status == .swapScheduled
            case .completed: return session.status == .completed
            }
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 14) {
                directionPicker
                filterPicker
                LazyVStack(spacing: 13) {
                    if sessions.isEmpty { emptyState }
                    ForEach(sessions) { session in sessionCard(session) }
                }
            }.padding(.horizontal, 20).padding(.top, 16).padding(.bottom, 16)
        }
        .background(CoffeeLinkTheme.background)
        .accessibilityIdentifier("chats.screen")
    }

    private var directionPicker: some View {
        HStack(spacing: 4) {
            directionButton(.sent, title: "我发起的邀请（\(sentCount)）")
            directionButton(.incoming, title: "发给我的邀请（\(incomingCount)）")
        }.padding(4).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func directionButton(_ option: Direction, title: String) -> some View {
        Button { direction = option } label: { Text(title).font(.system(size: 13, weight: direction == option ? .bold : .medium)).foregroundStyle(direction == option ? .white : CoffeeLinkTheme.secondaryText).frame(maxWidth: .infinity, minHeight: 36).background(direction == option ? CoffeeLinkTheme.accent : .clear, in: RoundedRectangle(cornerRadius: 9, style: .continuous)) }.buttonStyle(.plain).accessibilityIdentifier(title)
    }

    private var filterPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) { ForEach(Filter.allCases, id: \.rawValue) { item in Button { filter = item } label: { Text(item.rawValue).font(.system(size: 12, weight: filter == item ? .bold : .medium)).foregroundStyle(filter == item ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText).padding(.horizontal, 13).padding(.vertical, 8).background(filter == item ? CoffeeLinkTheme.accent.opacity(0.14) : CoffeeLinkTheme.surface, in: Capsule()).overlay(Capsule().stroke(filter == item ? CoffeeLinkTheme.accent.opacity(0.35) : CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain).accessibilityIdentifier(item.rawValue) } }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) { Image(systemName: "cup.and.saucer").font(.system(size: 29)).foregroundStyle(CoffeeLinkTheme.accent); Text("暂无相关对谈").font(.system(size: 16, weight: .bold)); Text(direction == .sent ? "你还没有发起的邀请。" : "完成分享设置后即可接收邀请。") .font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText).frame(maxWidth: .infinity).padding(.vertical, 50).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func sessionCard(_ session: ChatSession) -> some View {
        let isSent = session.senderID == currentUserID
        let counterpartName = isSent ? session.receiverName : session.senderName
        let counterpartTitle = isSent ? session.receiverTitle : session.senderTitle
        let counterpartAvatar = isSent ? session.receiverAvatarURL : session.senderAvatarURL
        return VStack(alignment: .leading, spacing: 11) {
            HStack { typeBadge(session); Spacer(minLength: 8); statusBadge(session, isSent: isSent) }
            Button { path.append(.chatDetail(session.id)) } label: { HStack(alignment: .top, spacing: 11) {
                CoffeeAvatar(name: counterpartName, imageURL: counterpartAvatar, size: 42)
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) { Text(session.themeTitle).font(.system(size: 14, weight: .bold)).lineLimit(1); Spacer(minLength: 0); Image(systemName: "chevron.right").font(.system(size: 11, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText) }
                    Text(isSent ? "向 \(counterpartName) 请教（\(counterpartTitle)）" : "来自 \(counterpartName)（\(counterpartTitle)）").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
                }.foregroundStyle(CoffeeLinkTheme.primaryText)
            }.frame(maxWidth: .infinity, alignment: .leading) }.buttonStyle(.plain).accessibilityIdentifier(session.id == "ord-in-ecoffee-1" ? "session.incoming-coffee" : "session.\(session.id)")
            VStack(alignment: .leading, spacing: 3) { Text("咨询议题：").font(.system(size: 11, weight: .bold)) + Text(session.question).font(.system(size: 11)); }.foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(2).lineSpacing(2).padding(10).frame(maxWidth: .infinity, alignment: .leading).background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 11, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 11, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            HStack { Label(session.confirmedSlot.map { "已定时间：\($0)" } ?? "候选时段：\(session.candidateSlots.prefix(2).joined(separator: " / "))", systemImage: "calendar").font(.system(size: 11)).lineLimit(1); Spacer(minLength: 5); Label("\(session.durationMinutes)分钟", systemImage: "clock").font(.system(size: 11)) }.foregroundStyle(CoffeeLinkTheme.secondaryText).padding(.top, 2)
            actionRow(session, isSent: isSent)
        }
        .padding(15).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    @ViewBuilder private func typeBadge(_ session: ChatSession) -> some View {
        if session.type == .coffee { Label("电子咖啡 · \(session.coffeeDrink?.name ?? "拿铁") ¥\(decimalText(session.price ?? 0))", systemImage: "cup.and.saucer.fill").font(.system(size: 11, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent).padding(.horizontal, 8).padding(.vertical, 5).background(CoffeeLinkTheme.accent.opacity(0.13), in: RoundedRectangle(cornerRadius: 7, style: .continuous)) } else { Label("主题互换 · 0元对等", systemImage: "arrow.triangle.2.circlepath").font(.system(size: 11, weight: .bold)).foregroundStyle(.blue).padding(.horizontal, 8).padding(.vertical, 5).background(.blue.opacity(0.12), in: RoundedRectangle(cornerRadius: 7, style: .continuous)) }
    }

    private func statusBadge(_ session: ChatSession, isSent: Bool) -> some View {
        let configuration: (String, Color) = switch session.status {
        case .pendingResponse, .needsNewTime: (isSent ? "待对方回应" : "待您回应", .orange)
        case .acceptedPendingPayment: (isSent ? "对方已接受 · 待您付款" : "您已接受 · 待对方付款", CoffeeLinkTheme.accent)
        case .booked, .swapScheduled: ("已排期 · 即将开始", CoffeeLinkTheme.success)
        case .completed: ("对谈已完成", CoffeeLinkTheme.success)
        case .declined: ("已婉拒", .red)
        case .expired: ("已过期", CoffeeLinkTheme.secondaryText)
        case .inAfterSale, .refunding: (session.statusLabel, .orange)
        case .cancelled: ("已取消", CoffeeLinkTheme.secondaryText)
        }
        return Text(configuration.0).font(.system(size: 10, weight: .bold)).foregroundStyle(configuration.1).padding(.horizontal, 8).padding(.vertical, 5).background(configuration.1.opacity(0.12), in: RoundedRectangle(cornerRadius: 6, style: .continuous))
    }

    @ViewBuilder private func actionRow(_ session: ChatSession, isSent: Bool) -> some View {
        if isSent && session.status == .acceptedPendingPayment {
            Button { path.append(.checkout(session.id)) } label: { Label("立即支付 ¥\(decimalText(session.price ?? 0)) 并锁定对谈", systemImage: "creditcard").font(.system(size: 13, weight: .bold)).frame(maxWidth: .infinity).padding(.vertical, 12).foregroundStyle(.white).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 12, style: .continuous)) }.buttonStyle(.plain).accessibilityIdentifier("session.pay.\(session.id)")
        } else if !isSent && (session.status == .pendingResponse || session.status == .needsNewTime) {
            HStack(spacing: 9) { Button { presentSheet(.declineInvitation(session.id)) } label: { Label("婉拒", systemImage: "xmark.circle").font(.system(size: 12, weight: .bold)).frame(maxWidth: .infinity).padding(.vertical, 11).foregroundStyle(.red).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 11, style: .continuous)) }.buttonStyle(.plain); Button { presentSheet(.acceptInvitation(session.id)) } label: { Label("接受并确认时间", systemImage: "checkmark").font(.system(size: 12, weight: .bold)).frame(maxWidth: .infinity).padding(.vertical, 11).foregroundStyle(.white).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 11, style: .continuous)) }.buttonStyle(.plain) }
        } else if session.status == .booked || session.status == .swapScheduled {
            Button { presentSheet(.meeting(sessionID: session.id)) } label: { Label("进入腾讯会议（\(session.meetingID)）", systemImage: "video").font(.system(size: 12, weight: .bold)).frame(maxWidth: .infinity).padding(.vertical, 11).foregroundStyle(.blue).background(.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 11, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 11, style: .continuous).stroke(.blue.opacity(0.22), lineWidth: 1)) }.buttonStyle(.plain)
        }
    }
}
