import SwiftUI

struct InvitationDraft: Equatable {
    var sharerID: String
    var type: SessionType
    var selectedThemeID: String
    var selectedSlotIDs: [String]
    var question: String
    var offeredThemeID: String?
    var offering: String

    static func coffeeDemo(sharerID: String) -> InvitationDraft {
        InvitationDraft(sharerID: sharerID, type: .coffee, selectedThemeID: "product-roadmap", selectedSlotIDs: ["slot-elena-1"], question: "想请教如何在资源受限时规划产品路线图，并协调技术债务和新功能？", offeredThemeID: nil, offering: "")
    }

    var canSubmit: Bool {
        !selectedThemeID.isEmpty && !question.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !selectedSlotIDs.isEmpty && (type == .coffee || (!(offeredThemeID ?? "").isEmpty && !offering.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty))
    }
}

struct CreateInvitationView: View {
    let store: AppStore
    let sharer: Sharer
    let initialType: SessionType
    let initialThemeID: String?
    let onRequireAuthentication: (InvitationDraft) -> Void
    let onSubmitted: (String) -> Void
    let onDismiss: () -> Void
    private let isReferencePresentation: Bool
    @State private var draft: InvitationDraft
    @State private var errorMessage: String?

    init(store: AppStore, sharer: Sharer, type: SessionType, themeID: String?, onRequireAuthentication: @escaping (InvitationDraft) -> Void, onSubmitted: @escaping (String) -> Void, onDismiss: @escaping () -> Void) {
        self.store = store
        self.sharer = sharer
        self.initialType = type
        self.initialThemeID = themeID
        self.onRequireAuthentication = onRequireAuthentication
        self.onSubmitted = onSubmitted
        self.onDismiss = onDismiss
        let arguments = ProcessInfo.processInfo.arguments
        let prefilled = arguments.contains("-prefill-invitation")
        isReferencePresentation = arguments.contains("-present-invite")
        let selectedFirstSlot = prefilled || isReferencePresentation
        _draft = State(initialValue: InvitationDraft(sharerID: sharer.id, type: type, selectedThemeID: themeID ?? sharer.themes.first?.id ?? "", selectedSlotIDs: selectedFirstSlot ? sharer.availableDays.lazy.flatMap(\.slots).prefix(1).map(\.id) : [], question: prefilled ? "如何规划产品路线图并平衡技术债务？" : "", offeredThemeID: store.snapshot.currentUser.myThemes.first?.id, offering: prefilled ? "我可以分享 AI 产品从发现到上线的复盘。" : ""))
    }

