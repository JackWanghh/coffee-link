import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Sparkles, Search, X, Users, RefreshCw } from 'lucide-react';
import { Sharer } from '../../types';
import { useTheme } from '../../theme';
import { TopAppBar } from '../TopAppBar';

interface DiscoverViewProps {
  sharers: Sharer[];
  onSelectSharer: (sharer: Sharer) => void;
}

const INDUSTRIES = [
  '全部',
  'AI 与算法',
  '互联网产品',
  '研发与架构',
  '战略与咨询',
  '设计与体验',
  '出海与商业化'
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  sharers,
  onSelectSharer,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('全部');

  const filteredSharers = useMemo(() => {
    return sharers.filter((sharer) => {
      // 1. 行业领域筛选
      if (selectedIndustry !== '全部') {
        const matchesIndustry = 
          sharer.industry === selectedIndustry ||
          (selectedIndustry === 'AI 与算法' && (sharer.title.includes('AI') || sharer.highlights.some(h => h.includes('AI') || h.includes('大模型')))) ||
          (selectedIndustry === '互联网产品' && (sharer.title.includes('产品') || sharer.company.includes('FinTech'))) ||
          (selectedIndustry === '研发与架构' && (sharer.title.includes('研发') || sharer.title.includes('技术') || sharer.highlights.some(h => h.includes('架构') || h.includes('并发')))) ||
          (selectedIndustry === '战略与咨询' && (sharer.title.includes('咨询') || sharer.title.includes('创始人') || sharer.highlights.some(h => h.includes('咨询')))) ||
          (selectedIndustry === '设计与体验' && (sharer.title.includes('设计') || sharer.title.includes('UX'))) ||
          (selectedIndustry === '出海与商业化' && (sharer.title.includes('出海') || sharer.title.includes('增长')));

        if (!matchesIndustry) return false;
      }

      // 2. 关键词搜索
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inName = sharer.name.toLowerCase().includes(q);
        const inTitle = sharer.title.toLowerCase().includes(q);
        const inCompany = sharer.company.toLowerCase().includes(q);
        const inIndustry = sharer.industry?.toLowerCase().includes(q) || false;
        const inHighlights = sharer.highlights.some(h => h.toLowerCase().includes(q));
        const inThemes = sharer.themes.some(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));

        if (!inName && !inTitle && !inCompany && !inIndustry && !inHighlights && !inThemes) {
          return false;
        }
      }

      return true;
    });
  }, [sharers, selectedIndustry, searchQuery]);

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[90px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Top App Bar identical to Chats and Profile */}
      <TopAppBar title="发现" />

      <main className="px-5 py-4 space-y-4">
        {/* Search & Industry Categories Filter Section */}
        <section className="space-y-3">
          {/* Search Box */}
          <div 
            className="flex items-center px-3.5 py-2.5 rounded-xl border transition-all duration-200 focus-within:ring-2"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <Search 
              size={16} 
              className="shrink-0 mr-2.5 transition-colors"
              style={{ color: theme.colors.textSecondary }} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索行业大牛、公司、主题或技能..."
              className="w-full bg-transparent text-[13px] font-inter focus:outline-none placeholder:text-zinc-500"
              style={{ color: theme.colors.textPrimary }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:opacity-80 text-zinc-400 transition-opacity ml-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Industry Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 select-none -mx-1 px-1">
            {INDUSTRIES.map((industry) => {
              const isSelected = selectedIndustry === industry;
              return (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className="px-3.5 py-1.5 rounded-full font-inter text-[12px] whitespace-nowrap transition-all duration-200 border shrink-0 active:scale-95 shadow-sm"
                  style={{
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    color: isSelected ? '#ffffff' : theme.colors.textSecondary,
                    fontWeight: isSelected ? 600 : 500,
                  }}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </section>

        {/* Discovery Feed List */}
        <div className="space-y-4 pt-1">
          {filteredSharers.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div 
                className="w-14 h-14 mb-3 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  color: theme.colors.primary,
                }}
              >
                <Users size={26} />
              </div>
              <h3 
                className="font-hanken text-[15px] font-bold mb-1"
                style={{ color: theme.colors.textPrimary }}
              >
                暂无匹配的从业者
              </h3>
              <p 
                className="font-inter text-[12px] max-w-[220px] mb-4"
                style={{ color: theme.colors.textSecondary }}
              >
                未能找到与 "{searchQuery || selectedIndustry}" 相关的对谈专家
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustry('全部');
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border text-[12px] font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                }}
              >
                <RefreshCw size={12} />
                清除筛选条件
              </button>
            </div>
          ) : (
            filteredSharers.map((sharer) => {
              const defaultTheme = sharer.themes[0];
              return (
                <article
                  key={sharer.id}
                  onClick={() => onSelectSharer(sharer)}
                  className="rounded-2xl p-4 shadow-ambient-lvl1 relative overflow-hidden transition-all duration-200 active:scale-[0.985] cursor-pointer border group"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }}
                >
                  {/* Header: Avatar, Name, Title, Verification */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative w-14 h-14 shrink-0">
                      <img
                        src={sharer.avatarUrl}
                        alt={sharer.name}
                        className="w-full h-full rounded-full object-cover border-2 shadow-md"
                        style={{
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surfaceElevated,
                        }}
                      />
                      {sharer.isVerified && (
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2"
                          style={{ borderColor: theme.colors.surface }}
                          title="已实名认证"
                        >
                          <CheckCircle2 size={10} className="text-white fill-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <h3 
                            className="font-hanken text-[17px] font-bold truncate transition-colors"
                            style={{ color: theme.colors.textPrimary }}
                          >
                            {sharer.name}
                          </h3>
                          {sharer.industry && (
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded font-inter shrink-0 font-medium"
                              style={{
                                backgroundColor: theme.colors.surfaceElevated,
                                color: theme.colors.textSecondary,
                                borderColor: theme.colors.border,
                              }}
                            >
                              {sharer.industry}
                            </span>
                          )}
                        </div>
                        <ChevronRight 
                          size={16} 
                          className="transition-all shrink-0 ml-1"
                          style={{ color: theme.colors.textMuted }}
                        />
                      </div>

                      <p 
                        className="font-inter text-[13px] truncate mt-0.5"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {sharer.title} @ {sharer.company}
                      </p>

                      {/* Signature Drink & Topic Swap Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: theme.colors.accentTagBg,
                            borderColor: theme.colors.accentTagBorder,
                            color: theme.colors.primary,
                          }}
                        >
                          <span>{sharer.signatureDrink.icon || '☕'}</span>
                          <span>{sharer.signatureDrink.name}</span>
                          <span className="font-mono">¥{sharer.signatureDrink.price}</span>
                        </span>

                        {sharer.acceptsTopicSwap && (
                          <span 
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderColor: 'rgba(59, 130, 246, 0.25)',
                              color: '#3b82f6',
                            }}
                          >
                            <span>🔄</span>
                            <span>支持主题互换</span>
                          </span>
                        )}
                      </div>

                      {/* Themes Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sharer.themes.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="border px-2 py-0.5 rounded text-[11px] font-normal font-inter"
                            style={{
                              backgroundColor: theme.colors.surfaceElevated,
                              borderColor: theme.colors.border,
                              color: theme.colors.textSecondary,
                            }}
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bio Representative Highlight */}
                  {sharer.highlights.length > 0 && (
                    <div 
                      className="mb-3 border-t pt-2.5"
                      style={{ borderColor: theme.colors.border }}
                    >
                      <p 
                        className="font-inter text-[13px] line-clamp-2 leading-relaxed"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {sharer.highlights[0]}
                      </p>
                    </div>
                  )}

                  {/* Footer: Available Slot & Coffee Price */}
                  <div 
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <div 
                      className="flex items-center gap-1.5"
                      style={{ color: theme.colors.primary }}
                    >
                      <Calendar size={13} />
                      <span className="font-inter text-[11px] font-medium">
                        {sharer.nextAvailableText}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div 
                        className="font-hanken text-[18px] font-bold"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        <span style={{ color: theme.colors.primary }}>¥</span>
                        {sharer.signatureDrink.price}
                        <span 
                          className="font-inter text-[11px] font-normal ml-0.5"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          /杯
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

