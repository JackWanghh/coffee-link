import SwiftUI

struct EditProfileSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var name: String
    @State private var title: String
    @State private var company: String
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _name = State(initialValue: store.snapshot.currentUser.name)
        _title = State(initialValue: store.snapshot.currentUser.title)
        _company = State(initialValue: store.snapshot.currentUser.company)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "编辑公开资料", subtitle: nil, identifier: "sheet.edit-profile", onClose: onClose) {
            CoffeeTextField(label: "姓名 / 称呼", placeholder: "请输入公开称呼", text: $name, systemImage: "person")
                .accessibilityIdentifier("profile.name")
            CoffeeTextField(label: "当前岗位职务", placeholder: "请输入当前岗位", text: $title, systemImage: "briefcase")
                .accessibilityIdentifier("profile.title")
            CoffeeTextField(label: "就职公司 / 机构", placeholder: "请输入公司或机构", text: $company, systemImage: "building.2")
                .accessibilityIdentifier("profile.company")
            notice("依照 PRD 规范，公开页面将严格标明“职业信息由用户自行填写，平台未核验”。")
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "保存资料", enabled: isValid)
        }
    }

    private var isValid: Bool { [name, title, company].allSatisfy { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty } }
    private func save() {
        var profile = store.snapshot.currentUser
        profile.name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        profile.title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        profile.company = company.trimmingCharacters(in: .whitespacesAndNewlines)
        if store.updateProfile(profile) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct ManageThemesSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var themes: [ChatTheme]
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _themes = State(initialValue: store.snapshot.currentUser.myThemes)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "管理分享主题", subtitle: "最多可上架 3 个 30 分钟主题（\(themes.count)/3）", identifier: "sheet.manage-themes", onClose: onClose) {
            ForEach($themes) { $theme in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        TextField("主题名称", text: $theme.title)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.primaryText)
                            .accessibilityLabel("主题名称")
                        if themes.count > 1 {
                            Button(role: .destructive) { themes.removeAll { $0.id == theme.id } } label: {
                                Image(systemName: "trash").frame(width: 44, height: 44)
                            }
                            .accessibilityLabel("删除主题 \(theme.title)")
                        }
                    }
                    TextEditor(text: $theme.description)
                        .font(.system(size: 12))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                        .scrollContentBackground(.hidden)
                        .frame(minHeight: 66)
                        .padding(8)
                        .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                        .accessibilityLabel("主题说明")
                }
                .padding(12)
                .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            }
            if themes.count < 3 {
                Button(action: addTheme) {
                    Label("添加新主题", systemImage: "plus")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .background(CoffeeLinkTheme.accent.opacity(0.09), in: RoundedRectangle(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.accent.opacity(0.5), style: StrokeStyle(lineWidth: 1, dash: [5])))
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("themes.add")
            }
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "保存主题", enabled: isValid)
        }
    }

    private var isValid: Bool {
        !themes.isEmpty && themes.count <= 3 && themes.allSatisfy { !$0.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !$0.description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
    }
    private func addTheme() {
        guard themes.count < 3 else { return }
        themes.append(ChatTheme(id: "theme-profile-\(themes.count + 1)", title: "新职业对谈主题", description: "请简要说明本主题探讨的具体经历与一手信息。", durationMinutes: 30, includes: ["针对性答疑、真实经历踩坑复盘"], excludes: ["非职业范围内问题、方案代做"]))
    }
    private func save() {
        if store.updateThemes(themes) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct SelectDrinkSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var selectedID: String
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _selectedID = State(initialValue: store.snapshot.currentUser.signatureDrink.id)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "设置我的签名饮品", subtitle: "发起人邀请被您接受后，将为您点此饮品", identifier: "sheet.select-drink", onClose: onClose) {
            ForEach(DemoData.coffeeCatalog) { drink in
                let selected = selectedID == drink.id
                Button { selectedID = drink.id } label: {
                    HStack(spacing: 11) {
                        Text(drink.icon).font(.system(size: 21)).frame(width: 40, height: 40).background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                        VStack(alignment: .leading, spacing: 3) {
                            HStack(spacing: 6) {
                                Text(drink.name).font(.system(size: 13, weight: .bold))
                                if let tag = drink.tag { Text(tag).font(.system(size: 9, weight: .semibold)).foregroundStyle(.orange).padding(.horizontal, 5).padding(.vertical, 2).background(.orange.opacity(0.10), in: RoundedRectangle(cornerRadius: 4)) }
                            }
                            Text(drink.description).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).lineLimit(1)
                        }
                        Spacer(minLength: 4)
                        VStack(alignment: .trailing, spacing: 3) {
                            Text("¥\(decimalText(drink.price))").font(.system(size: 15, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent)
                            if selected { Image(systemName: "checkmark").font(.system(size: 12, weight: .bold)).foregroundStyle(CoffeeLinkTheme.accent) }
                        }
                    }
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                    .padding(12)
                    .background(selected ? CoffeeLinkTheme.accent.opacity(0.11) : CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(selected ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("drink.\(drink.id)")
                .accessibilityLabel("\(drink.name)，¥\(decimalText(drink.price))，\(drink.description)")
                .accessibilityValue(selected ? "已选择" : "未选择")
                .accessibilityAddTraits(selected ? .isSelected : [])
            }
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "确认选定")
        }
    }
    private func save() {
        if store.selectDrink(id: selectedID) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct TopicSwapSettingsSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var enabled: Bool
    @State private var weeklyLimit: Int
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _enabled = State(initialValue: store.snapshot.currentUser.acceptsTopicSwap)
        _weeklyLimit = State(initialValue: store.snapshot.currentUser.weeklySwapLimit)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "主题互换设置", subtitle: "与其他开放分享的用户进行 0 元对等职业交流", identifier: "sheet.topic-swap", onClose: onClose) {
            Toggle(isOn: $enabled) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("接收主题互换邀请").font(.system(size: 13, weight: .bold))
                    Text("关闭后仅接收请喝电子咖啡邀请").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
            }
            .tint(CoffeeLinkTheme.accent)
            .padding(14)
            .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            .accessibilityIdentifier("swap.enabled")
            if enabled {
                VStack(alignment: .leading, spacing: 8) {
                    Text("每周最多接收互换次数：").font(.system(size: 12, weight: .medium)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    HStack(spacing: 7) {
                        ForEach([1, 2, 3, 5], id: \.self) { limit in
                            Button { weeklyLimit = limit } label: {
                                Text("\(limit) 次/周").font(.system(size: 12, weight: .bold)).foregroundStyle(weeklyLimit == limit ? CoffeeLinkTheme.onAccent : CoffeeLinkTheme.primaryText).frame(maxWidth: .infinity, minHeight: 44).background(weeklyLimit == limit ? CoffeeLinkTheme.accent : CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).stroke(weeklyLimit == limit ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("swap.limit.\(limit)")
                            .accessibilityValue(weeklyLimit == limit ? "已选择" : "未选择")
                            .accessibilityAddTraits(weeklyLimit == limit ? .isSelected : [])
                        }
                    }
                }
            }
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "保存设置")
        }
    }
    private func save() {
        if store.updateTopicSwapSettings(accepts: enabled, weeklyLimit: weeklyLimit) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct AppearanceSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var selectedTheme: AppearanceThemeID
    @State private var autoCalendarSync: Bool
    @State private var defaultMeetingReady: Bool
    @State private var hapticsEnabled: Bool
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        let user = store.snapshot.currentUser
        _selectedTheme = State(initialValue: user.appearanceThemeID)
        _autoCalendarSync = State(initialValue: user.autoCalendarSync)
        _defaultMeetingReady = State(initialValue: user.defaultMeetingReady)
        _hapticsEnabled = State(initialValue: user.hapticsEnabled)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "系统与外观设置", subtitle: "自定义色彩主题与个人偏好", identifier: "sheet.appearance", onClose: onClose) {
            Text("主题配色方案（6款）").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(AppearanceThemeID.allCases) { theme in
                    themeButton(theme)
                }
            }
            Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1).padding(.vertical, 2)
            Text("功能与交互偏好").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            preferenceToggle("预约自动同步日历", subtitle: "付款后将 30 分钟对谈写入手机系统日历", icon: "calendar", isOn: $autoCalendarSync)
            preferenceToggle("入会默认就绪", subtitle: "进入腾讯会议室时自动连接高清音频与画面", icon: "video", isOn: $defaultMeetingReady)
            preferenceToggle("iOS 触觉震动反馈", subtitle: "预约点击与按钮触碰提供触觉响应", icon: "bolt", isOn: $hapticsEnabled)
            notice("CoffeeLink 遵从 Apple HIG。全站色彩主题即时生效并持久保存在本地。")
            errorText(error)
            HStack(spacing: 10) {
                Button { select(.obsidian) } label: { Label("恢复默认", systemImage: "arrow.counterclockwise").font(.system(size: 12, weight: .semibold)).frame(minWidth: 106, minHeight: 44).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain)
                CoffeePrimaryButton(title: "保存并应用", accessibilityIdentifier: "appearance.save") { saveAndClose() }
            }
        }
    }

    private func themeButton(_ theme: AppearanceThemeID) -> some View {
        let selected = theme == selectedTheme
        let palette = CoffeeLinkTheme.previewPalette(theme)
        return Button { select(theme) } label: {
            VStack(alignment: .leading, spacing: 8) {
                HStack { Text(theme.name).font(.system(size: 12, weight: .bold)).lineLimit(1); Spacer(); if selected { Image(systemName: "checkmark.circle.fill").foregroundStyle(palette.accent) } }
                Text(theme.subtitle).font(.system(size: 10)).foregroundStyle(palette.secondaryText).lineLimit(1)
                HStack(spacing: 7) {
                    Circle().fill(palette.background).frame(width: 20, height: 20).overlay(Circle().stroke(palette.border, lineWidth: 1))
                    Circle().fill(palette.surface).frame(width: 20, height: 20).overlay(Circle().stroke(palette.border, lineWidth: 1))
                    Circle().fill(palette.accent).frame(width: 20, height: 20)
                }
            }
            .foregroundStyle(palette.primaryText)
            .padding(11)
            .frame(maxWidth: .infinity, minHeight: 92, alignment: .leading)
            .background(palette.surface, in: RoundedRectangle(cornerRadius: 13))
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(selected ? palette.accent : palette.border, lineWidth: selected ? 2 : 1))
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("appearance.\(theme.rawValue)")
        .accessibilityValue(selected ? "已选择" : "未选择")
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private func preferenceToggle(_ title: String, subtitle: String, icon: String, isOn: Binding<Bool>) -> some View {
        Toggle(isOn: isOn) {
            HStack(spacing: 10) {
                Image(systemName: icon).foregroundStyle(CoffeeLinkTheme.accent).frame(width: 20)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title).font(.system(size: 13, weight: .medium))
                    Text(subtitle).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
            }
        }
        .tint(CoffeeLinkTheme.accent)
        .padding(12)
        .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private func select(_ theme: AppearanceThemeID) {
        selectedTheme = theme
        if !store.updateAppearance(themeID: theme, autoCalendarSync: autoCalendarSync, defaultMeetingReady: defaultMeetingReady, hapticsEnabled: hapticsEnabled) { error = store.lastErrorMessage }
    }
    private func saveAndClose() {
        if store.updateAppearance(themeID: selectedTheme, autoCalendarSync: autoCalendarSync, defaultMeetingReady: defaultMeetingReady, hapticsEnabled: hapticsEnabled) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct ManageSlotsSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var slots: [AvailableSlot]
    @State private var newSlot = "11月2日 10:00 上午"
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _slots = State(initialValue: store.snapshot.currentUser.availableSlots)
    }

    var body: some View {
        ConfigurationSheetContainer(title: "可预约时段排期", subtitle: "逐个开放未来 30 天内的 30 分钟候选时段", identifier: "sheet.manage-slots", onClose: onClose) {
            ForEach($slots) { $slot in
                HStack(spacing: 10) {
                    Button { slot.isAvailable.toggle() } label: {
                        Image(systemName: slot.isAvailable ? "checkmark.circle.fill" : "circle").font(.system(size: 20)).foregroundStyle(slot.isAvailable ? CoffeeLinkTheme.success : CoffeeLinkTheme.secondaryText).frame(width: 44, height: 44)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("时段 \(slot.label)")
                    .accessibilityValue(slot.isAvailable ? "开放" : "关闭")
                    TextField("候选时段", text: $slot.label).font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.primaryText)
                    Button(role: .destructive) { slots.removeAll { $0.id == slot.id } } label: { Image(systemName: "trash").frame(width: 44, height: 44) }.accessibilityLabel("删除时段 \(slot.label)")
                }
                .padding(.horizontal, 8)
                .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1))
            }
            VStack(alignment: .leading, spacing: 8) {
                Text("新增一个 30 分钟时段").font(.system(size: 12, weight: .medium)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                HStack(spacing: 8) {
                    TextField("例如：11月2日 10:00 上午", text: $newSlot).font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.primaryText).padding(.horizontal, 12).frame(minHeight: 44).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 11)).accessibilityIdentifier("slots.new")
                    Button(action: addSlot) { Image(systemName: "plus").font(.system(size: 14, weight: .bold)).foregroundStyle(CoffeeLinkTheme.onAccent).frame(width: 44, height: 44).background(CoffeeLinkTheme.accent, in: RoundedRectangle(cornerRadius: 11)) }.buttonStyle(.plain).accessibilityIdentifier("slots.add")
                }
            }
            notice("候选时段等待邀请期间不独占；接受邀请时仍会校验实时可用性。")
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "保存时段")
        }
    }
    private func addSlot() {
        let trimmed = newSlot.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let next = (slots.compactMap { Int($0.id.split(separator: "-").last ?? "") }.max() ?? slots.count) + 1
        slots.append(AvailableSlot(id: "slot-profile-\(next)", label: trimmed))
        newSlot = ""
    }
    private func save() {
        if store.updateAvailableSlots(slots) { onClose() } else { error = store.lastErrorMessage }
    }
}

