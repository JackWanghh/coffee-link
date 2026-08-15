import SwiftUI

struct SharingCenterView: View {
    let store: AppStore
    let onBack: () -> Void
    let presentSheet: (SheetRoute) -> Void
    let previewProfile: () -> Void
    let openPendingInvitations: () -> Void
    @State private var localError: String?

    private var user: UserProfile { store.snapshot.currentUser }
    private var pendingInvitations: Int {
        store.snapshot.sessions.filter { $0.receiverID == user.id && ($0.status == .pendingResponse || $0.status == .needsNewTime) }.count
    }

    var body: some View {
        VStack(spacing: 0) {
            topBar
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    sharingStatus
                    overview
                    pendingAndSettlement
                    signatureDrink
                    topicSwap
                    themes
                    fulfillment
                    previewButton
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 30)
            }
        }
        .background(CoffeeLinkTheme.background)
        .navigationBarHidden(true)
    }

    private var topBar: some View {
        ZStack {
            Text("分享中心").font(.system(size: 18, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack {
                Button(action: onBack) {
                    Image(systemName: "chevron.left").font(.system(size: 17, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText).frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("返回")
                Spacer()
                Button { presentSheet(.editProfile) } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "square.and.pencil")
                            .accessibilityHidden(true)
                        Text("编辑")
                    }
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                        .frame(width: 62, height: 44)
                        .contentShape(Rectangle())
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel("编辑公开资料")
                        .accessibilityHint("更新访客可见的称呼、岗位与公司")
                        .accessibilityIdentifier("sharing.edit-profile")
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 10)
        }
        .frame(height: 56)
        .background(CoffeeLinkTheme.background)
        .overlay(alignment: .bottom) { Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1) }
    }

    private var sharingStatus: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Circle()
                    .fill(user.isSharingOpen ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText)
                    .frame(width: 14, height: 14)
                    .shadow(color: user.isSharingOpen ? CoffeeLinkTheme.success.opacity(0.7) : .clear, radius: 7)
                VStack(alignment: .leading, spacing: 3) {
                    Text(user.isSharingOpen ? "已开启分享功能" : "未开启分享功能")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                    Text(user.isSharingOpen ? "其他用户可在发现页看到您的主题并向您发起对谈" : "开启后您将成为分享者，接收电子咖啡与互换邀请")
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 4)
                Button {
                    localError = nil
                    if !store.toggleSharing() { localError = store.lastErrorMessage }
                } label: {
                    ZStack(alignment: user.isSharingOpen ? .trailing : .leading) {
                        Capsule().fill(user.isSharingOpen ? CoffeeLinkTheme.accent : CoffeeLinkTheme.elevatedSurface).frame(width: 52, height: 28)
                        Circle().fill(.white).frame(width: 24, height: 24).padding(2).shadow(color: .black.opacity(0.24), radius: 2, y: 1)
                    }
                    .frame(minWidth: 52, minHeight: 44)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("sharing.toggle")
                .accessibilityLabel("开放分享")
                .accessibilityValue(user.isSharingOpen ? "已开启" : "已关闭")
                .accessibilityAddTraits(user.isSharingOpen ? .isSelected : [])
            }
            HStack(spacing: 7) {
                Text("开放准备 \(user.sharingReadinessItems.filter(\.isComplete).count)/\(user.sharingReadinessItems.count)")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(user.isSharingReady ? CoffeeLinkTheme.success : CoffeeLinkTheme.accent)
                ForEach(Array(user.sharingReadinessItems.enumerated()), id: \.offset) { _, item in
                    Image(systemName: item.isComplete ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 11))
                        .foregroundStyle(item.isComplete ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText)
                        .accessibilityLabel("\(item.title)：\(item.isComplete ? "已完成" : "待完成")")
                }
                Spacer()
            }
            if let localError {
                Label(localError, systemImage: "exclamationmark.circle.fill")
                    .font(.system(size: 11))
                    .foregroundStyle(.red)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var overview: some View {
        HStack(spacing: 12) {
            metricCard(icon: "cup.and.saucer.fill", label: "累计咖啡收入", value: "¥\(money(user.totalEarnings))", note: "次月1日结算至微信钱包", accent: CoffeeLinkTheme.accent)
            metricCard(icon: "arrow.triangle.2.circlepath", label: "完成对谈与互换", value: "\(user.completedSessionsCount) 次", note: "按时到场率 \(user.onTimeRate)", accent: .blue)
        }
        .padding(16)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var pendingAndSettlement: some View {
        VStack(spacing: 0) {
            Button(action: openPendingInvitations) {
                HStack(spacing: 12) {
                    Image(systemName: "tray.full.fill").font(.system(size: 17)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 22)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("待处理邀请").font(.system(size: 13, weight: .semibold))
                        Text("前往“发给我的 · 待回应”统一处理").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    }
                    Spacer()
                    Text("\(pendingInvitations)").font(.system(size: 12, weight: .bold)).foregroundStyle(.white).frame(minWidth: 22, minHeight: 22).background(.red, in: Circle())
                    Image(systemName: "chevron.right").font(.system(size: 12, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                .foregroundStyle(CoffeeLinkTheme.primaryText)
                .padding(14)
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("sharing.pending-invitations")
            Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)
            VStack(alignment: .leading, spacing: 9) {
                Text("结算摘要").font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                HStack(spacing: 0) {
                    settlementItem("待结算", value: "¥\(money(user.pendingEarnings))")
                    settlementItem("已结算", value: "¥\(money(user.settledEarnings))")
                    settlementItem("平台服务费", value: "15%")
                }
            }
            .padding(14)
        }
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var signatureDrink: some View {
        sectionCard {
            sectionHeader("我的签名饮品", icon: "cup.and.saucer.fill", actionTitle: "设置签名饮品", route: .selectDrink)
            HStack(spacing: 11) {
                Text(user.signatureDrink.icon).font(.system(size: 22)).frame(width: 38, height: 38).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 10))
                VStack(alignment: .leading, spacing: 3) {
                    Text(user.signatureDrink.name).font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                    Text(user.signatureDrink.description).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
                }
                Spacer(minLength: 4)
                Text("¥\(decimalText(user.signatureDrink.price))").font(.system(size: 16, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent)
            }
            .padding(12)
            .background(CoffeeLinkTheme.accent.opacity(0.11), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.28), lineWidth: 1))
            .accessibilityElement(children: .combine)
            .accessibilityLabel("\(user.signatureDrink.name) ¥\(decimalText(user.signatureDrink.price))")
        }
    }

    private var topicSwap: some View {
        sectionCard {
            sectionHeader("主题互换 (0元对等交流)", icon: "arrow.triangle.2.circlepath", actionTitle: "设置额度", route: .topicSwapSettings, accent: .blue)
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(user.acceptsTopicSwap ? "接收主题互换邀请" : "未开启主题互换").font(.system(size: 13, weight: .bold))
                    Text(user.acceptsTopicSwap ? "每周上限 \(user.weeklySwapLimit) 次 · 双方均需提供可分享主题" : "仅接收请喝电子咖啡邀请").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                Spacer()
                Text(user.acceptsTopicSwap ? "开启中" : "已关闭").font(.system(size: 11, weight: .bold)).foregroundStyle(user.acceptsTopicSwap ? .blue : CoffeeLinkTheme.secondaryText).padding(.horizontal, 8).padding(.vertical, 4).background((user.acceptsTopicSwap ? Color.blue : CoffeeLinkTheme.secondaryText).opacity(0.12), in: RoundedRectangle(cornerRadius: 6))
            }
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .padding(12)
            .background(user.acceptsTopicSwap ? Color.blue.opacity(0.07) : CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(user.acceptsTopicSwap ? Color.blue.opacity(0.2) : CoffeeLinkTheme.border, lineWidth: 1))
        }
    }

    private var themes: some View {
        sectionCard {
            sectionHeader("我的分享主题 (\(user.myThemes.count)/3)", icon: "square.3.layers.3d", actionTitle: "编辑主题", route: .manageThemes)
            VStack(spacing: 8) {
                ForEach(user.myThemes) { theme in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack { Text(theme.title).font(.system(size: 13, weight: .bold)).lineLimit(1); Spacer(); Text("固定30分钟").font(.system(size: 10, weight: .medium, design: .monospaced)).foregroundStyle(CoffeeLinkTheme.success) }
                        Text(theme.description).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
                    }
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                    .padding(12)
                    .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                }
            }
        }
    }

    private var fulfillment: some View {
        sectionCard {
            Text("履约与会议设置").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            configRow(title: "可预约时段排期", subtitle: "已开放 \(user.availableSlots.filter(\.isAvailable).count) 个未来 30 天时段", icon: "calendar.badge.clock", route: .manageSlots)
            configRow(title: "腾讯会议号配置", subtitle: meetingDisplay, icon: "link", route: .meetingLinkSettings)
        }
    }

    private var previewButton: some View {
        Button(action: previewProfile) {
            HStack(spacing: 8) {
                Image(systemName: "eye").foregroundStyle(CoffeeLinkTheme.accent)
                Text("预览我的公开名片页").font(.system(size: 13, weight: .bold))
                Image(systemName: "arrow.up.right").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .frame(maxWidth: .infinity, minHeight: 46)
            .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("sharing.preview-profile")
    }

    private func metricCard(icon: String, label: String, value: String, note: String, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Label(label, systemImage: icon).font(.system(size: 11, weight: .medium)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
            Text(value).font(.system(size: 20, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            Text(note).font(.system(size: 10)).foregroundStyle(note.contains("按时") ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText).lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        .tint(accent)
    }

    private func settlementItem(_ title: String, value: String) -> some View {
        VStack(spacing: 3) {
            Text(value).font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            Text(title).font(.system(size: 10)).foregroundStyle(CoffeeLinkTheme.secondaryText)
        }
        .frame(maxWidth: .infinity)
    }

    private func sectionCard<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12, content: content)
            .padding(16)
            .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func sectionHeader(_ title: String, icon: String, actionTitle: String, route: SheetRoute, accent: Color? = nil) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 16)).foregroundStyle(accent ?? CoffeeLinkTheme.accent)
            Text(title).font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            Spacer(minLength: 4)
            Button { presentSheet(route) } label: {
                HStack(spacing: 3) { Text(actionTitle); Image(systemName: "chevron.right").font(.system(size: 10, weight: .bold)) }
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(accent ?? CoffeeLinkTheme.accent)
                    .frame(minHeight: 44)
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier(actionTitle)
        }
    }

    private func configRow(title: String, subtitle: String, icon: String, route: SheetRoute) -> some View {
        Button { presentSheet(route) } label: {
            HStack(spacing: 11) {
                Image(systemName: icon).font(.system(size: 16)).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 20)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.system(size: 13, weight: .semibold))
                    Text(subtitle).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
                }
                Spacer(minLength: 4)
                Image(systemName: "chevron.right").font(.system(size: 11, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .padding(12)
            .frame(minHeight: 56)
            .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier(title)
    }

    private var meetingDisplay: String {
        guard let link = user.meetingLink else { return "尚未配置" }
        let raw = link.lastPathComponent
        guard raw.count == 9 else { return raw }
        return "\(raw.prefix(3)) \(raw.dropFirst(3).prefix(3)) \(raw.suffix(3))"
    }

    private func money(_ value: Decimal) -> String {
        NSDecimalNumber(decimal: value).stringValue + (value.isWholeNumber ? ".00" : "")
    }
}

private extension Decimal {
    var isWholeNumber: Bool { self == Decimal(Int(NSDecimalNumber(decimal: self).doubleValue)) }
}
