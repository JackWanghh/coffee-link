import SwiftUI

public enum CoffeeLinkTheme {
    public static let referenceWidth: CGFloat = 393
    public static let referenceHeight: CGFloat = 852
    public static let cornerRadius: CGFloat = 16
    nonisolated(unsafe) static var activeAppearanceThemeID: AppearanceThemeID = .obsidian

    public static var background: Color { palette.background }
    public static var surface: Color { palette.surface }
    public static var elevatedSurface: Color { palette.elevatedSurface }
    public static var border: Color { palette.border }
    public static var primaryText: Color { palette.primaryText }
    public static var secondaryText: Color { palette.secondaryText }
    public static var accent: Color { palette.accent }
    public static var onAccent: Color { palette.onAccent }
    public static let success = Color(red: 0.22, green: 0.78, blue: 0.53)

    static func activate(_ id: AppearanceThemeID) {
        activeAppearanceThemeID = id
    }

    static func previewPalette(_ id: AppearanceThemeID) -> CoffeeLinkPalette { palette(for: id) }

    static func accentContrastRatio(for id: AppearanceThemeID) -> Double {
        let accentHex = accentHex(for: id)
        return CoffeeLinkColorContrast.ratio(
            foreground: CoffeeLinkColorContrast.accessibleForeground(on: accentHex),
            background: accentHex
        )
    }

    private static var palette: CoffeeLinkPalette { palette(for: activeAppearanceThemeID) }

    private static func palette(for id: AppearanceThemeID) -> CoffeeLinkPalette {
        switch id {
        case .obsidian:
            makePalette(background: 0x0F0F12, surface: 0x16161D, elevatedSurface: 0x1C1C26, border: 0x2A2A38, primaryText: 0xFFFFFF, secondaryText: 0xA1A1AA, id: id)
        case .latte:
            makePalette(background: 0xFAF6F0, surface: 0xFFFFFF, elevatedSurface: 0xF5ECE1, border: 0xE8DDCF, primaryText: 0x261A14, secondaryText: 0x6B5B52, id: id)
        case .cyber:
            makePalette(background: 0x0A0B16, surface: 0x121426, elevatedSurface: 0x1A1D36, border: 0x282C50, primaryText: 0xFFFFFF, secondaryText: 0x94A3B8, id: id)
        case .emerald:
            makePalette(background: 0x0B1311, surface: 0x12221E, elevatedSurface: 0x18302A, border: 0x23443B, primaryText: 0xFFFFFF, secondaryText: 0x9EBAAF, id: id)
        case .nordic:
            makePalette(background: 0xF8FAFC, surface: 0xFFFFFF, elevatedSurface: 0xF1F5F9, border: 0xE2E8F0, primaryText: 0x0F172A, secondaryText: 0x475569, id: id)
        case .rose:
            makePalette(background: 0x140A10, surface: 0x20101B, elevatedSurface: 0x2E1627, border: 0x422038, primaryText: 0xFFFFFF, secondaryText: 0xD4A5B8, id: id)
        }
    }

    private static func makePalette(background: UInt32, surface: UInt32, elevatedSurface: UInt32, border: UInt32, primaryText: UInt32, secondaryText: UInt32, id: AppearanceThemeID) -> CoffeeLinkPalette {
        let accent = accentHex(for: id)
        return CoffeeLinkPalette(
            background: Color(hex: background),
            surface: Color(hex: surface),
            elevatedSurface: Color(hex: elevatedSurface),
            border: Color(hex: border),
            primaryText: Color(hex: primaryText),
            secondaryText: Color(hex: secondaryText),
            accent: Color(hex: accent),
            onAccent: Color(hex: CoffeeLinkColorContrast.accessibleForeground(on: accent))
        )
    }

    private static func accentHex(for id: AppearanceThemeID) -> UInt32 {
        switch id {
        case .obsidian: 0xFF5E03
        case .latte: 0xC26D24
        case .cyber: 0x8B5CF6
        case .emerald: 0x10B981
        case .nordic: 0x2563EB
        case .rose: 0xF43F5E
        }
    }
}

enum CoffeeLinkColorContrast {
    static func accessibleForeground(on background: UInt32) -> UInt32 {
        ratio(foreground: 0x000000, background: background) >= ratio(foreground: 0xFFFFFF, background: background) ? 0x000000 : 0xFFFFFF
    }

    static func ratio(foreground: UInt32, background: UInt32) -> Double {
        let first = relativeLuminance(foreground)
        let second = relativeLuminance(background)
        return (max(first, second) + 0.05) / (min(first, second) + 0.05)
    }

    private static func relativeLuminance(_ hex: UInt32) -> Double {
        let red = linear(Double((hex >> 16) & 0xFF) / 255)
        let green = linear(Double((hex >> 8) & 0xFF) / 255)
        let blue = linear(Double(hex & 0xFF) / 255)
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }

    private static func linear(_ component: Double) -> Double {
        component <= 0.04045 ? component / 12.92 : pow((component + 0.055) / 1.055, 2.4)
    }
}

struct CoffeeLinkPalette {
    let background: Color
    let surface: Color
    let elevatedSurface: Color
    let border: Color
    let primaryText: Color
    let secondaryText: Color
    let accent: Color
    let onAccent: Color
}

private extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}
