import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Key, 
  Video, 
  Copy, 
  Check, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight,
  AlertTriangle,
  Star,
  Coffee,
  Repeat,
  ExternalLink,
  Calendar,
  CreditCard,
  XCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { ChatSession, UserProfile } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface ChatDetailViewProps {
  session: ChatSession;
  currentUser: UserProfile;
  onBack: () => void;
  onEnterMeeting: (session: ChatSession) => void;
  onPaySession: (session: ChatSession) => void;
  onCancelSession: (sessionId: string) => void;
  onOpenAcceptModal: (session: ChatSession) => void;
  onOpenDeclineModal: (session: ChatSession) => void;
  onOpenReview: (session: ChatSession) => void;
  onOpenComplaint: (session: ChatSession) => void;
}

export const ChatDetailView: React.FC<ChatDetailViewProps> = ({
  session,
  currentUser,
  onBack,
  onEnterMeeting,
  onPaySession,
  onCancelSession,
  onOpenAcceptModal,
  onOpenDeclineModal,
  onOpenReview,
  onOpenComplaint,
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isSent = session.senderId === currentUser.id;
  const isCoffee = session.sessionType === 'ECOFFEE';
  const counterpartName = isSent ? session.receiverName : session.senderName;
  const counterpartTitle = isSent ? session.receiverTitle : session.senderTitle;
  const counterpartAvatar = isSent ? session.receiverAvatar : session.senderAvatar;

  const isPendingResponse = session.status === 'PENDING_RESPONSE';
  const isPendingPayment = session.status === 'ACCEPTED_PENDING_PAYMENT';
  const isReady = session.status === 'BOOKED' || session.status === 'SWAP_SCHEDULED';
  const isCompleted = session.status === 'COMPLETED';
  const isDeclined = session.status === 'DECLINED';
  const isCancelled = session.status === 'CANCELLED' || session.status === 'EXPIRED';

  const handleCopyMeetingId = () => {
    navigator.clipboard.writeText(session.meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-10 transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar title="对谈详情" showBack onBack={onBack} />

      <main className="px-5 py-4 space-y-4">
        {/* Status Header Badge */}
        <section className="flex flex-col items-center gap-2">
          <div
            className="px-4 py-1.5 rounded-full font-inter text-[13px] font-bold flex items-center gap-1.5 shadow-sm border"
            style={{
              backgroundColor: isReady || isCompleted 
                ? 'rgba(16, 185, 129, 0.12)' 
                : isPendingPayment 
                ? theme.colors.accentTagBg 
                : theme.colors.surfaceElevated,
              borderColor: isReady || isCompleted 
                ? 'rgba(16, 185, 129, 0.3)' 
                : isPendingPayment 
                ? theme.colors.accentTagBorder 
                : theme.colors.border,
              color: isReady || isCompleted 
                ? '#10b981' 
                : isPendingPayment 
                ? theme.colors.primary 
                : theme.colors.textSecondary,
            }}
          >
            {isReady || isCompleted ? <CheckCircle2 size={16} /> : isPendingPayment ? <Clock size={16} /> : <AlertTriangle size={16} />}
            {isPendingResponse 
              ? (isSent ? '待对方回应' : '待您回应')
              : isPendingPayment 
              ? (isSent ? '对方已接受 · 请在2小时内付款' : '您已接受 · 待对方付款')
              : isReady 
              ? '已确认排期 · 即将开始' 
              : isCompleted 
              ? '对谈已完成' 
              : isDeclined 
              ? '邀请已婉拒' 
              : '对谈已取消'}
          </div>

          {/* Timeline */}
          <div 
            className="w-full mt-2 rounded-2xl p-4 shadow-ambient-lvl1 border transition-colors"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center justify-between text-center font-inter text-[10px]">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Check size={10} />
                </div>
                <span style={{ color: theme.colors.primary, fontWeight: 700 }}>
                  {isCoffee ? '发起邀请' : '提出互换'}
                </span>
              </div>

              <div className="w-8 h-[2px]" style={{ backgroundColor: !isPendingResponse ? theme.colors.primary : theme.colors.border }} />

              <div className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: !isPendingResponse && !isDeclined ? theme.colors.primary : theme.colors.surfaceElevated }}
                >
                  {!isPendingResponse && !isDeclined && <Check size={10} />}
                </div>
                <span style={{ color: !isPendingResponse && !isDeclined ? theme.colors.primary : theme.colors.textMuted, fontWeight: !isPendingResponse ? 700 : 500 }}>
                  确认时间
                </span>
              </div>

              <div className="w-8 h-[2px]" style={{ backgroundColor: isReady || isCompleted ? '#10b981' : theme.colors.border }} />

              <div className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: isReady || isCompleted ? '#10b981' : theme.colors.surfaceElevated }}
                >
                  {(isReady || isCompleted) && <Check size={10} />}
                </div>
                <span style={{ color: isReady || isCompleted ? '#10b981' : theme.colors.textMuted, fontWeight: isReady || isCompleted ? 700 : 500 }}>
                  {isCoffee ? '完成付款' : '就绪'}
                </span>
              </div>

              <div className="w-8 h-[2px]" style={{ backgroundColor: isCompleted ? '#10b981' : theme.colors.border }} />

              <div className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: isCompleted ? '#10b981' : theme.colors.surfaceElevated }}
                >
                  {isCompleted && <Check size={10} />}
                </div>
                <span style={{ color: isCompleted ? '#10b981' : theme.colors.textMuted, fontWeight: isCompleted ? 700 : 500 }}>
                  对谈评价
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Counterpart Card */}
        <section 
          className="rounded-2xl p-4 border flex items-center gap-3.5 shadow-sm"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <img
            src={counterpartAvatar}
            alt={counterpartName}
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
                {counterpartName}
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
              {counterpartTitle}
            </p>
          </div>
        </section>

        {/* Theme & Question Details */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 space-y-3 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <h3 
              className="font-hanken text-[15px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              对谈议题与交流内容
            </h3>
            {isCoffee ? (
              <span 
                className="text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
                style={{
                  backgroundColor: theme.colors.accentTagBg,
                  borderColor: theme.colors.accentTagBorder,
                  color: theme.colors.primary,
                }}
              >
                <Coffee size={12} />
                电子咖啡 (¥{session.price})
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                <Repeat size={12} />
                主题互换 (0元)
              </span>
            )}
          </div>

          {/* Primary Theme */}
          <div 
            className="p-3 rounded-xl border space-y-1"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-[11px] font-bold" style={{ color: theme.colors.primary }}>
              探讨主题：{session.themeTitle}
            </span>
            <p className="text-[12px] font-inter leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {session.themeDescription}
            </p>
          </div>

          {/* Inquirer's Question */}
          <div 
            className="p-3 rounded-xl border space-y-1"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-[11px] font-bold" style={{ color: theme.colors.textPrimary }}>
              {session.senderName} 提出的咨询问题：
            </span>
            <p className="text-[12px] font-inter leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {session.inquirerQuestion}
            </p>
          </div>

          {/* Reciprocal Section if Topic Swap */}
          {!isCoffee && session.swapThemeTitle && (
            <div 
              className="p-3 rounded-xl border space-y-1"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
              }}
            >
              <span className="text-[11px] font-bold text-blue-600">
                交换主题：{session.swapThemeTitle}
              </span>
              <p className="text-[12px] font-inter leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                {session.whatInquirerCanShare || session.swapThemeDescription}
              </p>
            </div>
          )}

          {/* Receiver's Question if Topic Swap */}
          {!isCoffee && session.receiverQuestion && (
            <div 
              className="p-3 rounded-xl border space-y-1"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
              }}
            >
              <span className="text-[11px] font-bold text-blue-600">
                {session.receiverName} 补充的问题：
              </span>
              <p className="text-[12px] font-inter leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                {session.receiverQuestion}
              </p>
            </div>
          )}
        </section>

        {/* Meeting Credentials Card (Visible when Ready or Completed) */}
        {isReady && (
          <section 
            className="rounded-2xl p-4 shadow-ambient-lvl2 border space-y-3.5 transition-colors"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={18} style={{ color: theme.colors.primary }} />
                <h3 
                  className="font-hanken text-[15px] font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  腾讯会议接入信息
                </h3>
              </div>
              <span 
                className="font-inter text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: theme.colors.accentTagBg,
                  borderColor: theme.colors.accentTagBorder,
                  color: theme.colors.primary,
                }}
              >
                准时接入
              </span>
            </div>

            <div 
              className="p-3 rounded-xl border space-y-2 font-inter text-[13px]"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
              }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: theme.colors.textSecondary }}>已确认时段</span>
                <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
                  {session.confirmedSlot || session.candidateSlots[0]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: theme.colors.textSecondary }}>会议号</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold" style={{ color: theme.colors.primary }}>
                    {session.meetingId}
                  </span>
                  <button
                    onClick={handleCopyMeetingId}
                    className="p-1 rounded-md hover:opacity-80 transition-colors"
                    style={{ color: theme.colors.primary }}
                    title="复制会议号"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEnterMeeting(session)}
              className="w-full py-3 rounded-xl text-white font-inter text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: theme.colors.shadowGlow,
              }}
            >
              <Video size={16} />
              <span>进入腾讯会议房间</span>
              <ExternalLink size={14} />
            </button>
          </section>
        )}

        {/* Digital Coffee Card (If E-Coffee) */}
        {isCoffee && session.coffeeDrink && (
          <section 
            className="rounded-2xl p-3.5 border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.accentTagBg,
              borderColor: theme.colors.accentTagBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="text-[24px]">{session.coffeeDrink.icon}</div>
              <div>
                <h4 className="text-[13px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
                  签名饮品：{session.coffeeDrink.name}
                </h4>
                <p className="text-[11px] font-inter" style={{ color: theme.colors.textSecondary }}>
                  {session.coffeeDrink.description}
                </p>
              </div>
            </div>
            <div className="font-hanken text-[16px] font-bold" style={{ color: theme.colors.primary }}>
              ¥{session.price}
            </div>
          </section>
        )}

        {/* Action Buttons for Interactive States */}
        {/* State A: Inquirer needs to pay */}
        {isSent && isPendingPayment && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onPaySession(session)}
              className="w-full py-3.5 rounded-xl text-white font-inter text-[14px] font-bold flex items-center justify-center gap-2 shadow-md"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: theme.colors.shadowGlow,
              }}
            >
              <CreditCard size={16} />
              <span>立即完成支付 (¥{session.price})</span>
            </button>
          </div>
        )}

        {/* State B: Receiver needs to respond */}
        {!isSent && isPendingResponse && (
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={() => onOpenDeclineModal(session)}
              className="flex-1 py-3 rounded-xl border text-[13px] font-bold font-inter flex items-center justify-center gap-1.5 text-rose-500"
              style={{
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              }}
            >
              <XCircle size={15} />
              <span>婉拒邀请</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAcceptModal(session)}
              className="flex-2 py-3 rounded-xl text-white text-[13px] font-bold font-inter flex items-center justify-center gap-1.5 shadow-md"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: theme.colors.shadowGlow,
              }}
            >
              <Check size={15} />
              <span>接受并确认时间</span>
            </button>
          </div>
        )}

        {/* State C: Completed -> Review / Complaint */}
        {isCompleted && (
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => onOpenReview(session)}
              className="w-full py-3 rounded-xl text-white font-inter text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm"
              style={{
                backgroundColor: theme.colors.primary,
                boxShadow: theme.colors.shadowGlow,
              }}
            >
              <Star size={15} />
              <span>{isCoffee ? '撰写对谈评价' : '提交盲评反馈'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenComplaint(session)}
              className="w-full py-2.5 rounded-xl border font-inter text-[12px] font-medium flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary,
              }}
            >
              <ShieldAlert size={14} className="text-rose-500" />
              <span>24小时异常售后申请</span>
            </button>
          </div>
        )}

        {/* Cancel option for upcoming appointments */}
        {isReady && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-[12px] font-inter text-rose-400 hover:underline"
            >
              申请取消并原路退款
            </button>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 text-center"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <AlertTriangle size={32} className="mx-auto text-amber-500" />
              <div>
                <h4 className="font-bold text-[16px]" style={{ color: theme.colors.textPrimary }}>
                  确认取消预约？
                </h4>
                <p className="text-[12px] mt-1" style={{ color: theme.colors.textSecondary }}>
                  对谈开始前取消将原路全额退款，该时段将重新释放给其他咨询者。
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-[13px] font-bold"
                  style={{
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                    color: theme.colors.textSecondary,
                  }}
                >
                  再想想
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    onCancelSession(session.id);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white bg-rose-500 text-[13px] font-bold shadow-md"
                >
                  确认取消
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
