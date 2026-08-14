import SwiftUI

struct SharerDetailView: View {
    let sharer: Sharer
    @Binding var path: [AppRoute]
    @Environment(\.dismiss) private var dismiss
    @State private var selectedThemeID: String

    init(sharer: Sharer, path: Binding<[AppRoute]>) {
        self.sharer = sharer
        self._path = path
        self._selectedThemeID = State(initialValue: sharer.themes.first?.id ?? "")
    }

    var body: some View {
        VStack(spacing: 0) {
            navigationBar
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    profileHeader
                    signatureDrinkCard
                    topicSwapCard
                    highlightsCard
                    themesSection
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
                        Text(review.authorInitials).font(.system(size: 10, weight: .bold)).foregroundStyle(.white).frame(width: 25, height: 25).background(CoffeeLinkTheme.accent, in: Circle())
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

    private var actionBar: some View {
        HStack(spacing: 10) {
            Button { path.append(.createInvitation(sharerID: sharer.id, type: .coffee, themeID: selectedThemeID)) } label: {
                Label("请喝咖啡（¥\(decimalText(sharer.signatureDrink.price))）", systemImage: "cup.and.saucer.fill")
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .foregroundStyle(.white)
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
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(CoffeeLinkTheme.background.opacity(0.98))
        .overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
    }
}
