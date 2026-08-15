import SwiftUI

struct CoffeeCard<Content: View>: View {
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(16)
            .background(CoffeeLinkTheme.surface, in: RoundedRectangle(cornerRadius: CoffeeLinkTheme.cornerRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: CoffeeLinkTheme.cornerRadius, style: .continuous)
                    .stroke(CoffeeLinkTheme.border, lineWidth: 1)
            }
    }
}

struct CoffeeBadge: View {
    enum Tone {
        case accent
        case neutral
        case success
    }

    let title: String
    let tone: Tone

    init(_ title: String, tone: Tone = .accent) {
        self.title = title
        self.tone = tone
    }

    var body: some View {
        Text(title)
            .font(.system(size: 11, weight: .semibold))
            .foregroundStyle(foregroundColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(backgroundColor, in: Capsule())
    }

    private var foregroundColor: Color {
        switch tone {
        case .accent: CoffeeLinkTheme.accent
        case .neutral: CoffeeLinkTheme.secondaryText
        case .success: CoffeeLinkTheme.success
        }
    }

    private var backgroundColor: Color {
        switch tone {
        case .accent: CoffeeLinkTheme.accent.opacity(0.14)
        case .neutral: Color.white.opacity(0.08)
        case .success: CoffeeLinkTheme.success.opacity(0.14)
        }
    }
}

struct CoffeeAvatar: View {
    let name: String
    let imageURL: URL?
    let size: CGFloat

    init(name: String, imageURL: URL? = nil, size: CGFloat = 44) {
        self.name = name
        self.imageURL = imageURL
        self.size = size
    }

    var body: some View {
        ZStack {
            Circle().fill(CoffeeLinkTheme.elevatedSurface)
            if let localAvatarAssetName {
                Image(localAvatarAssetName)
                    .resizable()
                    .scaledToFill()
            } else if let imageURL {
                AsyncImage(url: imageURL) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    initials
                }
            } else {
                initials
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().stroke(CoffeeLinkTheme.border, lineWidth: 1))
    }

    private var initials: some View {
        Text(String(name.prefix(2)).uppercased())
            .font(.system(size: size * 0.32, weight: .bold, design: .rounded))
            .foregroundStyle(CoffeeLinkTheme.primaryText)
    }

    private var localAvatarAssetName: String? {
        let normalizedName = name.lowercased()
        if normalizedName.contains("elena") { return "Elena" }
        if normalizedName.contains("david") { return "David" }
        if normalizedName.contains("sophia") { return "Mia" }
        if normalizedName.contains("leo") { return "Leo" }
        if normalizedName.contains("alex") { return "Alex" }
        return nil
    }
}

struct CoffeePrimaryButton: View {
    let title: String
    var isEnabled = true
    var accessibilityIdentifier: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .frame(maxWidth: .infinity)
                .frame(minHeight: 48)
                .foregroundStyle(CoffeeLinkTheme.primaryText)
                .background(isEnabled ? CoffeeLinkTheme.accent : CoffeeLinkTheme.secondaryText.opacity(0.25), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
        .accessibilityIdentifier(accessibilityIdentifier ?? "")
    }
}

struct CoffeeTopBar: View {
    let title: String
    var trailingAction: (() -> Void)?

    var body: some View {
        ZStack {
            Text(title)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(CoffeeLinkTheme.primaryText)
            HStack {
                Color.clear.frame(width: 44, height: 44)
                Spacer()
                trailingSlot
            }
            .padding(.horizontal, 20)
        }
        .frame(height: 56)
        .background(CoffeeLinkTheme.background)
    }

    @ViewBuilder
    private var trailingSlot: some View {
        if let trailingAction {
            Button(action: trailingAction) {
                Image(systemName: "ellipsis")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("设置")
        } else {
            Color.clear.frame(width: 44, height: 44)
        }
    }
}
