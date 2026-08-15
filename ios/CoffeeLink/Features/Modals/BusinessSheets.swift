import SwiftUI

private struct BusinessChoice: Identifiable {
    let id: String
    let title: String
}

struct AcceptInvitationSheet: View {
    let store: AppStore
    let session: ChatSession
    let dismiss: () -> Void
    @State private var selectedSlotID: String
    @State private var receiverQuestion = ""
    @State private var errorMessage: String?

    init(store: AppStore, session: ChatSession, dismiss: @escaping () -> Void) {
        self.store = store
        self.session = session
        self.dismiss = dismiss
        _selectedSlotID = State(initialValue: store.availableSlots(for: session).first?.id ?? "")
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(session.type == .coffee ? "接受电子咖啡邀请" : "接受主题互换邀请")
                        .font(.system(size: 20, weight: .bold))
                    Text("来自 \(session.senderName) 的邀请")
                        .font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
                    sheetCard(title: "对方想聊的具体问题", detail: session.question)
                    VStack(alignment: .leading, spacing: 9) {
                        Text("确认一个仍可用的对谈时段").font(.system(size: 15, weight: .bold))
                        ForEach(store.availableSlots(for: session)) { slot in
                            Button { selectedSlotID = slot.id; errorMessage = nil } label: {
                                HStack { Label(slot.label, systemImage: "clock").font(.system(size: 13, weight: .semibold)); Spacer(); Image(systemName: selectedSlotID == slot.id ? "checkmark.circle.fill" : "circle").foregroundStyle(selectedSlotID == slot.id ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }
                                    .foregroundStyle(CoffeeLinkTheme.primaryText).padding(13).frame(maxWidth: .infinity, alignment: .leading)
                                    .background(selectedSlotID == slot.id ? CoffeeLinkTheme.accent.opacity(0.14) : CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                                    .overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(selectedSlotID == slot.id ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
                            }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("slot.\(slot.id)")
                            .accessibilityLabel("对谈时段：\(slot.label)")
                            .accessibilityValue(selectedSlotID == slot.id ? "已选择" : "未选择")
                            .accessibilityAddTraits(selectedSlotID == slot.id ? .isSelected : [])
                        }
                    }
                    if session.type == .topicSwap {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("补充您想向对方请教的问题 *").font(.system(size: 15, weight: .bold))
                            TextEditor(text: $receiverQuestion).scrollContentBackground(.hidden).font(.system(size: 14)).foregroundStyle(CoffeeLinkTheme.primaryText).frame(minHeight: 96).padding(10).background(CoffeeLinkTheme.background, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1)).accessibilityIdentifier("accept.receiver-question").onChange(of: receiverQuestion) { _, _ in errorMessage = nil }
                        }
                    }
                    if let errorMessage { inlineError(errorMessage) }
                    CoffeePrimaryButton(title: "确认接受", isEnabled: !selectedSlotID.isEmpty, accessibilityIdentifier: "确认接受") {
                        acceptInvitation()
                    }
                }.padding(20)
            }.background(CoffeeLinkTheme.background).foregroundStyle(CoffeeLinkTheme.primaryText).navigationTitle("接受邀请").navigationBarTitleDisplayMode(.inline)
        }
        .overlay(alignment: .topTrailing) { sheetCloseButton(identifier: "sheet.accept.close", label: "关闭接受邀请", action: dismiss) }
    }

    private func acceptInvitation() {
        let trimmedQuestion = receiverQuestion.trimmingCharacters(in: .whitespacesAndNewlines)
        guard session.type != .topicSwap || trimmedQuestion.count >= 8 else {
            errorMessage = "主题互换请补充不少于 8 个字的问题"
            return
        }
        if store.acceptInvitation(id: session.id, confirmedSlotID: selectedSlotID, receiverQuestion: receiverQuestion) {
            dismiss()
        } else {
            errorMessage = store.lastErrorMessage ?? "接受邀请失败，请稍后重试"
        }
    }
}

