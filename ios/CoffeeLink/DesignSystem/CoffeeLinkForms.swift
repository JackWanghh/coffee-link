import SwiftUI

struct CoffeeTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var systemImage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(CoffeeLinkTheme.secondaryText)

            HStack(spacing: 10) {
                if let systemImage {
                    Image(systemName: systemImage)
                        .foregroundStyle(CoffeeLinkTheme.secondaryText)
                }
                TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(CoffeeLinkTheme.secondaryText.opacity(0.72)))
                    .foregroundStyle(CoffeeLinkTheme.primaryText)
                    .tint(CoffeeLinkTheme.accent)
            }
            .padding(.horizontal, 14)
            .frame(minHeight: 48)
            .background(CoffeeLinkTheme.elevatedSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(CoffeeLinkTheme.border, lineWidth: 1)
            }
        }
    }
}
