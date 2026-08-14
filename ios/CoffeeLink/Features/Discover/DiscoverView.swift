import SwiftUI

struct DiscoverView: View {
    @Bindable var store: AppStore
    @Binding var path: [AppRoute]
    @State private var searchQuery = ""
    @State private var selectedIndustry = "全部"

    private let industries = ["全部", "AI 与算法", "互联网产品", "研发与架构", "战略与咨询", "设计与体验", "出海与商业化"]

    private var filteredSharers: [Sharer] {
        store.snapshot.sharers.filter { sharer in
            let categoryMatches = selectedIndustry == "全部" || sharer.industry == selectedIndustry
                || (selectedIndustry == "互联网产品" && (sharer.title.contains("产品") || sharer.company.contains("FinTech")))
                || (selectedIndustry == "研发与架构" && (sharer.title.contains("技术") || sharer.highlights.joined().contains("架构")))
                || (selectedIndustry == "设计与体验" && sharer.title.contains("设计"))
                || (selectedIndustry == "出海与商业化" && (sharer.title.contains("出海") || sharer.title.contains("增长")))
            let needle = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            let searchMatches = needle.isEmpty || [sharer.name, sharer.title, sharer.company, sharer.industry ?? "", sharer.highlights.joined(), sharer.themes.map(\.title).joined()].joined().lowercased().contains(needle)
            return categoryMatches && searchMatches
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 16) {
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    TextField("搜索行业大牛、公司、主题或技能...", text: $searchQuery)
                        .font(.system(size: 13))
                        .foregroundStyle(CoffeeLinkTheme.primaryText)
                }
                .padding(.horizontal, 14)
                .frame(height: 43)
                .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 9) {
                        ForEach(industries, id: \.self) { industry in
                            Button(industry) { selectedIndustry = industry }
                                .font(.system(size: 12, weight: selectedIndustry == industry ? .semibold : .medium))
                                .foregroundStyle(selectedIndustry == industry ? .white : CoffeeLinkTheme.secondaryText)
                                .padding(.horizontal, 14)
                                .frame(height: 31)
                                .background(selectedIndustry == industry ? CoffeeLinkTheme.accent : CoffeeLinkTheme.surface, in: Capsule())
                                .overlay(Capsule().stroke(selectedIndustry == industry ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
                                .buttonStyle(.plain)
                        }
                    }
                }

                VStack(spacing: 14) {
                    ForEach(filteredSharers) { sharer in
                        Button { path.append(.sharerDetail(sharer.id)) } label: { SharerCard(sharer: sharer) }
                            .buttonStyle(.plain)
                            .accessibilityIdentifier("sharer.\(sharer.id)")
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 12)
        }
        .background(CoffeeLinkTheme.background)
    }
}
