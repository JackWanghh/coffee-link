import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Star, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock,
  Coffee,
  Repeat,
  AlertCircle,
  HelpCircle,
  Video,
  Sparkles
} from 'lucide-react';
import { UserProfile, ChatTheme, Order, CoffeeDrink, SessionType } from '../../types';
import { COFFEE_CATALOG } from '../../data/mockData';
import { useTheme } from '../../theme';

// MARK: - 1. Select Signature Drink Modal (设置签名饮品)
export const SelectSignatureDrinkModal: React.FC<{
  currentDrink: CoffeeDrink;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (drink: CoffeeDrink) => void;
}> = ({ currentDrink, isOpen, onClose, onSelect }) => {
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(currentDrink?.id || COFFEE_CATALOG[0].id);

  if (!isOpen) return null;

  const chosenDrink = COFFEE_CATALOG.find((d) => d.id === selectedId) || COFFEE_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              设置我的签名饮品
            </h3>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              咨询者发起邀请被您接受后，将为您点此饮品
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 font-inter">
          {COFFEE_CATALOG.map((drink) => {
            const isSelected = selectedId === drink.id;
            return (
              <div
                key={drink.id}
                onClick={() => setSelectedId(drink.id)}
                className="p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
                style={{
                  backgroundColor: isSelected ? theme.colors.accentTagBg : theme.colors.bg,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  boxShadow: isSelected ? theme.colors.shadowGlow : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] border shrink-0"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    {drink.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold" style={{ color: theme.colors.textPrimary }}>
                        {drink.name}
                      </span>
                      {drink.tag && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-semibold bg-amber-500/10 text-amber-600">
                          {drink.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: theme.colors.textSecondary }}>
                      {drink.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="font-hanken text-[15px] font-bold" style={{ color: theme.colors.primary }}>
                    ¥{drink.price}
                  </div>
                  {isSelected && (
                    <div className="flex justify-end mt-0.5">
                      <Check size={14} style={{ color: theme.colors.primary }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSelect(chosenDrink);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            确认选定
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 2. Sharer Accept Invitation Modal (分享者接受邀请并确认时间)
export const SharerAcceptInvitationModal: React.FC<{
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (orderId: string, confirmedSlot: string, receiverQuestion?: string) => void;
}> = ({ order, isOpen, onClose, onAccept }) => {
  const { theme } = useTheme();
  const [selectedSlot, setSelectedSlot] = useState<string>(order?.candidateSlots[0] || '');
  const [receiverQuestion, setReceiverQuestion] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isSwap = order.sessionType === 'TOPIC_SWAP';

  const handleConfirm = () => {
    if (!selectedSlot) {
      setError('请确认 1 个您可用的对谈时段');
      return;
    }
    if (isSwap && (!receiverQuestion.trim() || receiverQuestion.trim().length < 8)) {
      setError('主题互换请补充一个想向对方了解的问题（不少于 8 个字）');
      return;
    }
    onAccept(order.id, selectedSlot, receiverQuestion.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              {isSwap ? '接受主题互换邀请' : '接受电子咖啡邀请'}
            </h3>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              来自 {order.senderName} 的邀请
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Inquirer's Question Preview */}
        <div 
          className="p-3.5 rounded-xl border text-[12px] font-inter space-y-1"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
          }}
        >
          <span className="font-bold text-[11px]" style={{ color: theme.colors.primary }}>
            对方想聊的具体问题：
          </span>
          <p className="line-clamp-3 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
            {order.inquirerQuestion}
          </p>
        </div>

        {/* If Swap: Show Reciprocal Offer */}
        {isSwap && order.whatInquirerCanShare && (
          <div 
            className="p-3.5 rounded-xl border text-[12px] font-inter space-y-1"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
            }}
          >
            <span className="font-bold text-[11px] text-blue-600">
              对方可为您分享的内容：
            </span>
            <p className="line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {order.whatInquirerCanShare}
            </p>
          </div>
        )}

        {/* Step 1: Pick Confirmed Slot */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
            确认一个对谈时段：
          </label>
          <div className="space-y-1.5">
            {order.candidateSlots.map((slot, idx) => {
              const isPicked = selectedSlot === slot;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(slot);
                    setError(null);
                  }}
                  className="w-full p-2.5 rounded-xl border text-left text-[12px] font-inter flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: isPicked ? theme.colors.primary : theme.colors.surfaceElevated,
                    color: isPicked ? '#ffffff' : theme.colors.textPrimary,
                    borderColor: isPicked ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {slot}
                  </span>
                  {isPicked && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 (Swap Only): Add my question for inquirer */}
        {isSwap && (
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold font-inter" style={{ color: theme.colors.textPrimary }}>
              补充您想向对方请教的问题：
            </label>
            <textarea
              value={receiverQuestion}
              onChange={(e) => {
                setReceiverQuestion(e.target.value);
                setError(null);
              }}
              placeholder="例如：想了解你们团队在落地该机制时最关键的考评指标..."
              rows={3}
              className="w-full p-2.5 rounded-xl border text-[12px] font-inter focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            />
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-inter flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            返回
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            确认接受
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 3. Sharer Decline Invitation Modal (标准婉拒弹窗)
export const SharerDeclineInvitationModal: React.FC<{
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onDecline: (orderId: string, reason: string) => void;
}> = ({ order, isOpen, onClose, onDecline }) => {
  const { theme } = useTheme();
  const DECLINE_REASONS = [
    '超出当前分享范围',
    '信息不足，难以评估',
    '近期时间不合适',
    '近期暂停接受新邀请'
  ];
  const [selectedReason, setSelectedReason] = useState<string>(DECLINE_REASONS[0]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              婉拒邀请
            </h3>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              选择标准婉拒原因，不会公开降低您的信誉
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {DECLINE_REASONS.map((reason) => {
            const isPicked = selectedReason === reason;
            return (
              <div
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all"
                style={{
                  backgroundColor: isPicked ? theme.colors.accentTagBg : theme.colors.bg,
                  borderColor: isPicked ? theme.colors.primary : theme.colors.border,
                }}
              >
                <span className="text-[13px] font-inter" style={{ color: theme.colors.textPrimary }}>
                  {reason}
                </span>
                {isPicked && <Check size={14} style={{ color: theme.colors.primary }} />}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onDecline(order.id, selectedReason);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98] bg-rose-500"
          >
            确认婉拒
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 4. Edit Profile Modal
export const EditProfileModal: React.FC<{
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [company, setCompany] = useState(user.company);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <h3 
            className="font-hanken text-[17px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            编辑公开资料
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 font-inter text-[13px]">
          <div>
            <label 
              className="block mb-1 font-medium text-[12px]"
              style={{ color: theme.colors.textSecondary }}
            >
              姓名 / 称呼
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none border transition-colors"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label 
              className="block mb-1 font-medium text-[12px]"
              style={{ color: theme.colors.textSecondary }}
            >
              当前岗位职务
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none border transition-colors"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label 
              className="block mb-1 font-medium text-[12px]"
              style={{ color: theme.colors.textSecondary }}
            >
              就职公司 / 机构
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none border transition-colors"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              }}
            />
          </div>

          <p 
            className="text-[11px] p-2.5 rounded-lg leading-relaxed border"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
              color: theme.colors.textMuted,
            }}
          >
            * 依照 PRD 规范，公开页面将严格标明“职业信息由用户自行填写，平台未核验”。
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave({ name, title, company });
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            保存资料
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 5. Manage Themes Modal (Max 3 themes)
export const ManageThemesModal: React.FC<{
  themes: ChatTheme[];
  isOpen: boolean;
  onClose: () => void;
  onSaveThemes: (themes: ChatTheme[]) => void;
}> = ({ themes, isOpen, onClose, onSaveThemes }) => {
  const { theme: activeTheme } = useTheme();
  const [list, setList] = useState<ChatTheme[]>(themes);

  if (!isOpen) return null;

  const handleAddTheme = () => {
    if (list.length >= 3) return;
    const newTheme: ChatTheme = {
      id: `theme-${Date.now()}`,
      title: '新职业对谈主题',
      description: '请简要说明本主题探讨的具体经历与一手信息。',
      durationMinutes: 30,
      includes: ['针对性答疑、真实经历踩坑复盘'],
      excludes: ['非职业范围内问题、方案代做']
    };
    setList([...list, newTheme]);
  };

  const handleDelete = (id: string) => {
    setList(list.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: activeTheme.colors.surface,
          borderColor: activeTheme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: activeTheme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: activeTheme.colors.textPrimary }}
            >
              管理分享主题
            </h3>
            <p className="text-[11px]" style={{ color: activeTheme.colors.textSecondary }}>
              最多可上架 3 个 30 分钟主题 ({list.length}/3)
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: activeTheme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {list.map((t, index) => (
            <div 
              key={t.id} 
              className="p-3 rounded-2xl border space-y-2"
              style={{
                backgroundColor: activeTheme.colors.bg,
                borderColor: activeTheme.colors.border,
              }}
            >
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={t.title}
                  onChange={(e) => {
                    const copy = [...list];
                    copy[index].title = e.target.value;
                    setList(copy);
                  }}
                  className="font-inter font-bold text-[14px] bg-transparent border-b border-transparent outline-none w-[80%]"
                  style={{ color: activeTheme.colors.textPrimary }}
                />
                {list.length > 1 && (
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="p-1 hover:opacity-80 text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <textarea
                value={t.description}
                rows={2}
                onChange={(e) => {
                  const copy = [...list];
                  copy[index].description = e.target.value;
                  setList(copy);
                }}
                className="w-full text-[12px] p-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: activeTheme.colors.surface,
                  borderColor: activeTheme.colors.border,
                  color: activeTheme.colors.textPrimary,
                }}
              />
            </div>
          ))}

          {list.length < 3 && (
            <button
              onClick={handleAddTheme}
              className="w-full py-2.5 border-2 border-dashed rounded-xl font-inter text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              style={{
                borderColor: `${activeTheme.colors.primary}80`,
                color: activeTheme.colors.primary,
                backgroundColor: activeTheme.colors.accentTagBg,
              }}
            >
              <Plus size={15} />
              添加新主题
            </button>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: activeTheme.colors.surfaceElevated,
              borderColor: activeTheme.colors.border,
              color: activeTheme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSaveThemes(list);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: activeTheme.colors.primary,
              boxShadow: activeTheme.colors.shadowGlow,
            }}
          >
            保存主题
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 6. Review / Feedback Modal (盲评与真实反馈)
export const ReviewModal: React.FC<{
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (orderId: string, rating: number, comment: string, tag: string) => void;
}> = ({ order, isOpen, onClose, onSubmitReview }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(5);
  const [tag, setTag] = useState('话题契合');
  const [comment, setComment] = useState('');

  if (!isOpen || !order) return null;

  const isSwap = order.sessionType === 'TOPIC_SWAP';
  const TAGS = ['话题契合', '收获满满', '交流自然', '按时出席', '愿意再次聊'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              {isSwap ? '主题互换盲评反馈' : '对谈评价与反馈'}
            </h3>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              {isSwap ? '双方均提交或24小时后公开，减少人情压力' : '您的真实反馈将帮助社区建立信任'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Rating Stars */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform active:scale-125"
              >
                <Star
                  size={26}
                  style={{
                    fill: star <= rating ? theme.colors.primary : 'none',
                    color: star <= rating ? theme.colors.primary : theme.colors.textMuted,
                  }}
                />
              </button>
            ))}
          </div>
          <span className="font-inter text-[12px] font-semibold" style={{ color: theme.colors.primary }}>
            {rating === 5 ? '体验极佳' : rating === 4 ? '符合预期' : '一般 / 需改进'}
          </span>
        </div>

        {/* Structured Tags */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {TAGS.map((t) => {
            const isPicked = tag === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className="px-2.5 py-1 rounded-full text-[11px] font-inter font-medium border transition-all"
                style={{
                  backgroundColor: isPicked ? theme.colors.primary : theme.colors.surfaceElevated,
                  color: isPicked ? '#ffffff' : theme.colors.textSecondary,
                  borderColor: isPicked ? theme.colors.primary : theme.colors.border,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Comment input */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="写下一两句真实的对谈感受或具体收获..."
          rows={3}
          className="w-full p-3 rounded-xl border text-[12px] font-inter focus:outline-none focus:ring-2 resize-none"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        />

        <div className="flex gap-2 pt-1">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSubmitReview(order.id, rating, comment || '对谈收获很大，交流务实自然。', tag);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 7. Complaint / After-sale Modal
export const ComplaintModal: React.FC<{
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (orderId: string, reason: string) => void;
}> = ({ order, isOpen, onClose, onSubmitComplaint }) => {
  const { theme } = useTheme();
  const COMPLAINT_TYPES = [
    '对方未按时到场 / 缺席',
    '对谈内容明显偏离公开主题',
    '腾讯会议链接失效无法接入',
    '言语不当或骚扰违规'
  ];
  const [selectedType, setSelectedType] = useState(COMPLAINT_TYPES[0]);
  const [detail, setDetail] = useState('');

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div className="flex items-center gap-1.5 text-rose-500">
            <ShieldAlert size={18} />
            <h3 className="font-hanken text-[17px] font-bold">24小时售后与维权</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-[12px] font-medium" style={{ color: theme.colors.textSecondary }}>
            请选择异常类型：
          </label>
          {COMPLAINT_TYPES.map((type) => {
            const isPicked = selectedType === type;
            return (
              <div
                key={type}
                onClick={() => setSelectedType(type)}
                className="p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-[12px] font-inter"
                style={{
                  backgroundColor: isPicked ? 'rgba(244, 63, 94, 0.08)' : theme.colors.bg,
                  borderColor: isPicked ? 'rgba(244, 63, 94, 0.4)' : theme.colors.border,
                  color: isPicked ? '#f43f5e' : theme.colors.textPrimary,
                }}
              >
                <span>{type}</span>
                {isPicked && <Check size={13} />}
              </div>
            );
          })}
        </div>

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="请补充异常具体情况说明（平台将在 24 小时内介入处理）..."
          rows={2}
          className="w-full p-2.5 rounded-xl border text-[12px] font-inter focus:outline-none focus:ring-2 resize-none"
          style={{
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
          }}
        />

        <div className="flex gap-2 pt-1">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSubmitComplaint(order.id, `${selectedType}: ${detail || '未补充说明'}`);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md bg-rose-500"
          >
            提交售后申请
          </button>
        </div>
      </div>
    </div>
  );
};

// MARK: - 8. Topic Swap Settings Modal (设置主题互换)
export const TopicSwapSettingsModal: React.FC<{
  acceptsTopicSwap: boolean;
  weeklyLimit: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (accepts: boolean, limit: number) => void;
}> = ({ acceptsTopicSwap, weeklyLimit, isOpen, onClose, onSave }) => {
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(acceptsTopicSwap);
  const [limit, setLimit] = useState(weeklyLimit || 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="rounded-3xl p-5 max-w-sm w-full shadow-2xl border space-y-4 transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div 
          className="flex justify-between items-center pb-2 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h3 
              className="font-hanken text-[17px] font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              主题互换设置
            </h3>
            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
              与其他开放分享的用户进行 0 元对等职业交流
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:opacity-80 transition-colors"
            style={{ color: theme.colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 font-inter">
          {/* Toggle Switch */}
          <div 
            className="p-3.5 rounded-2xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <div>
              <span className="text-[13px] font-bold block" style={{ color: theme.colors.textPrimary }}>
                接收主题互换邀请
              </span>
              <span className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                关闭后仅接收请喝电子咖啡邀请
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="w-12 h-6 rounded-full transition-colors relative p-0.5"
              style={{
                backgroundColor: enabled ? theme.colors.primary : theme.colors.border,
              }}
            >
              <div 
                className="w-5 h-5 rounded-full bg-white transition-transform shadow-md"
                style={{
                  transform: enabled ? 'translateX(24px)' : 'translateX(0px)',
                }}
              />
            </button>
          </div>

          {/* Weekly Limit Selector */}
          {enabled && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[12px] font-medium" style={{ color: theme.colors.textSecondary }}>
                每周最多接收互换次数：
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 5].map((num) => {
                  const isPicked = limit === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLimit(num)}
                      className="py-2 rounded-xl text-[13px] font-bold font-inter border transition-all"
                      style={{
                        backgroundColor: isPicked ? theme.colors.primary : theme.colors.surfaceElevated,
                        color: isPicked ? '#ffffff' : theme.colors.textPrimary,
                        borderColor: isPicked ? theme.colors.primary : theme.colors.border,
                      }}
                    >
                      {num} 次/周
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl border font-inter text-[13px] font-semibold transition-colors"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave(enabled, limit);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-inter text-[13px] font-bold shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