struct MeetingLinkSettingsSheet: View {
    let store: AppStore
    let onClose: () -> Void
    @State private var link: String
    @State private var error: String?

    init(store: AppStore, onClose: @escaping () -> Void) {
        self.store = store
        self.onClose = onClose
        _link = State(initialValue: store.snapshot.currentUser.meetingLink?.absoluteString ?? "")
    }

    var body: some View {
        ConfigurationSheetContainer(title: "腾讯会议号配置", subtitle: "正式确认的电子咖啡与主题互换对谈复用此链接", identifier: "sheet.meeting-link", onClose: onClose) {
            CoffeeTextField(label: "默认腾讯会议链接", placeholder: "https://meeting.tencent.com/dm/832910293", text: $link, systemImage: "link")
                .accessibilityIdentifier("meeting.link")
            HStack(spacing: 10) {
                Image(systemName: "video.fill").foregroundStyle(.blue)
                VStack(alignment: .leading, spacing: 3) {
                    Text("会议号预览").font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    Text(meetingID).font(.system(size: 18, weight: .bold, design: .monospaced)).foregroundStyle(CoffeeLinkTheme.primaryText)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 13))
            .overlay(RoundedRectangle(cornerRadius: 13).stroke(Color.blue.opacity(0.22), lineWidth: 1))
            notice("会议链接只对已付款电子咖啡订单双方，或已经接受的主题互换双方可见。")
            errorText(error)
            footerButtons(cancel: onClose, confirm: save, confirmTitle: "保存会议链接", enabled: !link.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
    }
    private var meetingID: String {
        guard let url = URL(string: link) else { return "待填写" }
        let raw = url.lastPathComponent
        guard raw.count == 9 else { return raw.isEmpty ? "待填写" : raw }
        return "\(raw.prefix(3)) \(raw.dropFirst(3).prefix(3)) \(raw.suffix(3))"
    }
    private func save() {
        if store.updateMeetingLink(link) { onClose() } else { error = store.lastErrorMessage }
    }
}

private struct ConfigurationSheetContainer<Content: View>: View {
    let title: String
    let subtitle: String?
    let identifier: String
    let onClose: () -> Void
    @ViewBuilder let content: Content

    init(title: String, subtitle: String?, identifier: String, onClose: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.title = title
        self.subtitle = subtitle
        self.identifier = identifier
        self.onClose = onClose
        self.content = content()
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 14) {
                HStack(alignment: .top, spacing: 10) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(title).font(.system(size: 17, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
                        if let subtitle { Text(subtitle).font(.system(size: 11)).foregroundStyle(CoffeeLinkTheme.secondaryText).fixedSize(horizontal: false, vertical: true) }
                    }
                    Spacer()
                    Button(action: onClose) { Image(systemName: "xmark").font(.system(size: 13, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText).frame(width: 44, height: 44).background(CoffeeLinkTheme.elevatedSurface, in: Circle()) }.buttonStyle(.plain).accessibilityLabel("关闭")
                }
                Rectangle().fill(CoffeeLinkTheme.border).frame(height: 1)
                content
            }
            .padding(20)
        }
        .background(CoffeeLinkTheme.surface)
        .accessibilityIdentifier(identifier)
    }
}

@ViewBuilder
private func notice(_ text: String) -> some View {
    Label(text, systemImage: "info.circle")
        .font(.system(size: 11))
        .foregroundStyle(CoffeeLinkTheme.secondaryText)
        .lineSpacing(2)
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(CoffeeLinkTheme.border, lineWidth: 1))
}

@ViewBuilder
private func errorText(_ error: String?) -> some View {
    if let error {
        Label(error, systemImage: "exclamationmark.circle.fill")
            .font(.system(size: 11))
            .foregroundStyle(.red)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

@MainActor
private func footerButtons(cancel: @escaping () -> Void, confirm: @escaping () -> Void, confirmTitle: String, enabled: Bool = true) -> some View {
    HStack(spacing: 10) {
        Button(action: cancel) { Text("取消").font(.system(size: 13, weight: .semibold)).foregroundStyle(CoffeeLinkTheme.secondaryText).frame(maxWidth: .infinity, minHeight: 46).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(CoffeeLinkTheme.border, lineWidth: 1)) }.buttonStyle(.plain)
        CoffeePrimaryButton(title: confirmTitle, isEnabled: enabled, accessibilityIdentifier: confirmTitle, action: confirm)
    }
}
