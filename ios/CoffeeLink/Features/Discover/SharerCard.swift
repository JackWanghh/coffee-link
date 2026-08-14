import SwiftUI

struct SharerCard: View {
    let sharer: Sharer

    var body: some View {
        CoffeeCard {
            VStack(alignment: .leading, spacing: 15) {
                HStack(alignment: .top, spacing: 12) {
                    avatar
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(spacing: 7) {
                            Text(sharer.name)
                                .font(.system(size: 17, weight: .bold))
                                .foregroundStyle(CoffeeLinkTheme.primaryText)
                                .lineLimit(1)
                            if let industry = sharer.industry {
                                Text(industry)
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 3)
                                    .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 4, style: .continuous))
                            }
                            Spacer(minLength: 0)
                            Image(systemName: "chevron.right")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        }
                        Text("\(sharer.title) @ \(sharer.company)")
                            .font(.system(size: 13))
                            .foregroundStyle(CoffeeLinkTheme.secondaryText)
                            .lineLimit(1)
                        badges
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(sharer.themes.prefix(2)) { theme in
                                Text(theme.title)
                                    .font(.system(size: 11))
                                    .foregroundStyle(CoffeeLinkTheme.secondaryText)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 5)
                                    .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 4, style: .continuous))
                                    .overlay(RoundedRectangle(cornerRadius: 4, style: .continuous).stroke(CoffeeLinkTheme.border, lineWidth: 1))
                            }
                        }
                    }
                }
                if let highlight = sharer.highlights.first {
                    Text(highlight)
                        .font(.system(size: 13))
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                        .lineLimit(2)
                        .lineSpacing(3)
                        .padding(.top, 13)
                        .padding(.bottom, 6)
                        .overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
                }
                HStack {
                    Label(sharer.nextAvailableText, systemImage: "calendar")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(CoffeeLinkTheme.accent)
                    Spacer()
                    HStack(alignment: .lastTextBaseline, spacing: 1) {
                        Text("¥\(decimalText(sharer.signatureDrink.price))")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(CoffeeLinkTheme.accent)
                        Text("/杯")
                            .font(.system(size: 11))
                            .foregroundStyle(CoffeeLinkTheme.secondaryText)
                    }
                }
                .padding(.top, 13)
                .padding(.bottom, 10)
                .overlay(alignment: .top) { Divider().overlay(CoffeeLinkTheme.border) }
            }
        }
    }

    private var avatar: some View {
        ZStack(alignment: .bottomTrailing) {
            Image(avatarAssetName(for: sharer))
                .resizable()
                .scaledToFill()
                .frame(width: 56, height: 56)
                .clipShape(Circle())
                .overlay(Circle().stroke(CoffeeLinkTheme.border, lineWidth: 2))
            if sharer.isVerified {
                Image(systemName: "checkmark")
                    .font(.system(size: 8, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 16, height: 16)
                    .background(CoffeeLinkTheme.success, in: Circle())
                    .overlay(Circle().stroke(CoffeeLinkTheme.surface, lineWidth: 2))
            }
        }
    }

    private var badges: some View {
        HStack(spacing: 6) {
            Label("\(sharer.signatureDrink.name) ¥\(decimalText(sharer.signatureDrink.price))", systemImage: "cup.and.saucer.fill")
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(CoffeeLinkTheme.accent)
                .padding(.horizontal, 7)
                .padding(.vertical, 4)
                .background(CoffeeLinkTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 5, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 5, style: .continuous).stroke(CoffeeLinkTheme.accent.opacity(0.3), lineWidth: 1))
            if sharer.acceptsTopicSwap {
                Label("支持主题互换", systemImage: "arrow.triangle.2.circlepath")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.blue)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.10), in: RoundedRectangle(cornerRadius: 5, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 5, style: .continuous).stroke(Color.blue.opacity(0.28), lineWidth: 1))
            }
        }
    }
}

func avatarAssetName(for sharer: Sharer) -> String {
    switch sharer.id {
    case "elena-rodriguez": "Elena"
    case "david-wu": "David"
    case "sophia-tang": "Mia"
    case "leo-zhang": "Leo"
    default: "Alex"
    }
}

func decimalText(_ value: Decimal) -> String {
    NSDecimalNumber(decimal: value).stringValue
}