struct DeclineInvitationSheet: View {
    let store: AppStore
    let session: ChatSession
    let dismiss: () -> Void
    private let reasons = [
        BusinessChoice(id: "outside-scope", title: "超出当前分享范围"),
        BusinessChoice(id: "insufficient-information", title: "信息不足，难以评估"),
        BusinessChoice(id: "recent-time", title: "近期时间不合适"),
        BusinessChoice(id: "paused", title: "近期暂停接受新邀请")
    ]
    @State private var reason = ""
    @State private var errorMessage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("婉拒邀请").font(.system(size: 20, weight: .bold))
            Text("选择标准婉拒原因，不会公开降低您的信誉。") .font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            ForEach(reasons) { item in
                Button { reason = item.title; errorMessage = nil } label: { HStack { Text(item.title).font(.system(size: 14, weight: .medium)); Spacer(); Image(systemName: reason == item.title ? "checkmark.circle.fill" : "circle").foregroundStyle(reason == item.title ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(14).background(reason == item.title ? CoffeeLinkTheme.accent.opacity(0.12) : CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(reason == item.title ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1)) }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("decline.reason.\(item.id)")
                    .accessibilityLabel("婉拒原因：\(item.title)")
                    .accessibilityValue(reason == item.title ? "已选择" : "未选择")
                    .accessibilityAddTraits(reason == item.title ? .isSelected : [])
            }
            if let errorMessage { inlineError(errorMessage) }
            CoffeePrimaryButton(title: "确认婉拒", isEnabled: !reason.isEmpty) {
                if store.declineInvitation(id: session.id, reason: reason) { dismiss() }
                else { errorMessage = store.lastErrorMessage ?? "婉拒邀请失败，请稍后重试" }
            }
        }.padding(20).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).background(CoffeeLinkTheme.background).foregroundStyle(CoffeeLinkTheme.primaryText)
            .overlay(alignment: .topTrailing) { sheetCloseButton(identifier: "sheet.decline.close", label: "关闭婉拒邀请", action: dismiss) }
    }
}

struct MeetingSheet: View {
    let session: ChatSession
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Label("腾讯会议接入信息", systemImage: "video.fill").font(.system(size: 20, weight: .bold)).foregroundStyle(CoffeeLinkTheme.primaryText)
            sheetCard(title: "已确认时段", detail: session.confirmedSlot ?? session.candidateSlots.first ?? "待确认")
            sheetCard(title: "会议号", detail: session.meetingID)
            sheetCard(title: "会议链接", detail: session.meetingLink?.absoluteString ?? "https://meeting.tencent.com/dm/\(session.meetingID.replacingOccurrences(of: " ", with: ""))")
            Text("请在约定时间准时接入，固定对谈时长 \(session.durationMinutes) 分钟。") .font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
        }.padding(20).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).background(CoffeeLinkTheme.background)
    }
}

struct ReviewSheet: View {
    let store: AppStore
    let session: ChatSession
    let dismiss: () -> Void
    private let tags = ["话题契合·收获满满", "表达清晰", "期待再次交流"]
    @State private var rating = 0
    @State private var tag: String?
    @State private var comment = ""
    @State private var errorMessage: String?

    var body: some View {
        ScrollView { VStack(alignment: .leading, spacing: 16) {
            Text("完成反馈").font(.system(size: 20, weight: .bold))
            Text("为这次 30 分钟对谈留下真实感受。") .font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            HStack(spacing: 10) { ForEach(1...5, id: \.self) { value in Button { rating = value; errorMessage = nil } label: { Image(systemName: value <= rating ? "star.fill" : "star").font(.system(size: 28)).foregroundStyle(value <= rating ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }.buttonStyle(.plain).accessibilityIdentifier("review.star.\(value)").accessibilityLabel("评价 \(value) 星").accessibilityValue(rating == value ? "当前评分" : "未选择").accessibilityAddTraits(rating == value ? .isSelected : []) } }
            Text("选择标签").font(.system(size: 14, weight: .bold))
            FlowTags(tags: tags, selection: $tag)
            Text("补充说明（可选）").font(.system(size: 14, weight: .bold))
            TextEditor(text: $comment).scrollContentBackground(.hidden).frame(minHeight: 92).padding(10).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1)).accessibilityIdentifier("review.comment")
            if let errorMessage { inlineError(errorMessage) }
            CoffeePrimaryButton(title: "提交评价", isEnabled: rating > 0) {
                if store.submitReview(id: session.id, rating: rating, comment: comment, tag: tag) { dismiss() }
                else { errorMessage = store.lastErrorMessage ?? "提交评价失败，请稍后重试" }
            }
        }.padding(20) }.background(CoffeeLinkTheme.background).foregroundStyle(CoffeeLinkTheme.primaryText)
            .overlay(alignment: .topTrailing) { sheetCloseButton(identifier: "sheet.review.close", label: "关闭评价", action: dismiss) }
    }
}

