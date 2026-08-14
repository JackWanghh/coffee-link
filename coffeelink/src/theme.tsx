import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'obsidian' | 'latte' | 'cyber' | 'emerald' | 'nordic' | 'rose';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  category: 'dark' | 'light';
  badge: string;
  colors: {
    bg: string;
    surface: string;
    surfaceElevated: string;
    surfaceHighlight: string;
    border: string;
    borderHighlight: string;
    primary: string;
    primaryGradientFrom: string;
    primaryGradientTo: string;
    secondary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    shadowGlow: string;
    accentTagBg: string;
    accentTagBorder: string;
  };
  swiftThemeCode: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  obsidian: {
    id: 'obsidian',
    name: '暗夜流光 (默认)',
    subtitle: '高奢曜黑与橙红流光',
    category: 'dark',
    badge: '高奢曜黑',
    colors: {
      bg: '#0F0F12',
      surface: '#16161D',
      surfaceElevated: '#1C1C26',
      surfaceHighlight: '#242432',
      border: '#2A2A38',
      borderHighlight: '#FF5E03',
      primary: '#FF5E03',
      primaryGradientFrom: '#FF5E03',
      primaryGradientTo: '#FF2D55',
      secondary: '#FF2D55',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      shadowGlow: '0px 4px 24px rgba(255, 94, 3, 0.35)',
      accentTagBg: 'rgba(255, 94, 3, 0.12)',
      accentTagBorder: 'rgba(255, 94, 3, 0.3)',
    },
    swiftThemeCode: `// SwiftUI Theme: Obsidian Dark
struct ObsidianTheme: AppThemeProtocol {
    let background = Color(hex: "#0F0F12")
    let surface = Color(hex: "#16161D")
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#FF5E03"), Color(hex: "#FF2D55")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color.white
    let textSecondary = Color(hex: "#A1A1AA")
}`,
  },
  latte: {
    id: 'latte',
    name: '暖阳燕麦 (经典浅色)',
    subtitle: '温润燕麦米白与原木焦糖',
    category: 'light',
    badge: '温馨浅色',
    colors: {
      bg: '#FAF6F0',
      surface: '#FFFFFF',
      surfaceElevated: '#F5ECE1',
      surfaceHighlight: '#EFE2D3',
      border: '#E8DDCF',
      borderHighlight: '#C26D24',
      primary: '#C26D24',
      primaryGradientFrom: '#C26D24',
      primaryGradientTo: '#E08A3C',
      secondary: '#D97706',
      textPrimary: '#261A14',
      textSecondary: '#6B5B52',
      textMuted: '#9C8C82',
      shadowGlow: '0px 4px 20px rgba(194, 109, 36, 0.28)',
      accentTagBg: 'rgba(194, 109, 36, 0.12)',
      accentTagBorder: 'rgba(194, 109, 36, 0.3)',
    },
    swiftThemeCode: `// SwiftUI Theme: Oat Latte Light
struct LatteTheme: AppThemeProtocol {
    let background = Color(hex: "#FAF6F0")
    let surface = Color.white
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#C26D24"), Color(hex: "#E08A3C")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color(hex: "#261A14")
    let textSecondary = Color(hex: "#6B5B52")
}`,
  },
  cyber: {
    id: 'cyber',
    name: '赛博霓虹 (极客紫青)',
    subtitle: '深空魅影与霓虹电光流光',
    category: 'dark',
    badge: '未来极客',
    colors: {
      bg: '#0A0B16',
      surface: '#121426',
      surfaceElevated: '#1A1D36',
      surfaceHighlight: '#22274A',
      border: '#282C50',
      borderHighlight: '#8B5CF6',
      primary: '#8B5CF6',
      primaryGradientFrom: '#8B5CF6',
      primaryGradientTo: '#06B6D4',
      secondary: '#06B6D4',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      shadowGlow: '0px 4px 24px rgba(139, 92, 246, 0.4)',
      accentTagBg: 'rgba(139, 92, 246, 0.15)',
      accentTagBorder: 'rgba(139, 92, 246, 0.35)',
    },
    swiftThemeCode: `// SwiftUI Theme: Cyber Midnight
struct CyberTheme: AppThemeProtocol {
    let background = Color(hex: "#0A0B16")
    let surface = Color(hex: "#121426")
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#8B5CF6"), Color(hex: "#06B6D4")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color.white
    let textSecondary = Color(hex: "#94A3B8")
}`,
  },
  emerald: {
    id: 'emerald',
    name: '翡翠松林 (雅致绿意)',
    subtitle: '墨玉深绿与晶莹薄荷青',
    category: 'dark',
    badge: '清雅护眼',
    colors: {
      bg: '#0B1311',
      surface: '#12221E',
      surfaceElevated: '#18302A',
      surfaceHighlight: '#204038',
      border: '#23443B',
      borderHighlight: '#10B981',
      primary: '#10B981',
      primaryGradientFrom: '#10B981',
      primaryGradientTo: '#14B8A6',
      secondary: '#059669',
      textPrimary: '#FFFFFF',
      textSecondary: '#9EBAAF',
      textMuted: '#638578',
      shadowGlow: '0px 4px 24px rgba(16, 185, 129, 0.35)',
      accentTagBg: 'rgba(16, 185, 129, 0.15)',
      accentTagBorder: 'rgba(16, 185, 129, 0.35)',
    },
    swiftThemeCode: `// SwiftUI Theme: Emerald Botanical
struct EmeraldTheme: AppThemeProtocol {
    let background = Color(hex: "#0B1311")
    let surface = Color(hex: "#12221E")
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#10B981"), Color(hex: "#14B8A6")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color.white
    let textSecondary = Color(hex: "#9EBAAF")
}`,
  },
  nordic: {
    id: 'nordic',
    name: '极简雪原 (北欧亮色)',
    subtitle: '纯净冰原白与科技湛蓝',
    category: 'light',
    badge: '极简商务',
    colors: {
      bg: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F5F9',
      surfaceHighlight: '#E2E8F0',
      border: '#E2E8F0',
      borderHighlight: '#2563EB',
      primary: '#2563EB',
      primaryGradientFrom: '#2563EB',
      primaryGradientTo: '#4F46E5',
      secondary: '#3B82F6',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      shadowGlow: '0px 4px 20px rgba(37, 99, 235, 0.28)',
      accentTagBg: 'rgba(37, 99, 235, 0.1)',
      accentTagBorder: 'rgba(37, 99, 235, 0.25)',
    },
    swiftThemeCode: `// SwiftUI Theme: Nordic Minimal Light
struct NordicTheme: AppThemeProtocol {
    let background = Color(hex: "#F8FAFC")
    let surface = Color.white
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#2563EB"), Color(hex: "#4F46E5")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color(hex: "#0F172A")
    let textSecondary = Color(hex: "#475569")
}`,
  },
  rose: {
    id: 'rose',
    name: '落日暮霞 (暗夜玫瑰)',
    subtitle: '深邃魅红与晚霞罗兰粉',
    category: 'dark',
    badge: '浪漫晚霞',
    colors: {
      bg: '#140A10',
      surface: '#20101B',
      surfaceElevated: '#2E1627',
      surfaceHighlight: '#3D1E34',
      border: '#422038',
      borderHighlight: '#F43F5E',
      primary: '#F43F5E',
      primaryGradientFrom: '#F43F5E',
      primaryGradientTo: '#D946EF',
      secondary: '#D946EF',
      textPrimary: '#FFFFFF',
      textSecondary: '#D4A5B8',
      textMuted: '#8E6476',
      shadowGlow: '0px 4px 24px rgba(244, 63, 94, 0.35)',
      accentTagBg: 'rgba(244, 63, 94, 0.15)',
      accentTagBorder: 'rgba(244, 63, 94, 0.35)',
    },
    swiftThemeCode: `// SwiftUI Theme: Sunset Rose
struct RoseTheme: AppThemeProtocol {
    let background = Color(hex: "#140A10")
    let surface = Color(hex: "#20101B")
    let primaryGradient = LinearGradient(
        colors: [Color(hex: "#F43F5E"), Color(hex: "#D946EF")],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    let textPrimary = Color.white
    let textSecondary = Color(hex: "#D4A5B8")
}`,
  },
};

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeConfig;
  setThemeId: (id: ThemeId) => void;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'obsidian',
  theme: THEMES.obsidian,
  setThemeId: () => {},
  themes: Object.values(THEMES),
});

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialThemeId?: ThemeId;
}> = ({ children, initialThemeId = 'obsidian' }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('coffeelink_theme_id') as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // fallback
    }
    return initialThemeId;
  });

  const setThemeId = (id: ThemeId) => {
    if (THEMES[id]) {
      setThemeIdState(id);
      try {
        localStorage.setItem('coffeelink_theme_id', id);
      } catch {
        // ignore
      }
    }
  };

  const theme = THEMES[themeId] || THEMES.obsidian;

  // Apply CSS custom properties dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-background', theme.colors.bg);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-card', theme.colors.surface);
    root.style.setProperty('--color-surface-container', theme.colors.surfaceElevated);
    root.style.setProperty('--color-surface-container-high', theme.colors.surfaceHighlight);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-primary-gradient-end', theme.colors.primaryGradientTo);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-outline', theme.colors.border);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        themes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
