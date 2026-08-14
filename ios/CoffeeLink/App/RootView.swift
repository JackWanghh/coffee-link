import SwiftUI

struct RootView: View {
    var body: some View {
        Text("CoffeeLink")
            .foregroundStyle(CoffeeLinkTheme.primaryText)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(CoffeeLinkTheme.background)
            .preferredColorScheme(.dark)
    }
}