struct ComplaintSheet: View {
    let store: AppStore
    let session: ChatSession
    let dismiss: () -> Void
    private let categories = [
        BusinessChoice(id: "no-show", title: "对谈未按约进行"),
        BusinessChoice(id: "content-mismatch", title: "内容与描述不符"),
        BusinessChoice(id: "communication", title: "沟通体验问题"),
        BusinessChoice(id: "other", title: "其他")
    ]
    @State private var category = ""
    @State private var description = ""
    @State private var errorMessage: String?

    var body: some View {
        ScrollView { VStack(alignment: .leading, spacing: 16) {
            Text("投诉与售后").font(.system(size: 20, weight: .bold))
            Text("请选择类别并说明情况，我们会在演示环境中记录此售后申请。") .font(.system(size: 13)).foregroundStyle(CoffeeLinkTheme.secondaryText)
            ForEach(categories) { item in Button { category = item.title; errorMessage = nil } label: { HStack { Text(item.title).font(.system(size: 14, weight: .medium)); Spacer(); Image(systemName: category == item.title ? "checkmark.circle.fill" : "circle").foregroundStyle(category == item.title ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText) }.foregroundStyle(CoffeeLinkTheme.primaryText).padding(13).background(category == item.title ? CoffeeLinkTheme.accent.opacity(0.12) : CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)) }.buttonStyle(.plain).accessibilityIdentifier("complaint.category.\(item.id)").accessibilityLabel("投诉类别：\(item.title)").accessibilityValue(category == item.title ? "已选择" : "未选择").accessibilityAddTraits(category == item.title ? .isSelected : []) }
            Text("问题说明 *").font(.system(size: 14, weight: .bold))
            TextEditor(text: $description).scrollContentBackground(.hidden).frame(minHeight: 100).padding(10).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1)).accessibilityIdentifier("complaint.description").onChange(of: description) { _, _ in errorMessage = nil }
            if let errorMessage { inlineError(errorMessage) }
            CoffeePrimaryButton(title: "提交售后申请", isEnabled: !category.isEmpty && !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) {
                if store.submitComplaint(id: session.id, category: category, description: description) { dismiss() }
                else { errorMessage = store.lastErrorMessage ?? "提交售后申请失败，请稍后重试" }
            }
        }.padding(20) }.background(CoffeeLinkTheme.background).foregroundStyle(CoffeeLinkTheme.primaryText)
            .overlay(alignment: .topTrailing) { sheetCloseButton(identifier: "sheet.complaint.close", label: "关闭投诉与售后", action: dismiss) }
    }
}

private struct FlowTags: View {
    let tags: [String]
    @Binding var selection: String?
    var body: some View { HStack(spacing: 8) { ForEach(tags, id: \.self) { tag in Button(tag) { selection = selection == tag ? nil : tag }.font(.system(size: 12, weight: .semibold)).foregroundStyle(selection == tag ? CoffeeLinkTheme.primaryText : CoffeeLinkTheme.secondaryText).padding(.horizontal, 10).padding(.vertical, 8).background(selection == tag ? CoffeeLinkTheme.accent : CoffeeLinkTheme.elevatedSurface, in: Capsule()).accessibilityLabel("评价标签：\(tag)").accessibilityValue(selection == tag ? "已选择" : "未选择").accessibilityAddTraits(selection == tag ? .isSelected : []) } } }
}

private func sheetCard(title: String, detail: String) -> some View {
    VStack(alignment: .leading, spacing: 5) { Text(title).font(.system(size: 12, weight: .bold)).foregroundStyle(CoffeeLinkTheme.secondaryText); Text(detail).font(.system(size: 14, weight: .medium)).foregroundStyle(CoffeeLinkTheme.primaryText).fixedSize(horizontal: false, vertical: true) }.padding(14).frame(maxWidth: .infinity, alignment: .leading).background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 13, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 13, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
}

private func inlineError(_ message: String) -> some View {
    Label(message, systemImage: "exclamationmark.circle.fill").font(.system(size: 12, weight: .medium)).foregroundStyle(.red).padding(10).frame(maxWidth: .infinity, alignment: .leading).background(Color.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
}

@MainActor
private func sheetCloseButton(identifier: String, label: String, action: @escaping () -> Void) -> some View {
    Button(action: action) {
        Image(systemName: "xmark")
            .font(.system(size: 12, weight: .bold))
            .foregroundStyle(CoffeeLinkTheme.secondaryText)
            .frame(width: 32, height: 32)
            .background(CoffeeLinkTheme.elevatedSurface, in: Circle())
    }
    .buttonStyle(.plain)
    .accessibilityIdentifier(identifier)
    .accessibilityLabel(label)
    .padding(14)
}
