import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Star, 
  Info, 
  GraduationCap, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Coffee,
  Repeat,
  Sparkles
} from 'lucide-react';
import { Sharer, ChatTheme, SessionType } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface SharerDetailViewProps {
  sharer: Sharer;
  onBack: () => void;
  onStartInvitation: (sharer: Sharer, mode: SessionType, themeId?: string) => void;
}

export const SharerDetailView: React.FC<SharerDetailViewProps> = ({
  sharer,
  onBack,
  onStartInvitation,
}) => {
  const { theme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(sharer.themes[0]?.id || '');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  const currentDay = sharer.availableDays[selectedDayIndex] || sharer.availableDays[0];
  const selectedTheme = sharer.themes.find((t) => t.id === selectedThemeId) || sharer.themes[0];

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[120px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Navigation Bar */}
      <TopAppBar title="分享者详情" showBack onBack={onBack} />

      <main className="px-5 py-4 space-y-4">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-2.5">
            <img
              src={sharer.avatarUrl}
              alt={sharer.name}
              className="w-full h-full object-cover rounded-full shadow-ambient-lvl2 border-4"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceElevated,
              }}
            />
            {sharer.isVerified && (
              <div
                className="absolute bottom-0 right-0 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.surface,
                }}
                title="已实名认证"
              >
                <ShieldCheck size={14} className="text-white" />
              </div>
            )}
          </div>

          <h2 
            className="font-hanken text-[20px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {sharer.name}
          </h2>
          <p 
            className="font-inter text-[13px] font-medium mt-0.5"
            style={{ color: theme.colors.primary }}
          >
            {sharer.title} @ {sharer.company}
          </p>

          {/* User Declaration Note */}
          <div 
            className="mt-2.5 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 max-w-xs shadow-sm"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <Info size={13} className="shrink-0" style={{ color: theme.colors.textSecondary }} />
            <p 
              className="font-inter text-[11px] text-left leading-tight"
              style={{ color: theme.colors.textSecondary }}
            >
              {sharer.declarationNote}
            </p>
          </div>
        </section>

        {/* Signature Coffee Card */}
        <section 
          className="rounded-2xl p-4 border shadow-sm flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.accentTagBg,
            borderColor: theme.colors.accentTagBorder,
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] border"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              {sharer.signatureDrink.icon || '☕'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>
                  签名饮品
                </span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 font-semibold">
                  {sharer.signatureDrink.tag || '推荐'}
                </span>
              </div>
              <h4 className="text-[15px] font-bold font-hanken" style={{ color: theme.colors.textPrimary }}>
                {sharer.signatureDrink.name}
              </h4>
              <p className="text-[11px] font-inter mt-0.5 line-clamp-1" style={{ color: theme.colors.textSecondary }}>
                {sharer.signatureDrink.description}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-hanken text-[18px] font-bold" style={{ color: theme.colors.primary }}>
              ¥{sharer.signatureDrink.price}
            </div>
            <div className="text-[10px] font-inter" style={{ color: theme.colors.textMuted }}>
              / 30分钟
            </div>
          </div>
        </section>

        {/* Topic Swap Availability Status */}
        <section 
          className="rounded-xl p-3 border flex items-center justify-between"
          style={{
            backgroundColor: sharer.acceptsTopicSwap ? 'rgba(59, 130, 246, 0.06)' : theme.colors.surface,
            borderColor: sharer.acceptsTopicSwap ? 'rgba(59, 130, 246, 0.2)' : theme.colors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <Repeat 
              size={16} 
              className={sharer.acceptsTopicSwap ? 'text-blue-500' : 'text-zinc-400'} 
            />
            <div>
              <div className="text-[12px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                {sharer.acceptsTopicSwap ? '支持主题互换（0元对等交流）' : '暂未开放主题互换'}
              </div>
              <div className="text-[11px] font-inter" style={{ color: theme.colors.textSecondary }}>
                {sharer.acceptsTopicSwap 
                  ? `本周剩余 ${sharer.remainingSwapQuota}/${sharer.weeklySwapLimit} 个互换名额`
                  : '仅接受请喝电子咖啡邀请'}
              </div>
            </div>
          </div>

          {sharer.acceptsTopicSwap && (
            <span className="text-[11px] font-bold text-blue-500 font-inter">
              可互换
            </span>
          )}
        </section>

        {/* Bio & Experience Highlights */}
        <section 
          className="rounded-2xl shadow-ambient-lvl1 p-4 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h3 
            className="font-inter text-[13px] font-bold mb-2.5 flex items-center gap-2"
            style={{ color: theme.colors.textPrimary }}
          >
            <GraduationCap size={16} style={{ color: theme.colors.primary }} />
            职业背景与亮点
          </h3>
          <ul className="space-y-2 font-inter text-[12px] leading-relaxed">
            {sharer.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <p style={{ color: theme.colors.textSecondary }}>{highlight}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 30-Minute Themes */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 
              className="font-hanken text-[16px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              开放交流的主题 (固定30分钟)
            </h3>
            <span className="text-[11px] font-inter" style={{ color: theme.colors.textMuted }}>
              共 {sharer.themes.length} 个主题
            </span>
          </div>

          <div className="space-y-2.5">
            {sharer.themes.map((t) => {
              const isSelected = selectedThemeId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedThemeId(t.id)}
                  className="rounded-2xl p-4 shadow-ambient-lvl1 border-l-4 transition-all duration-200 cursor-pointer border"
                  style={{
                    backgroundColor: isSelected ? theme.colors.surfaceElevated : theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderLeftColor: isSelected ? theme.colors.primary : 'transparent',
                    boxShadow: isSelected ? theme.colors.shadowGlow : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 
                        className="font-inter text-[14px] font-bold"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {t.title}
                      </h4>
                      <p 
                        className="font-inter text-[12px] mt-1 leading-snug"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {t.description}
                      </p>
                    </div>
                  </div>

                  {/* Included / Excluded items */}
                  <div 
                    className="space-y-1.5 my-2.5 pt-2 border-t"
                    style={{ borderColor: theme.colors.border }}
                  >
                    {t.includes.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-inter text-[11px] text-emerald-500">
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                    {t.excludes.map((exc, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-inter text-[11px] text-rose-400">
                        <XCircle size={12} className="shrink-0" />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>

                  <div 
                    className="flex items-center justify-between border-t pt-2"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <span 
                      className="font-inter text-[11px] flex items-center gap-1"
                      style={{ color: theme.colors.textMuted }}
                    >
                      <Clock size={11} /> 30 分钟对谈
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: theme.colors.primary }}>
                      点击选中该主题
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Availability / Time Slots Preview */}
        <section 
          className="rounded-2xl shadow-ambient-lvl1 p-4 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h3 
              className="font-inter text-[13px] font-bold flex items-center gap-1.5"
              style={{ color: theme.colors.textPrimary }}
            >
              <Calendar size={15} style={{ color: theme.colors.primary }} />
              近期可约时间
            </h3>
            <span 
              className="font-inter text-[10px] px-1.5 py-0.5 rounded font-medium border"
              style={{
                backgroundColor: theme.colors.accentTagBg,
                borderColor: theme.colors.accentTagBorder,
                color: theme.colors.primary,
              }}
            >
              未来 7 天
            </span>
          </div>

          {/* Days Horizontal Scroller */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {sharer.availableDays.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={idx}
                  disabled={day.isFull}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="shrink-0 w-19 p-2 rounded-xl text-center transition-all duration-150 active:scale-95 border"
                  style={{
                    backgroundColor: isSelected ? theme.colors.surfaceElevated : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    opacity: day.isFull ? 0.45 : 1,
                  }}
                >
                  <div 
                    className="font-inter text-[10px] mb-0.5"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {day.date}
                  </div>
                  <div 
                    className="font-inter text-[12px] font-bold"
                    style={{ color: isSelected ? theme.colors.primary : theme.colors.textPrimary }}
                  >
                    {day.dayOfWeek}
                  </div>
                  <div 
                    className="mt-0.5 text-[10px]"
                    style={{ color: day.isFull ? theme.colors.textMuted : theme.colors.primary }}
                  >
                    {day.isFull ? '已满' : `${day.slots.length}个时段`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Reviews & Credibility Summary */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 
              className="font-hanken text-[16px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              真实评价与履约信誉
            </h3>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: theme.colors.textSecondary }}>
              <span>按时率 {sharer.onTimeRate || '100%'}</span>
              <span>•</span>
              <span>响应 {sharer.responseMedianTime || '1.5小时'}</span>
            </div>
          </div>

          <div className="space-y-2">
            {sharer.reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="p-3 rounded-xl border transition-colors"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center font-inter text-[10px] font-bold text-white"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {rev.authorInitials}
                    </div>
                    <span 
                      className="font-inter text-[12px] font-semibold"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {rev.authorName}
                    </span>
                  </div>
                  <div className="flex" style={{ color: theme.colors.primary }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p 
                  className="font-inter text-[12px] leading-relaxed"
                  style={{ color: theme.colors.textSecondary }}
                >
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar with 2 Pathways */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t p-3.5 shadow-ambient-top transition-colors duration-300"
        style={{
          backgroundColor: `${theme.colors.bg}FA`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          {/* Option A: E-Coffee (Primary) */}
          <button
            onClick={() => onStartInvitation(sharer, 'ECOFFEE', selectedTheme?.id)}
            className="text-white font-inter text-[13px] font-bold py-3 px-3 rounded-xl active:scale-95 transition-all duration-200 flex-1 flex items-center justify-center gap-1.5 shadow-md"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            <Coffee size={15} />
            <span>请喝咖啡 (¥{sharer.signatureDrink.price})</span>
          </button>

          {/* Option B: Topic Swap (Secondary) */}
          {sharer.acceptsTopicSwap ? (
            <button
              onClick={() => onStartInvitation(sharer, 'TOPIC_SWAP', selectedTheme?.id)}
              className="font-inter text-[13px] font-bold py-3 px-3 rounded-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 border"
              style={{
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            >
              <Repeat size={14} className="text-blue-500" />
              <span>主题互换 (0元)</span>
            </button>
          ) : (
            <button
              disabled
              className="font-inter text-[12px] font-medium py-3 px-3 rounded-xl opacity-40 border cursor-not-allowed"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textMuted,
              }}
            >
              未开互换
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
