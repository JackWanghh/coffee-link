import SwiftUI

struct SharerDetailView: View {
    let sharer: Sharer
    @Binding var path: [AppRoute]
    let isPreview: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var selectedThemeID: String
    @State private var selectedDayIndex: Int

    init(sharer: Sharer, path: Binding<[AppRoute]>, isPreview: Bool = false) {
        self.sharer = sharer
        self._path = path
        self.isPreview = isPreview
        self._selectedThemeID = State(initialValue: sharer.themes.first?.id ?? "")
        self._selectedDayIndex = State(initialValue: sharer.availableDays.firstIndex(where: { !$0.isFull }) ?? 0)
    }

    var body: some View {
        VStack(spacing: 0) {
            navigationBar
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    if isPreview { previewNotice }
                    profileHeader
                    signatureDrinkCard
                    topicSwapCard
                    highlightsCard
                    themesSection
                    availabilitySection
                    reviewsSection
                }
                .padding(.horizontal, 20)
                .padding(.top, 18)
                .padding(.bottom, 96)
            }
        }
        .background(CoffeeLinkTheme.background)
        .navigationBarHidden(true)
        .safeAreaInset(edge: .bottom, spacing: 0) { actionBar }
    }

    private var previewNotice: some View {
        Label("这是你的公开名片预览，访客操作已隐藏", systemImage: "eye.fill")
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(CoffeeLinkTheme.accent)
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .padding(.horizontal, 13)
            .background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.accent.opacity(0.3), lineWidth: 1))
            .accessibilityIdentifier("profile-preview.notice")
    }

    private var navigationBar: some View {
        ZStack {
            Text("分享者详情")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack {
                Button(action: { dismiss() }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                        .frame(width: 44, height: 44)
                }
                .buttonStyle(.plain)
                Spacer()
                Image(systemName: "ellipsis")
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    .frame(width: 44, height: 44)
            }
        }
        .frame(height: 56)
        .overlay(alignment: .bottom) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private var profileHeader: some View {
        VStack(spacing: 7) {
            ZStack(alignment: .bottomTrailing) {
                Image(avatarAssetName(for: sharer))
                    .resizable()
                    .scaledToFill()
                    .frame(width: 96, height: 96)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(CoffeeLinkTheme.border, lineWidth: 4))
                if sharer.isVerified {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 19))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(CoffeeLinkTheme.accent)
                        .background(Circle().fill(CoffeeLinkTheme.surface).padding(1))
                }
            }
            Text(sharer.name)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
            Text("\(sharer.title) @ \(sharer.company)")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(CoffeeLinkTheme.accent)
            Label(sharer.declarationNote, systemImage: "info.circle")
                .font(.system(size: 11))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                .padding(.horizontal, 12)
                .frame(height: 29)
                .background(CoffeeLinkTheme.surface, in: Capsule())
                .overlay(Capsule().stroke(CoffeeLinkTheme.border, lineWidth: 1))
                .padding(.top, 3)
        }
    }

    private var signatureDrinkCard: some View {
        HStack(spacing: 12) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 23))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
                .frame(width: 48, height: 48)
                .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text("签名饮品").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    if let tag = sharer.signatureDrink.tag {
                        Text(tag).font(.system(size: 10, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.accent)
                    }
                }
                Text(sharer.signatureDrink.name)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text(sharer.signatureDrink.description)
                    .font(.system(size: 11))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
            VStack(alignment: .trailing, spacing: 2) {
                Text("¥\(decimalText(sharer.signatureDrink.price))")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.accent)
                Text("/ 30分钟").font(.system(size: 10)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
        }
        .padding(16)
        .background(CoffeeLinkTheme.accent.opacity(0.15), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.32), lineWidth: 1))
    }

    private var topicSwapCard: some View {
        HStack(spacing: 10) {
            Image(systemName: "arrow.triangle.2.circlepath")
                .foregroundStyle(.blue)
            VStack(alignment: .leading, spacing: 3) {
                Text(sharer.acceptsTopicSwap ? "支持主题互换（0元对等交流）" : "暂未开放主题互换")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Text(sharer.acceptsTopicSwap ? "本周剩余 \(sharer.remainingSwapQuota)/\(sharer.weeklySwapLimit) 个互换名额" : "仅接受请喝电子咖啡邀请")
                    .font(.system(size: 11))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            Spacer()
            if sharer.acceptsTopicSwap {
                Text("可互换").font(.system(size: 11, weight: .bold)).foregroundStyle(.blue)
            }
        }
        .padding(13)
        .background(Color.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(Color.blue.opacity(0.25), lineWidth: 1))
    }

    private var highlightsCard: some View {
        VStack(alignment: .leading, spacing: 11) {
            Label("职业背景与亮点", systemImage: "graduationcap.fill")
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(CoffeeLinkTheme.accent)
            ForEach(sharer.highlights, id: \.self) { highlight in
                HStack(alignment: .top, spacing: 9) {
                    Circle().fill(CoffeeLinkTheme.accent).frame(width: 6, height: 6).padding(.top, 6)
                    Text(highlight).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(3)
                }
            }
        }
        .padding(16)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var themesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("开放交流的主题（固定30分钟）")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Spacer()
                Text("共 \(sharer.themes.count) 个主题")
                    .font(.system(size: 11))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            ForEach(sharer.themes) { theme in
                Button { selectedThemeID = theme.id } label: {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(theme.title).font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                        Text(theme.description).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2)
                        Divider().overlay(CoffeeLinkTheme.border)
                        HStack {
                            Label("30 分钟对谈", systemImage: "clock").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                            Spacer()
                            Text("点击选中该主题").font(.system(size: 11, weight: .medium)).foregroundStyle(CoffeeLinkTheme.accent)
                        }
                    }
                    .padding(15)
                    .background(selectedThemeID == theme.id ? CoffeeLinkTheme.elevatedSurface : CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(selectedThemeID == theme.id ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: selectedThemeID == theme.id ? 2 : 1))
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var reviewsSection: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack {
                Text("真实评价与履约信誉").font(.system(size: 16, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                Spacer()
                Text("按时率 \(sharer.onTimeRate) · 响应 \(sharer.responseMedianTime)").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }
            ForEach(sharer.reviews) { review in
                VStack(alignment: .leading, spacing: 7) {
                    HStack {
                        Text(review.authorInitials).font(.system(size: 10, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(width: 25, height: 25).background(CoffeeLinkTheme.accent, in: Circle())
                        Text(review.authorName).font(.system(size: 12, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                        Spacer()
                        HStack(spacing: 1) { ForEach(0..<review.rating, id: \.self) { _ in Image(systemName: "star.fill").font(.system(size: 10)).foregroundStyle(CoffeeLinkTheme.accent) } }
                    }
                    Text("“\(review.comment)”").font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2)
                }
                .padding(13)
                .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            }
        }
    }

    private var availabilitySection: some View {
        let day = selectedAvailabilityDay
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("近期可约时间", systemImage: "calendar")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                Spacer()
                Text("未来 7 天")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(CoffeeLinkTheme.accent)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 4)
                    .background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 5, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 5, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.28), lineWidth: 1))
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(sharer.availableDays.enumerated()), id: \.element.id) { index, availableDay in
                        Button { selectedDayIndex = index } label: {
                            VStack(spacing: 4) {
                                Text(availableDay.date).font(.system(size: 10)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                                Text(availableDay.dayOfWeek).font(.system(size: 12, weight: .bold)).foregroundStyle(index == selectedDayIndex ? CoffeeLinkTheme.accent : CoffeeLinkTheme.primaryText)
                                Text(availableDay.isFull ? "已满" : "\(availableDay.slotsCount)个时段").font(.system(size: 10)).foregroundStyle(availableDay.isFull ? CoffeeLinkTheme.secondaryText : CoffeeLinkTheme.accent)
                            }
                            .frame(width: 76, height: 67)
                            .background(index == selectedDayIndex ? CoffeeLinkTheme.elevatedSurface : CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(index == selectedDayIndex ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: index == selectedDayIndex ? 1.5 : 1))
                            .opacity(availableDay.isFull ? 0.45 : 1)
                        }
                        .buttonStyle(.plain)
                        .disabled(availableDay.isFull)
                    }
                }
            }
            if !day.slots.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("可选时段").font(.system(size: 11, weight: .medium)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 92), spacing: 8)], alignment: .leading, spacing: 8) {
                        ForEach(day.slots) { slot in
                            Label(slot.label, systemImage: "clock")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(CoffeeLinkTheme.primaryText)
                                .padding(.horizontal, 9)
                                .frame(height: 32)
                                .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                        }
                    }
                }
                .padding(.top, 2)
            }
        }
        .padding(16)
        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var selectedAvailabilityDay: AvailabilityDay {
        guard sharer.availableDays.indices.contains(selectedDayIndex) else { return sharer.availableDays[0] }
        return sharer.availableDays[selectedDayIndex]
    }

    private var actionBar: some View {
        Group {
            if isPreview {
                Label("公开名片只读预览", systemImage: "lock.fill")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                    .accessibilityIdentifier("profile-preview.read-only")
            } else {
                invitationActions
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(CoffeeLinkTheme.background.opacity(0.98))
        .overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private var invitationActions: some View {
        HStack(spacing: 10) {
            Button { path.append(.createInvitation(sharerID: sharer.id, type: .coffee, themeID: selectedThemeID)) } label: {
                Label("请喝咖啡（¥\(decimalText(sharer.signatureDrink.price))）", systemImage: "cup.and.saucer.fill")
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .foregroundStyle(CoffeeLinkTheme.onAccent)
                    .background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("请喝咖啡（¥\(decimalText(sharer.signatureDrink.price))）")
            if sharer.acceptsTopicSwap {
                Button { path.append(.createInvitation(sharerID: sharer.id, type: .topicSwap, themeID: selectedThemeID)) } label: {
                    Label("主题互换（0元）", systemImage: "arrow.triangle.2.circlepath")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                        .padding(.horizontal, 13)
                        .frame(minHeight: 48)
                        .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("主题互换（0元）")
            }
        }
    }
}
