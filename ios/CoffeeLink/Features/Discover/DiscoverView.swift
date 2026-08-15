import SwiftUI

struct DiscoverView: View {
    @Bindable var store: AppStore
    @Binding var path: [AppRoute]
    @State private var searchQuery = ""
    @State private var selectedIndustry = "全部"

    private let industries = ["全部", "AI 与算法", "互联网产品", "研发与架构", "战略与咨询", "设计与体验", "出海与商业化"]

    private var filteredSharers: [Sharer] {
        DiscoverFilter.filter(store.snapshot.sharers, industry: selectedIndustry, query: searchQuery)
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
                                .foregroundStyle(selectedIndustry == industry ? CoffeeLinkTheme.onAccent : CoffeeLinkTheme.secondaryText)
                                .padding(.horizontal, 14)
                                .frame(height: 31)
                                .background(selectedIndustry == industry ? CoffeeLinkTheme.accent : CoffeeLinkTheme.surface, in: Capsule())
                                .overlay(Capsule().stroke(selectedIndustry == industry ? CoffeeLinkTheme.accent : CoffeeLinkTheme.border, lineWidth: 1))
                                .buttonStyle(.plain)
                        }
                    }
                }

                VStack(spacing: 16) {
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

enum DiscoverFilter {
    static func filter(_ sharers: [Sharer], industry: String, query: String) -> [Sharer] {
        sharers.filter { sharer in
            categoryMatches(sharer, industry: industry) && searchMatches(sharer, query: query)
        }
    }

    private static func categoryMatches(_ sharer: Sharer, industry: String) -> Bool {
        guard industry != "全部" else { return true }
        if sharer.industry == industry { return true }

        switch industry {
        case "AI 与算法":
            return sharer.title.contains("AI") || sharer.highlights.contains { $0.contains("AI") || $0.contains("大模型") }
        case "互联网产品":
            return sharer.title.contains("产品") || sharer.company.contains("FinTech")
        case "研发与架构":
            return sharer.title.contains("研发") || sharer.title.contains("技术") || sharer.highlights.contains { $0.contains("架构") || $0.contains("并发") }
        case "战略与咨询":
            return sharer.title.contains("咨询") || sharer.title.contains("创始人") || sharer.highlights.contains { $0.contains("咨询") }
        case "设计与体验":
            return sharer.title.contains("设计") || sharer.title.contains("UX")
        case "出海与商业化":
            return sharer.title.contains("出海") || sharer.title.contains("增长")
        default:
            return false
        }
    }

    private static func searchMatches(_ sharer: Sharer, query: String) -> Bool {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !needle.isEmpty else { return true }
        return sharer.name.lowercased().contains(needle)
            || sharer.title.lowercased().contains(needle)
            || sharer.company.lowercased().contains(needle)
            || sharer.industry?.lowercased().contains(needle) == true
            || sharer.highlights.contains { $0.lowercased().contains(needle) }
            || sharer.themes.contains { $0.title.lowercased().contains(needle) || $0.description.lowercased().contains(needle) }
    }
}
