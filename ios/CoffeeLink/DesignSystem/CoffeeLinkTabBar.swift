import SwiftUI

struct CoffeeLinkTabBar: View {
    @Binding var selectedTab: AppTab
    let hasUnreadChats: Bool

    init(selectedTab: Binding<AppTab>, hasUnreadChats: Bool = false) {
        self._selectedTab = selectedTab
        self.hasUnreadChats = hasUnreadChats
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(AppTab.allCases) { tab in
                tabButton(for: tab)
            }
        }
        .padding(.horizontal, 12)
        .frame(height: 72)
        .background(CoffeeLinkTheme.surface.opacity(0.98))
        .overlay(alignment: .top) {
            Rectangle()
                .fill(CoffeeLinkTheme.border)
                .frame(height: 1)
        }
    }

    private func tabButton(for tab: AppTab) -> some View {
        let isSelected = selectedTab == tab
        return Button {
            selectedTab = tab
        } label: {
            VStack(spacing: 5) {
                Image(systemName: tab.iconName)
                    .font(.system(size: 18, weight: isSelected ? .semibold : .regular))
                    .frame(height: 22)
                    .overlay(alignment: .topTrailing) {
                        if tab == .chats, hasUnreadChats {
                            Circle()
                                .fill(Color(red: 0.94, green: 0.22, blue: 0.19))
                                .frame(width: 7, height: 7)
                                .overlay(Circle().stroke(CoffeeLinkTheme.surface, lineWidth: 1))
                                .offset(x: 5, y: -3)
                        }
                    }
                Text(tab.title == "对谈管理" ? "对谈" : tab.title)
                    .font(.system(size: 11, weight: isSelected ? .semibold : .medium))
            }
            .foregroundStyle(isSelected ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText)
            .frame(maxWidth: .infinity)
            .frame(minHeight: 44)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("tab.\(tab.rawValue)")
        .accessibilityLabel(tab.title)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}
