import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  ChevronRight, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Coffee,
  Repeat,
  ExternalLink,
  CreditCard,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ChatSession, SessionType, UserProfile } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface ChatsListViewProps {
  currentUser: UserProfile;
  sessions: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onEnterMeeting: (session: ChatSession) => void;
  onPaySession: (session: ChatSession) => void;
  onOpenAcceptModal: (session: ChatSession) => void;
  onOpenDeclineModal: (session: ChatSession) => void;
}

export const ChatsListView: React.FC<ChatsListViewProps> = ({
  currentUser,
  sessions,
  onSelectSession,
  onEnterMeeting,
  onPaySession,
  onOpenAcceptModal,
  onOpenDeclineModal,
}) => {
  const [directionSegment, setDirectionSegment] = useState<'SENT' | 'RECEIVED'>('SENT');
  const [filterTag, setFilterTag] = useState<string>('全部');
  const { theme } = useTheme();

  const filteredSessions = sessions.filter((s) => {
    const isSent = s.senderId === currentUser.id;
    if (directionSegment === 'SENT' && !isSent) return false;
    if (directionSegment === 'RECEIVED' && isSent) return false;

    if (filterTag === '全部') return true;
    if (filterTag === '待回应') return s.status === 'PENDING_RESPONSE';
    if (filterTag === '待付款') return s.status === 'ACCEPTED_PENDING_PAYMENT';
    if (filterTag === '已排期') return s.status === 'BOOKED' || s.status === 'SWAP_SCHEDULED';
    if (filterTag === '已完成') return s.status === 'COMPLETED';
    if (filterTag === '已关闭') return s.status === 'DECLINED' || s.status === 'CANCELLED' || s.status === 'EXPIRED';
    return true;
  });

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[90px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar title="对谈管理" />

      <main className="px-5 py-4 space-y-4">
        {/* Segmented Control: 我发起的 vs 发给我的 */}
        <div 
          className="flex p-1 rounded-xl w-full select-none border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <button
            onClick={() => setDirectionSegment('SENT')}
            className="flex-1 py-2 font-inter text-[13px] rounded-lg transition-all flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: directionSegment === 'SENT' ? theme.colors.primary : 'transparent',
              color: directionSegment === 'SENT' ? '#ffffff' : theme.colors.textSecondary,
              fontWeight: directionSegment === 'SENT' ? 700 : 500,
            }}
          >
            <span>我发起的邀请</span>
            <span className="text-[11px] opacity-80">
              ({sessions.filter((s) => s.senderId === currentUser.id).length})
            </span>
          </button>
          <button
            onClick={() => setDirectionSegment('RECEIVED')}
            className="flex-1 py-2 font-inter text-[13px] rounded-lg transition-all flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: directionSegment === 'RECEIVED' ? theme.colors.primary : 'transparent',
              color: directionSegment === 'RECEIVED' ? '#ffffff' : theme.colors.textSecondary,
              fontWeight: directionSegment === 'RECEIVED' ? 700 : 500,
            }}
          >
            <span>发给我的邀请</span>
            <span className="text-[11px] opacity-80">
              ({sessions.filter((s) => s.senderId !== currentUser.id).length})
            </span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['全部', '待回应', '待付款', '已排期', '已完成', '已关闭'].map((filter) => {
            const isSelected = filterTag === filter;
            return (
              <button
                key={filter}
                onClick={() => setFilterTag(filter)}
                className="px-3.5 py-1.5 rounded-full font-inter text-[12px] whitespace-nowrap transition-all border"
                style={{
                  backgroundColor: isSelected ? theme.colors.accentTagBg : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.accentTagBorder : theme.colors.border,
                  color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Session Cards List */}
        <div className="space-y-3.5 pt-1">
          {filteredSessions.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div 
                className="w-16 h-16 mb-3 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  color: theme.colors.primary,
                }}
              >
                <Coffee size={30} />
              </div>
              <h3 
                className="font-hanken text-[16px] font-bold mb-1"
                style={{ color: theme.colors.textPrimary }}
              >
                暂无相关对谈
              </h3>
              <p 
                className="font-inter text-[12px] max-w-[240px]"
                style={{ color: theme.colors.textSecondary }}
              >
                {directionSegment === 'SENT'
                  ? '您当前还没有发起的邀请，去发现页探索行业同侪发起咖啡或互换吧！'
                  : '您当前还没有收到来自他人的邀请。设置分享主题后，其他用户即可向您发起对谈。'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSent = session.senderId === currentUser.id;
              const isCoffee = session.sessionType === 'ECOFFEE';
              const counterpartName = isSent ? session.receiverName : session.senderName;
              const counterpartTitle = isSent ? session.receiverTitle : session.senderTitle;
              const counterpartAvatar = isSent ? session.receiverAvatar : session.senderAvatar;

              // Status styles
              let statusBadgeBg = theme.colors.surfaceElevated;
              let statusBadgeColor = theme.colors.textSecondary;
              let statusBadgeText = session.statusText;

              if (session.status === 'PENDING_RESPONSE') {
                statusBadgeBg = 'rgba(245, 158, 11, 0.12)';
                statusBadgeColor = '#d97706';
                statusBadgeText = isSent ? '待对方回应' : '待您回应';
              } else if (session.status === 'ACCEPTED_PENDING_PAYMENT') {
                statusBadgeBg = theme.colors.accentTagBg;
                statusBadgeColor = theme.colors.primary;
                statusBadgeText = isSent ? '对方已接受 · 待您付款' : '您已接受 · 待对方付款';
              } else if (session.status === 'BOOKED' || session.status === 'SWAP_SCHEDULED') {
                statusBadgeBg = 'rgba(16, 185, 129, 0.12)';
                statusBadgeColor = '#10b981';
                statusBadgeText = '已排期 · 即将开始';
              } else if (session.status === 'COMPLETED') {
                statusBadgeBg = 'rgba(16, 185, 129, 0.15)';
                statusBadgeColor = '#059669';
                statusBadgeText = '对谈已完成';
              } else if (session.status === 'DECLINED') {
                statusBadgeBg = 'rgba(244, 63, 94, 0.1)';
                statusBadgeColor = '#e11d48';
                statusBadgeText = '已婉拒';
              }

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className="rounded-2xl p-4 shadow-ambient-lvl1 border space-y-3 cursor-pointer transition-all active:scale-[0.99]"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }}
                >
                  {/* Top Bar: Session Type & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isCoffee ? (
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: theme.colors.accentTagBg,
                            borderColor: theme.colors.accentTagBorder,
                            color: theme.colors.primary,
                          }}
                        >
                          <Coffee size={12} />
                          电子咖啡 · {session.coffeeDrink?.name || '拿铁'} ¥{session.price}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Repeat size={12} />
                          主题互换 (0元对等)
                        </span>
                      )}
                    </div>

                    <span 
                      className="text-[11px] font-bold font-inter px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: statusBadgeBg,
                        color: statusBadgeColor,
                      }}
                    >
                      {statusBadgeText}
                    </span>
                  </div>

                  {/* Counterpart profile */}
                  <div className="flex items-start gap-3">
                    <img
                      src={counterpartAvatar}
                      alt={counterpartName}
                      className="w-11 h-11 rounded-full object-cover border"
                      style={{
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surfaceElevated,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 
                          className="font-inter text-[14px] font-bold truncate"
                          style={{ color: theme.colors.textPrimary }}
                        >
                          {session.themeTitle}
                        </h4>
                        <ChevronRight size={15} style={{ color: theme.colors.textMuted }} />
                      </div>
                      <p 
                        className="font-inter text-[12px] truncate mt-0.5"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {isSent ? `向 ${counterpartName} 请教` : `来自 ${counterpartName}`} ({counterpartTitle})
                      </p>
                    </div>
                  </div>

                  {/* Question preview */}
                  {session.inquirerQuestion && (
                    <div 
                      className="p-2.5 rounded-xl border text-[11px] font-inter line-clamp-2 leading-relaxed"
                      style={{
                        backgroundColor: theme.colors.bg,
                        borderColor: theme.colors.border,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <strong style={{ color: theme.colors.textPrimary }}>咨询议题：</strong>
                      {session.inquirerQuestion}
                    </div>
                  )}

                  {/* Confirmed Slot or Candidates */}
                  <div 
                    className="flex items-center justify-between text-[11px] font-inter pt-2 border-t"
                    style={{ borderColor: theme.colors.border }}
                  >
                    <span className="flex items-center gap-1" style={{ color: theme.colors.textSecondary }}>
                      <Calendar size={13} style={{ color: theme.colors.primary }} />
                      {session.confirmedSlot 
                        ? `已定时间：${session.confirmedSlot}`
                        : `候选时段：${session.candidateSlots.slice(0, 2).join(' / ')}${session.candidateSlots.length > 2 ? '等' : ''}`}
                    </span>
                    <span className="flex items-center gap-1 font-mono" style={{ color: theme.colors.textMuted }}>
                      <Clock size={12} /> 30分钟
                    </span>
                  </div>

                  {/* Action Buttons for Interactive States */}
                  {/* Case 1: Inquirer needs to pay for accepted coffee */}
                  {isSent && session.status === 'ACCEPTED_PENDING_PAYMENT' && (
                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onPaySession(session)}
                        className="w-full py-2.5 px-4 rounded-xl text-white font-inter text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                        style={{
                          backgroundColor: theme.colors.primary,
                          boxShadow: theme.colors.shadowGlow,
                        }}
                      >
                        <CreditCard size={14} />
                        <span>立即支付 ¥{session.price} 并锁定对谈</span>
                      </button>
                    </div>
                  )}

                  {/* Case 2: Receiver needs to respond to pending invitation */}
                  {!isSent && session.status === 'PENDING_RESPONSE' && (
                    <div className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onOpenDeclineModal(session)}
                        className="flex-1 py-2 px-3 rounded-xl border text-[12px] font-bold font-inter flex items-center justify-center gap-1 text-rose-500"
                        style={{
                          backgroundColor: theme.colors.surfaceElevated,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <XCircle size={13} />
                        <span>婉拒</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAcceptModal(session)}
                        className="flex-2 py-2 px-4 rounded-xl text-white text-[12px] font-bold font-inter flex items-center justify-center gap-1 shadow-sm"
                        style={{
                          backgroundColor: theme.colors.primary,
                          boxShadow: theme.colors.shadowGlow,
                        }}
                      >
                        <Check size={13} />
                        <span>接受并确认时间</span>
                      </button>
                    </div>
                  )}

                  {/* Case 3: Booked / Swap scheduled -> Meeting shortcut */}
                  {(session.status === 'BOOKED' || session.status === 'SWAP_SCHEDULED') && (
                    <div className="pt-1 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onEnterMeeting(session)}
                        className="w-full py-2 px-3 rounded-xl text-[12px] font-bold font-inter flex items-center justify-center gap-1.5 border text-blue-500 shadow-sm"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.08)',
                          borderColor: 'rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        <Video size={13} />
                        <span>进入腾讯会议 ({session.meetingId})</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
