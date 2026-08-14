import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Palette, 
  Sliders, 
  Video, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Sun,
  Moon,
  Zap,
  Smartphone
} from 'lucide-react';
import { useTheme, ThemeId, THEMES } from '../../theme';

interface SettingsThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsThemeModal: React.FC<SettingsThemeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { themeId, theme, setThemeId, themes } = useTheme();
  const [filterCategory, setFilterCategory] = useState<'all' | 'dark' | 'light'>('all');
  const [enableHaptic, setEnableHaptic] = useState(true);
  const [autoCalendarSync, setAutoCalendarSync] = useState(true);
  const [defaultMicOn, setDefaultMicOn] = useState(true);

  if (!isOpen) return null;

  const filteredThemes = themes.filter((t) => {
    if (filterCategory === 'all') return true;
    return t.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div 
        className="rounded-3xl p-5 max-w-md w-full max-h-[88vh] overflow-y-auto no-scrollbar shadow-2xl border flex flex-col space-y-5 transition-colors duration-300"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textPrimary,
          boxShadow: theme.colors.shadowGlow,
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex justify-between items-center pb-3 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primaryGradientFrom}, ${theme.colors.primaryGradientTo})`,
              }}
            >
              <Palette size={16} />
            </div>
            <div>
              <h3 className="font-hanken text-[17px] font-bold" style={{ color: theme.colors.textPrimary }}>
                系统与外观设置
              </h3>
              <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                自定义色彩主题与个人偏好
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:opacity-80 active:scale-95 transition-all"
            style={{ 
              backgroundColor: theme.colors.surfaceElevated,
              color: theme.colors.textSecondary 
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Theme Palette Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-hanken font-bold text-[14px]">
              <Sparkles size={15} style={{ color: theme.colors.primary }} />
              <span>主题配色方案 ({themes.length}款)</span>
            </div>
            
            {/* Category switch */}
            <div 
              className="flex p-0.5 rounded-lg border text-[11px] font-medium"
              style={{ 
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border 
              }}
            >
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  filterCategory === 'all'
                    ? 'bg-white/20 font-bold shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: filterCategory === 'all' ? theme.colors.surfaceElevated : 'transparent',
                  color: filterCategory === 'all' ? theme.colors.textPrimary : theme.colors.textSecondary,
                }}
              >
                全部
              </button>
              <button
                onClick={() => setFilterCategory('dark')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                  filterCategory === 'dark'
                    ? 'font-bold shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: filterCategory === 'dark' ? theme.colors.surfaceElevated : 'transparent',
                  color: filterCategory === 'dark' ? theme.colors.textPrimary : theme.colors.textSecondary,
                }}
              >
                <Moon size={10} /> 暗色
              </button>
              <button
                onClick={() => setFilterCategory('light')}
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                  filterCategory === 'light'
                    ? 'font-bold shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: filterCategory === 'light' ? theme.colors.surfaceElevated : 'transparent',
                  color: filterCategory === 'light' ? theme.colors.textPrimary : theme.colors.textSecondary,
                }}
              >
                <Sun size={10} /> 浅色
              </button>
            </div>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredThemes.map((t) => {
              const isSelected = themeId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isSelected 
                      ? 'scale-[1.02] shadow-md ring-2' 
                      : 'hover:opacity-90 active:scale-[0.98]'
                  }`}
                  style={{
                    backgroundColor: t.colors.surface,
                    borderColor: isSelected ? t.colors.primary : t.colors.border,
                    outlineColor: isSelected ? t.colors.primary : 'transparent',
                  }}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div 
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${t.colors.primaryGradientFrom}, ${t.colors.primaryGradientTo})`,
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Header info */}
                  <div>
                    <div className="flex items-center gap-1.5 pr-6">
                      <h4 
                        className="font-inter font-bold text-[13px] truncate"
                        style={{ color: t.colors.textPrimary }}
                      >
                        {t.name}
                      </h4>
                    </div>
                    <p 
                      className="text-[11px] truncate mt-0.5 mb-2.5"
                      style={{ color: t.colors.textSecondary }}
                    >
                      {t.subtitle}
                    </p>
                  </div>

                  {/* Mini Preview Visual Palette Box */}
                  <div 
                    className="p-2 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: t.colors.bg,
                      borderColor: t.colors.border,
                    }}
                  >
                    {/* Swatch chips */}
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-5 h-5 rounded-full shadow-inner border"
                        style={{ 
                          backgroundColor: t.colors.bg, 
                          borderColor: t.colors.border 
                        }} 
                        title="背景色"
                      />
                      <div 
                        className="w-5 h-5 rounded-full shadow-inner border"
                        style={{ 
                          backgroundColor: t.colors.surface, 
                          borderColor: t.colors.border 
                        }} 
                        title="卡片色"
                      />
                      <div 
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${t.colors.primaryGradientFrom}, ${t.colors.primaryGradientTo})`,
                        }} 
                        title="主色渐变"
                      />
                    </div>

                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        backgroundColor: t.colors.accentTagBg,
                        color: t.colors.primary,
                        border: `1px solid ${t.colors.accentTagBorder}`,
                      }}
                    >
                      {t.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Preferences & Toggles */}
        <div 
          className="space-y-2.5 pt-3 border-t font-inter text-[13px]"
          style={{ borderColor: theme.colors.border }}
        >
          <h4 className="font-hanken font-bold text-[14px]" style={{ color: theme.colors.textPrimary }}>
            功能与交互偏好
          </h4>

          {/* Toggle 1: Calendar Sync */}
          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <Calendar size={16} style={{ color: theme.colors.primary }} />
              <div>
                <span className="font-medium block" style={{ color: theme.colors.textPrimary }}>
                  预约自动同步日历
                </span>
                <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  付款后将 30 分钟对谈写入手机系统日历
                </span>
              </div>
            </div>
            <button
              onClick={() => setAutoCalendarSync(!autoCalendarSync)}
              className="w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5"
              style={{
                backgroundColor: autoCalendarSync ? theme.colors.primary : 'rgba(120,120,130,0.3)',
              }}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoCalendarSync ? 'translate-x-4 shadow-md' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Mic Default */}
          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <Video size={16} style={{ color: theme.colors.primary }} />
              <div>
                <span className="font-medium block" style={{ color: theme.colors.textPrimary }}>
                  入会默认就绪
                </span>
                <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  进入腾讯会议室时自动连接高清音频与画面
                </span>
              </div>
            </div>
            <button
              onClick={() => setDefaultMicOn(!defaultMicOn)}
              className="w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5"
              style={{
                backgroundColor: defaultMicOn ? theme.colors.primary : 'rgba(120,120,130,0.3)',
              }}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  defaultMicOn ? 'translate-x-4 shadow-md' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3: Haptic Feedback */}
          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <Zap size={16} style={{ color: theme.colors.primary }} />
              <div>
                <span className="font-medium block" style={{ color: theme.colors.textPrimary }}>
                  iOS 触觉震动反馈
                </span>
                <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  预约点击与按钮触碰提供触觉响应
                </span>
              </div>
            </div>
            <button
              onClick={() => setEnableHaptic(!enableHaptic)}
              className="w-10 h-6 rounded-full transition-colors relative flex items-center px-0.5"
              style={{
                backgroundColor: enableHaptic ? theme.colors.primary : 'rgba(120,120,130,0.3)',
              }}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  enableHaptic ? 'translate-x-4 shadow-md' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 3: Legal & Standards note */}
        <div 
          className="p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
            color: theme.colors.textMuted,
          }}
        >
          <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-500" />
          <span>
            CoffeeLink 遵从 Apple HIG 与 Material 3 设计标准规范。全站色彩主题即时生效并持久保存在本地。
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={() => setThemeId('obsidian')}
            className="px-3 py-2.5 rounded-xl border font-inter text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
            title="恢复默认黑金主题"
          >
            <RotateCcw size={14} /> 恢复默认
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-all active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primaryGradientFrom}, ${theme.colors.primaryGradientTo})`,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
};
