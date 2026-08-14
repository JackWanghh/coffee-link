import React, { useState } from 'react';
import { 
  UserCog, 
  Layers, 
  CalendarClock, 
  Link2, 
  Eye, 
  Info, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Coffee,
  Repeat,
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { UserProfile, Sharer, CoffeeDrink } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface SharingCenterViewProps {
  user: UserProfile;
  onBack: () => void;
  onToggleSharingOpen: () => void;
  onEditProfile: () => void;
  onManageThemes: () => void;
  onManageSlots: () => void;
  onEditMeetingLink: () => void;
  onOpenSelectDrink: () => void;
  onOpenTopicSwapSettings: () => void;
  onPreviewMyPage: () => void;
}

export const SharingCenterView: React.FC<SharingCenterViewProps> = ({
  user,
  onBack,
  onToggleSharingOpen,
  onEditProfile,
  onManageThemes,
  onManageSlots,
  onEditMeetingLink,
  onOpenSelectDrink,
  onOpenTopicSwapSettings,
  onPreviewMyPage,
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-10 transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar title="分享中心" showBack onBack={onBack} />

      <main className="px-5 py-4 space-y-4">
        {/* Sharing Status Master Toggle Section */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 flex items-center justify-between border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                user.isSharingOpen
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                  : 'bg-zinc-400'
              }`}
            />
            <div>
              <h2 
                className="font-inter text-[15px] font-bold"
                style={{ color: theme.colors.textPrimary }}
              >
                {user.isSharingOpen ? '已开启分享功能' : '未开启分享功能'}
              </h2>
              <p 
                className="font-inter text-[12px]"
                style={{ color: theme.colors.textSecondary }}
              >
                {user.isSharingOpen ? '其他用户可在发现页看到您的主题并向您发起对谈' : '开启后您将成为分享者，接收电子咖啡与互换邀请'}
              </p>
            </div>
          </div>

          {/* Interactive Toggle */}
          <button
            type="button"
            onClick={onToggleSharingOpen}
            className="w-13 h-7 rounded-full p-0.5 transition-all duration-200 ease-in-out relative flex items-center focus:outline-none border shrink-0 ml-2"
            style={{
              backgroundColor: user.isSharingOpen ? theme.colors.primary : theme.colors.surfaceElevated,
              borderColor: user.isSharingOpen ? theme.colors.primary : theme.colors.border,
              boxShadow: user.isSharingOpen ? theme.colors.shadowGlow : undefined,
            }}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                user.isSharingOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </section>

        {/* Overview Stats: Total Coffee Income & Exchanges */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 border transition-colors grid grid-cols-2 gap-3"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }}>
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
              <Coffee size={13} style={{ color: theme.colors.primary }} />
              累计咖啡收入
            </div>
            <div className="font-hanken text-[20px] font-bold" style={{ color: theme.colors.textPrimary }}>
              <span style={{ color: theme.colors.primary }}>¥</span>{user.totalEarnings.toFixed(2)}
            </div>
            <div className="text-[10px]" style={{ color: theme.colors.textMuted }}>
              次月1日结算至微信钱包
            </div>
          </div>

          <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }}>
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
              <Repeat size={13} className="text-blue-500" />
              完成对谈与互换
            </div>
            <div className="font-hanken text-[20px] font-bold" style={{ color: theme.colors.textPrimary }}>
              {user.completedSessionsCount} <span className="text-[12px] font-normal" style={{ color: theme.colors.textSecondary }}>次</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-medium">
              按时到场率 {user.onTimeRate || '100%'}
            </div>
          </div>
        </section>

        {/* Section 1: Signature Drink Configuration */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 border space-y-3 transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee size={16} style={{ color: theme.colors.primary }} />
              <h3 className="font-hanken text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>
                我的签名饮品
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenSelectDrink}
              className="text-[12px] font-bold font-inter flex items-center gap-1"
              style={{ color: theme.colors.primary }}
            >
              更换饮品 <ChevronRight size={13} />
            </button>
          </div>

          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.accentTagBg,
              borderColor: theme.colors.accentTagBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="text-[22px]">{user.signatureDrink?.icon || '☕'}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px]" style={{ color: theme.colors.textPrimary }}>
                    {user.signatureDrink?.name || '燕麦拿铁'}
                  </span>
                  {user.signatureDrink?.tag && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 font-semibold">
                      {user.signatureDrink.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-inter mt-0.5 line-clamp-1" style={{ color: theme.colors.textSecondary }}>
                  {user.signatureDrink?.description || '优质燕麦奶调制，麦香四溢'}
                </p>
              </div>
            </div>
            <div className="font-hanken text-[16px] font-bold shrink-0 ml-2" style={{ color: theme.colors.primary }}>
              ¥{user.signatureDrink?.price || 28}
            </div>
          </div>
        </section>

        {/* Section 2: Topic Swap Settings */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 border space-y-3 transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat size={16} className="text-blue-500" />
              <h3 className="font-hanken text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>
                主题互换 (0元对等交流)
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenTopicSwapSettings}
              className="text-[12px] font-bold font-inter flex items-center gap-1 text-blue-500"
            >
              设置额度 <ChevronRight size={13} />
            </button>
          </div>

          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: user.acceptsTopicSwap ? 'rgba(59, 130, 246, 0.06)' : theme.colors.bg,
              borderColor: user.acceptsTopicSwap ? 'rgba(59, 130, 246, 0.2)' : theme.colors.border,
            }}
          >
            <div>
              <div className="text-[13px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                {user.acceptsTopicSwap ? '接收主题互换邀请' : '未开启主题互换'}
              </div>
              <p className="text-[11px] font-inter mt-0.5" style={{ color: theme.colors.textSecondary }}>
                {user.acceptsTopicSwap 
                  ? `每周上限 ${user.weeklySwapLimit || 3} 次 · 双方均需提供可分享主题`
                  : '仅接收请喝电子咖啡邀请'}
              </p>
            </div>
            <span 
              className={`text-[11px] font-bold font-inter px-2 py-0.5 rounded ${
                user.acceptsTopicSwap ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {user.acceptsTopicSwap ? '开启中' : '已关闭'}
            </span>
          </div>
        </section>

        {/* Section 3: My 30-Minute Themes */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 border space-y-3 transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} style={{ color: theme.colors.primary }} />
              <h3 className="font-hanken text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>
                我的分享主题 ({user.myThemes.length}/3)
              </h3>
            </div>
            <button
              type="button"
              onClick={onManageThemes}
              className="text-[12px] font-bold font-inter flex items-center gap-1"
              style={{ color: theme.colors.primary }}
            >
              编辑主题 <ChevronRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {user.myThemes.map((t) => (
              <div 
                key={t.id} 
                className="p-3 rounded-xl border space-y-1"
                style={{
                  backgroundColor: theme.colors.bg,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-inter text-[13px] font-bold truncate" style={{ color: theme.colors.textPrimary }}>
                    {t.title}
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-500 font-medium shrink-0">
                    固定30分钟
                  </span>
                </div>
                <p className="font-inter text-[11px] line-clamp-1" style={{ color: theme.colors.textSecondary }}>
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Meeting Link & Time Slot Config */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 border space-y-2.5 transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h3 className="font-hanken text-[15px] font-bold" style={{ color: theme.colors.textPrimary }}>
            履约与会议设置
          </h3>

          <div 
            onClick={onManageSlots}
            className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <CalendarClock size={16} style={{ color: theme.colors.primary }} />
              <div>
                <h4 className="font-inter text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                  可预约时段排期
                </h4>
                <p className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  配置未来 7 天内接受对谈的可用时间窗口
                </p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: theme.colors.textMuted }} />
          </div>

          <div 
            onClick={onEditMeetingLink}
            className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <Link2 size={16} style={{ color: theme.colors.primary }} />
              <div>
                <h4 className="font-inter text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                  腾讯会议号配置
                </h4>
                <p className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                  {user.meetingLink || '832 910 293'}
                </p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: theme.colors.textMuted }} />
          </div>
        </section>

        {/* Section 5: Preview My Sharer Page */}
        <button
          type="button"
          onClick={onPreviewMyPage}
          className="w-full py-3.5 px-4 rounded-2xl border font-inter text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        >
          <Eye size={16} style={{ color: theme.colors.primary }} />
          <span>预览我的公开名片页</span>
          <ExternalLink size={13} style={{ color: theme.colors.textSecondary }} />
        </button>
      </main>
    </div>
  );
};