    var body: some View {
        VStack(spacing: 0) {
            navigationBar
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    sharerCard
                    invitationTypePicker
                    drinkInfo
                    themeSection
                    if draft.type == .topicSwap { offeredTopicSection }
                    questionSection
                    slotSection
                    if let errorMessage { Text(errorMessage).font(.system(size: 12, weight: .medium)).foregroundStyle(.red) }
                }
                .padding(.horizontal, 20).padding(.top, 18).padding(.bottom, 105)
            }
        }
        .background(CoffeeLinkTheme.background)
        .navigationBarHidden(true)
        .safeAreaInset(edge: .bottom, spacing: 0) { submitBar }
        .accessibilityIdentifier("invite.screen")
    }

    private var navigationBar: some View {
        ZStack {
            Text(draft.type == .coffee ? "发起电子咖啡邀请" : "发起主题互换")
                .font(.system(size: 19, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack { Button(action: onDismiss) { Image(systemName: "chevron.left").font(.system(size: 17, weight: .semibold)).frame(width: 44, height: 44).foregroundStyle(CoffeeLinkTheme.primaryText) }.buttonStyle(.plain); Spacer() }
        }
        .frame(height: 56).overlay(alignment: .bottom) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private var sharerCard: some View {
        HStack(spacing: 12) {
            CoffeeAvatar(name: sharer.name, imageURL: sharer.avatarURL, size: 52)
            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 6) { Text(sharer.name).font(.system(size: 16, weight: .bold)); if sharer.isVerified { Text("身份已核验").font(.system(size: 10, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent).padding(.horizontal, 7).padding(.vertical, 3).background(CoffeeLinkTheme.accent.opacity(0.12), in: Capsule()) } }
                Text(sharer.title + " @ " + sharer.company).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            }.foregroundStyle(CoffeeLinkTheme.primaryText)
            Spacer()
        }
        .padding(16).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var invitationTypePicker: some View {
        HStack(spacing: 4) {
            typeButton(.coffee, title: "请喝电子咖啡 ¥" + decimalText(sharer.signatureDrink.price), symbol: "cup.and.saucer.fill")
            typeButton(.topicSwap, title: "主题互换 0元交流", symbol: "arrow.triangle.2.circlepath", enabled: sharer.acceptsTopicSwap)
        }
        .padding(4).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func typeButton(_ type: SessionType, title: String, symbol: String, enabled: Bool = true) -> some View {
        Button { draft.type = type; errorMessage = nil } label: {
            Label(title, systemImage: symbol).font(.system(size: 12, weight: .bold)).lineLimit(1).minimumScaleFactor(0.8).frame(maxWidth: .infinity, minHeight: 38).foregroundStyle(draft.type == type ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText).background(draft.type == type ? CoffeeLinkTheme.accent.opacity(0.11) : .clear, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
        }.buttonStyle(.plain).disabled(!enabled).opacity(enabled ? 1 : 0.4)
    }

    private var drinkInfo: some View {
        Group {
            if draft.type == .coffee {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "cup.and.saucer.fill").foregroundStyle(CoffeeLinkTheme.primaryText).frame(width: 30, height: 30).background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    VStack(alignment: .leading, spacing: 5) { Text("请对方喝一杯「" + sharer.signatureDrink.name + "」表达感谢（¥" + decimalText(sharer.signatureDrink.price) + "）").font(.system(size: 13, weight: .bold)); Text("提交邀请暂不扣费。若对方确认你的问题并在12小时内接受邀请后，您再进行支付。").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineSpacing(2) }.foregroundStyle(CoffeeLinkTheme.primaryText)
                }.padding(14).background(CoffeeLinkTheme.accent.opacity(0.13), in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.35), lineWidth: 1))
            }
        }
    }

    private var themeSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("1. 想请教对方的主题 (固定30分钟)").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            ForEach(sharer.themes) { theme in
                Button { draft.selectedThemeID = theme.id } label: {
                    VStack(alignment: .leading, spacing: 6) { HStack { Text(theme.title).font(.system(size: 15, weight: .bold)); Spacer(); Image(systemName: draft.selectedThemeID == theme.id ? "checkmark.circle.fill" : "circle").foregroundStyle(CoffeeLinkTheme.accent) }; Text(theme.description).font(.system(size: 12)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(2) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(15).frame(maxWidth: .infinity, alignment: .leading).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(draft.selectedThemeID == theme.id ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: draft.selectedThemeID == theme.id ? 1.5 : 1))
                }.buttonStyle(.plain)
            }
        }
    }

    private var offeredTopicSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("2. 我愿意互换的主题 *").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            ForEach(store.snapshot.currentUser.myThemes) { theme in
                Button { draft.offeredThemeID = theme.id } label: { HStack { VStack(alignment: .leading, spacing: 4) { Text(theme.title).font(.system(size: 14, weight: .bold)); Text(theme.description).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(2) }; Spacer(); Image(systemName: draft.offeredThemeID == theme.id ? "checkmark.circle.fill" : "circle").foregroundStyle(CoffeeLinkTheme.accent) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(14).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(draft.offeredThemeID == theme.id ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain)
            }
            Text("3. 我可以提供什么 *").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            TextEditor(text: $draft.offering).font(.system(size: 14)).scrollContentBackground(.hidden).foregroundStyle(CoffeeLinkTheme.primaryText).frame(minHeight: 86).padding(10).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
        }
    }

    private var questionSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack { Text(draft.type == .coffee ? "2. 想请教的具体问题 *" : "4. 想请教的具体问题 *").font(.system(size: 15, weight: .bold)); Spacer(); Text("\(draft.question.count)/300").font(.system(size: 11, weight: .medium)).foregroundStyle(draft.question.count > 300 ? .red : CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText)
            TextField("请清晰描述你的背景与最想了解的职业经历/关键问题（建议 20~300 字）。分享者将根据问题判断是否适合交流并决定是否接受。", text: $draft.question, axis: .vertical)
                .font(.system(size: 14)).foregroundStyle(CoffeeLinkTheme.primaryText).tint(CoffeeLinkTheme.accent)
                .lineLimit(4...6).frame(minHeight: 100, alignment: .topLeading).padding(11)
                .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                .accessibilityIdentifier("invite.question")
                .onChange(of: draft.question) { _, value in if value.count > 300 { draft.question = String(value.prefix(300)) } }
        }
    }

    private var slotSection: some View {
        VStack(alignment: .leading, spacing: 11) {
            HStack { Text(draft.type == .coffee ? "3. 选择期望时段 (最多3个) *" : "5. 选择期望时段 (最多3个) *").font(.system(size: 15, weight: .bold)); Spacer(); Text("已选 \(draft.selectedSlotIDs.count)/3").font(.system(size: 11, weight: .medium)).foregroundStyle(CoffeeLinkTheme.accent) }.foregroundStyle(CoffeeLinkTheme.primaryText)
            ForEach(sharer.availableDays.filter { !$0.isFull }) { day in
                VStack(alignment: .leading, spacing: 8) { Text("\(day.date) · \(day.dayOfWeek)").font(.system(size: 12, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.secondaryText); LazyVGrid(columns: [GridItem(.adaptive(minimum: 102), spacing: 8)], alignment: .leading, spacing: 8) { ForEach(day.slots) { slot in slotButton(slot) } } }
            }
        }
    }

    private func slotButton(_ slot: AvailableSlot) -> some View {
        let selected = draft.selectedSlotIDs.contains(slot.id)
        return Button { if selected { draft.selectedSlotIDs.removeAll { $0 == slot.id } } else if draft.selectedSlotIDs.count < 3 { draft.selectedSlotIDs.append(slot.id) } } label: { Label(slot.label, systemImage: selected ? "checkmark.circle.fill" : "clock").font(.system(size: 11, weight: .semibold)).frame(maxWidth: .infinity, minHeight: 35).foregroundStyle(selected ? CoffeeLinkTheme.accent : CoffeeLinkTheme.primaryText).background(selected ? CoffeeLinkTheme.accent.opacity(0.12) : CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 9, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 9, style: .continuous).stroke(selected ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain)
    }

    private var submitBar: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 2) { Text(draft.type == .coffee ? "签名咖啡（接受后付）" : "主题互换（无需付款）").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText); Text(draft.type == .coffee ? "¥" + decimalText(sharer.signatureDrink.price) : "¥0").font(.system(size: 20, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }
            CoffeePrimaryButton(title: draft.type == .coffee ? "提交咖啡邀请  →" : "提交互换邀请  →", isEnabled: draft.canSubmit || isReferencePresentation, accessibilityIdentifier: "invite.submit") { submit() }.frame(maxWidth: 196)
        }
        .padding(.horizontal, 20).padding(.vertical, 3).background(CoffeeLinkTheme.background.opacity(0.98)).overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
    }

    private func submit() {
        guard draft.canSubmit else { errorMessage = "请完善问题与至少一个期望时段"; return }
        guard store.snapshot.currentUser.isLoggedIn else { onRequireAuthentication(draft); return }
        do {
            let id: String
            if draft.type == .coffee { id = try store.submitInvitation(sharerID: sharer.id, type: .coffee, themeID: draft.selectedThemeID, question: draft.question, slotIDs: draft.selectedSlotIDs) }
            else { id = try store.submitTopicSwap(sharerID: sharer.id, requestedThemeID: draft.selectedThemeID, offeredThemeID: draft.offeredThemeID ?? "", question: draft.question, offering: draft.offering, slotIDs: draft.selectedSlotIDs) }
            onSubmitted(id)
        } catch { errorMessage = error.localizedDescription }
    }
}
