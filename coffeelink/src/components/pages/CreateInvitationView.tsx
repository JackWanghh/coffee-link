import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  HelpCircle, 
  ArrowRight, 
  AlertCircle,
  Coffee,
  Repeat,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import { Sharer, ChatTheme, SessionType, ChatSession, UserProfile } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface CreateInvitationViewProps {
  sharer: Sharer;
  currentUser: UserProfile;
  initialMode?: SessionType;
  initialThemeId?: string;
  onBack: () => void;
  onSubmitSuccess: (newSession: ChatSession) => void;
  onGoToSharingCenter: () => void;
  onRequireLogin?: () => void;
}

export const CreateInvitationView: React.FC<CreateInvitationViewProps> = ({
  sharer,
  currentUser,
  initialMode = 'ECOFFEE',
  initialThemeId,
  onBack,
  onSubmitSuccess,
  onGoToSharingCenter,
  onRequireLogin,
}) => {
  const { theme } = useTheme();

  // Mode Selection: 'ECOFFEE' (请喝咖啡) vs 'TOPIC_SWAP' (主题互换)
  const [sessionType, setSessionType] = useState<SessionType>(
    sharer.acceptsTopicSwap && initialMode === 'TOPIC_SWAP' ? 'TOPIC_SWAP' : 'ECOFFEE'
  );

  // Selected Target Sharer's Theme
  const [selectedTargetThemeId, setSelectedTargetThemeId] = useState<string>(
    initialThemeId || sharer.themes[0]?.id || ''
  );

  // Inquirer's Question for the Target Sharer (Mandatory 20-300 chars)
  const [inquirerQuestion, setInquirerQuestion] = useState<string>('');

  // Selected Offer Theme (for Topic Swap)
  const [selectedMyThemeId, setSelectedMyThemeId] = useState<string>(
    currentUser.myThemes[0]?.id || ''
  );
  // What Inquirer Can Share (for Topic Swap)
  const [whatInquirerCanShare, setWhatInquirerCanShare] = useState<string>('');

  // Candidate Time Slots (Pick up to 3)
  const [selectedCandidateSlots, setSelectedCandidateSlots] = useState<string[]>(() => {
    const firstDay = sharer.availableDays[0];
    if (firstDay && firstDay.slots.length > 0) {
      return [`${firstDay.date} ${firstDay.slots[0]}`];
    }
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTargetTheme = sharer.themes.find((t) => t.id === selectedTargetThemeId) || sharer.themes[0];
  const selectedMyTheme = currentUser.myThemes.find((t) => t.id === selectedMyThemeId) || currentUser.myThemes[0];

  // Helper to toggle candidate slot
  const toggleCandidateSlot = (slotStr: string) => {
    if (selectedCandidateSlots.includes(slotStr)) {
      setSelectedCandidateSlots(selectedCandidateSlots.filter((s) => s !== slotStr));
    } else {
      if (selectedCandidateSlots.length >= 3) {
        setErrorMessage('最多可选择 3 个期望时段，以便分享者协调安排');
        return;
      }
      setErrorMessage(null);
      setSelectedCandidateSlots([...selectedCandidateSlots, slotStr]);
    }
  };

  const handleSubmit = () => {
    // Check login state
    if (!currentUser.isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin();
      } else {
        setErrorMessage('请先登录或注册账号后提交邀请');
      }
      return;
    }

    // Validation
    if (!inquirerQuestion.trim() || inquirerQuestion.trim().length < 10) {
      setErrorMessage('请填写想聊的具体问题（不少于 10 个字），以便对方评估对谈适合度');
      return;
    }

    if (selectedCandidateSlots.length === 0) {
      setErrorMessage('请至少选择 1 个期望时段');
      return;
    }

    if (sessionType === 'TOPIC_SWAP') {
      if (!currentUser.isSharingOpen || currentUser.myThemes.length === 0) {
        setErrorMessage('您尚未设置分享主题，无法发起主题互换');
        return;
      }
      if (!whatInquirerCanShare.trim() || whatInquirerCanShare.trim().length < 10) {
        setErrorMessage('请简述您围绕互换主题能分享的内容（不少于 10 个字）');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);

      const newSession: ChatSession = {
        id: `ord-inv-${Date.now()}`,
        sessionType: sessionType,
        orderNumber: sessionType === 'ECOFFEE' 
          ? `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
          : `SWP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderTitle: `${currentUser.title} @ ${currentUser.company}`,
        senderAvatar: currentUser.avatarUrl,
        receiverId: sharer.id,
        receiverName: sharer.name,
        receiverTitle: `${sharer.title} @ ${sharer.company}`,
        receiverAvatar: sharer.avatarUrl,
        themeId: selectedTargetTheme.id,
        themeTitle: selectedTargetTheme.title,
        themeDescription: selectedTargetTheme.description,
        inquirerQuestion: inquirerQuestion.trim(),
        candidateSlots: selectedCandidateSlots,
        meetingType: '腾讯会议',
        meetingId: sharer.meetingLink.split('/').pop() || '832 910 293',
        meetingUrl: sharer.meetingLink || 'https://meeting.tencent.com/dm/832910293',
        status: 'PENDING_RESPONSE',
        statusText: '待对方回应',
        createdAt: '刚刚',
        durationMinutes: 30,
      };

      if (sessionType === 'ECOFFEE') {
        newSession.coffeeDrink = sharer.signatureDrink;
        newSession.price = sharer.signatureDrink.price;
      } else {
        newSession.swapThemeId = selectedMyTheme?.id;
        newSession.swapThemeTitle = selectedMyTheme?.title;
        newSession.swapThemeDescription = selectedMyTheme?.description;
        newSession.whatInquirerCanShare = whatInquirerCanShare.trim();
      }

      onSubmitSuccess(newSession);
    }, 900);
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[120px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar 
        title={sessionType === 'ECOFFEE' ? '发起电子咖啡邀请' : '发起主题互换邀请'} 
        showBack 
        onBack={onBack} 
      />

      <main className="px-5 py-4 space-y-4">
        {/* Sharer Header Card */}
        <section 
          className="rounded-2xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <img
            src={sharer.avatarUrl}
            alt={sharer.name}
            className="w-13 h-13 rounded-full object-cover border"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceElevated,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 
                className="font-hanken text-[16px] font-bold truncate"
                style={{ color: theme.colors.textPrimary }}
              >
                {sharer.name}
              </h3>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded font-medium border"
                style={{
                  backgroundColor: theme.colors.accentTagBg,
                  borderColor: theme.colors.accentTagBorder,
                  color: theme.colors.primary,
                }}
              >
                身份已核验
              </span>
            </div>
            <p 
              className="font-inter text-[12px] truncate mt-0.5"
              style={{ color: theme.colors.textSecondary }}
            >
              {sharer.title} @ {sharer.company}
            </p>
          </div>
        </section>

        {/* Mode Switcher Tabs */}
        <section 
          className="p-1 rounded-xl border grid grid-cols-2 gap-1"
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          }}
        >
          <button
            type="button"
            onClick={() => setSessionType('ECOFFEE')}
            className="py-2.5 px-3 rounded-lg text-[13px] font-bold font-inter flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{
              backgroundColor: sessionType === 'ECOFFEE' ? theme.colors.surface : 'transparent',
              color: sessionType === 'ECOFFEE' ? theme.colors.primary : theme.colors.textSecondary,
              boxShadow: sessionType === 'ECOFFEE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Coffee size={15} />
            <span>请喝电子咖啡</span>
            <span className="text-[11px] font-mono opacity-85">¥{sharer.signatureDrink.price}</span>
          </button>

          <button
            type="button"
            onClick={() => setSessionType('TOPIC_SWAP')}
            className="py-2.5 px-3 rounded-lg text-[13px] font-bold font-inter flex items-center justify-center gap-1.5 transition-all duration-200"
            style={{
              backgroundColor: sessionType === 'TOPIC_SWAP' ? theme.colors.surface : 'transparent',
              color: sessionType === 'TOPIC_SWAP' ? theme.colors.primary : theme.colors.textSecondary,
              boxShadow: sessionType === 'TOPIC_SWAP' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Repeat size={15} />
            <span>主题互换</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-500 font-normal">
              0元交流
            </span>
          </button>
        </section>

        {/* Mode Explain Banner */}
        {sessionType === 'ECOFFEE' ? (
          <div 
            className="p-3.5 rounded-xl border flex items-start gap-2.5 text-[12px] font-inter leading-relaxed"
            style={{
              backgroundColor: theme.colors.accentTagBg,
              borderColor: theme.colors.accentTagBorder,
              color: theme.colors.textPrimary,
            }}
          >
            <span className="text-[16px] shrink-0">{sharer.signatureDrink.icon || '☕'}</span>
            <div>
              <p className="font-bold mb-0.5">
                请对方喝一杯【{sharer.signatureDrink.name}】表达感谢 (¥{sharer.signatureDrink.price})
              </p>
              <p className="text-[11px] opacity-80" style={{ color: theme.colors.textSecondary }}>
                提交邀请暂不扣款。对方查阅您的问题并在12小时内接受确认时间后，您再进行支付。
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="p-3.5 rounded-xl border flex items-start gap-2.5 text-[12px] font-inter leading-relaxed"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
              color: theme.colors.textPrimary,
            }}
          >
            <Repeat size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5 text-blue-600">
                双向主题互换 · 30分钟对等交流（免付款）
              </p>
              <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                您与对方均已开放分享主题。双方围绕各自议题展开探讨（建议各约15分钟），无需支付费用。
              </p>
            </div>
          </div>
        )}

        {/* If Topic Swap chosen but current user has not enabled sharing yet */}
        {sessionType === 'TOPIC_SWAP' && (!currentUser.isSharingOpen || currentUser.myThemes.length === 0) && (
          <div 
            className="p-4 rounded-xl border text-center space-y-3"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <AlertCircle size={24} className="mx-auto text-amber-500" />
            <div>
              <h4 className="font-bold text-[14px]" style={{ color: theme.colors.textPrimary }}>
                尚未开放个人分享主题
              </h4>
              <p className="text-[12px] mt-1" style={{ color: theme.colors.textSecondary }}>
                发起主题互换需要您本身也设置了可供他人咨询的主题。
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToSharingCenter}
              className="px-4 py-2 rounded-xl text-white text-[13px] font-bold font-inter inline-flex items-center gap-1.5 shadow-sm active:scale-95"
              style={{ backgroundColor: theme.colors.primary }}
            >
              前往分享中心开启
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Step 1: Select Target Theme */}
        <section className="space-y-2">
          <label 
            className="block text-[13px] font-bold font-inter"
            style={{ color: theme.colors.textPrimary }}
          >
            1. 想请教对方的主题 (固定30分钟)
          </label>
          <div className="space-y-2">
            {sharer.themes.map((t) => {
              const isSelected = selectedTargetThemeId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTargetThemeId(t.id)}
                  className="p-3.5 rounded-xl border transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? theme.colors.surfaceElevated : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    boxShadow: isSelected ? theme.colors.shadowGlow : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                        {t.title}
                      </h4>
                      <p className="text-[12px] font-inter mt-1 leading-snug" style={{ color: theme.colors.textSecondary }}>
                        {t.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="shrink-0 ml-2" style={{ color: theme.colors.primary }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2 (Topic Swap Only): Select My Theme & What I Can Share */}
        {sessionType === 'TOPIC_SWAP' && currentUser.isSharingOpen && currentUser.myThemes.length > 0 && (
          <section className="space-y-3 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
            <label 
              className="block text-[13px] font-bold font-inter"
              style={{ color: theme.colors.textPrimary }}
            >
              2. 您用于交换的分享主题
            </label>
            <div className="space-y-2">
              {currentUser.myThemes.map((myT) => {
                const isSelected = selectedMyThemeId === myT.id;
                return (
                  <div
                    key={myT.id}
                    onClick={() => setSelectedMyThemeId(myT.id)}
                    className="p-3.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? theme.colors.surfaceElevated : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                          {myT.title}
                        </h4>
                        <p className="text-[12px] font-inter mt-0.5 leading-snug" style={{ color: theme.colors.textSecondary }}>
                          {myT.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="shrink-0 ml-2" style={{ color: theme.colors.primary }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1">
              <label 
                className="block text-[12px] font-medium font-inter"
                style={{ color: theme.colors.textSecondary }}
              >
                简述您能围绕该主题为对方分享什么：
              </label>
              <textarea
                value={whatInquirerCanShare}
                onChange={(e) => setWhatInquirerCanShare(e.target.value)}
                placeholder="例如：可分享我在上家公司搭建双周敏捷发版机制的具体OKR与踩坑经历..."
                rows={2}
                className="w-full p-3 rounded-xl border text-[13px] font-inter focus:outline-none focus:ring-2 resize-none"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                }}
              />
            </div>
          </section>
        )}

        {/* Step 3: Inquirer's Specific Question */}
        <section className="space-y-2 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between">
            <label 
              className="text-[13px] font-bold font-inter"
              style={{ color: theme.colors.textPrimary }}
            >
              {sessionType === 'ECOFFEE' ? '2. 想请教的具体问题' : '3. 想向对方请教的问题'}
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <span className="text-[11px] font-mono" style={{ color: theme.colors.textMuted }}>
              {inquirerQuestion.length}/300
            </span>
          </div>

          <textarea
            value={inquirerQuestion}
            onChange={(e) => setInquirerQuestion(e.target.value.slice(0, 300))}
            placeholder="请清晰描述您的背景与最想了解的职业经历/关键问题（建议 20~300 字）。分享者将根据问题判断是否适合交流并决定是否接受。"
            rows={4}
            className="w-full p-3 rounded-xl border text-[13px] font-inter focus:outline-none focus:ring-2 resize-none leading-relaxed"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            }}
          />
        </section>

        {/* Step 4: Pick Candidate Time Slots (Max 3) */}
        <section className="space-y-2.5 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center justify-between">
            <label 
              className="text-[13px] font-bold font-inter"
              style={{ color: theme.colors.textPrimary }}
            >
              {sessionType === 'ECOFFEE' ? '3. 选择期望时段 (最多3个)' : '4. 选择期望时段 (最多3个)'}
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <span className="text-[11px] font-mono" style={{ color: theme.colors.primary }}>
              已选 {selectedCandidateSlots.length}/3
            </span>
          </div>

          <p className="text-[11px] font-inter" style={{ color: theme.colors.textSecondary }}>
            提供多个候选时间可大幅提升被接受的成功率；分享者接受时将从中确认 1 个最终时间。
          </p>

          <div className="space-y-2">
            {sharer.availableDays.map((day, dIdx) => (
              <div 
                key={dIdx} 
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                    {day.date} ({day.dayOfWeek})
                  </span>
                  <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>
                    {day.isFull ? '已满' : `${day.slots.length} 个候选时段`}
                  </span>
                </div>

                {day.slots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {day.slots.map((slot, sIdx) => {
                      const slotKey = `${day.date} ${slot}`;
                      const isPicked = selectedCandidateSlots.includes(slotKey);
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => toggleCandidateSlot(slotKey)}
                          className="py-1.5 px-2 rounded-lg text-[12px] font-inter font-medium border flex items-center justify-between transition-all"
                          style={{
                            backgroundColor: isPicked ? theme.colors.primary : theme.colors.surfaceElevated,
                            color: isPicked ? '#ffffff' : theme.colors.textPrimary,
                            borderColor: isPicked ? theme.colors.primary : theme.colors.border,
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {slot}
                          </span>
                          {isPicked && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400">无空闲时段</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[12px] font-inter flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </main>

      {/* Sticky Bottom Submit Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t p-4 shadow-ambient-top transition-colors duration-300"
        style={{
          backgroundColor: `${theme.colors.bg}FA`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              {sessionType === 'ECOFFEE' ? '签名咖啡款（接受后付）' : '主题互换'}
            </div>
            <div className="font-hanken text-[20px] font-bold" style={{ color: theme.colors.textPrimary }}>
              {sessionType === 'ECOFFEE' ? (
                <>
                  <span style={{ color: theme.colors.primary }}>¥</span>
                  {sharer.signatureDrink.price}
                </>
              ) : (
                <span className="text-emerald-500 text-[16px]">免费对谈 (0元)</span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="text-white font-inter text-[14px] font-bold py-3 px-6 rounded-xl active:scale-95 transition-all duration-200 flex-1 max-w-[200px] flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            {isSubmitting ? (
              <span>提交中...</span>
            ) : (
              <>
                <span>{sessionType === 'ECOFFEE' ? '提交咖啡邀请' : '发出互换邀请'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
