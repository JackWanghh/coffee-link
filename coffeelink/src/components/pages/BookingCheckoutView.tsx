import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Lock, 
  ShieldCheck, 
  Info, 
  Check, 
  Loader2,
  Coffee,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ChatSession } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface BookingCheckoutViewProps {
  session: ChatSession;
  onBack: () => void;
  onPaymentSuccess: (sessionId: string, paymentMethod: '微信支付' | '支付宝') => void;
}

export const BookingCheckoutView: React.FC<BookingCheckoutViewProps> = ({
  session,
  onBack,
  onPaymentSuccess,
}) => {
  const { theme } = useTheme();
  const [paymentMethod, setPaymentMethod] = useState<'微信支付' | '支付宝'>('微信支付');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = session.price || session.coffeeDrink?.price || 28;

  const handlePay = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSuccess(session.id, paymentMethod);
    }, 1000);
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[120px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar title="请喝咖啡并确认预约" showBack onBack={onBack} />

      <main className="px-5 py-4 space-y-4">
        {/* Status Notice */}
        <div 
          className="p-3.5 rounded-xl border flex items-center gap-2.5 text-[12px] font-inter leading-relaxed"
          style={{
            backgroundColor: theme.colors.accentTagBg,
            borderColor: theme.colors.accentTagBorder,
            color: theme.colors.textPrimary,
          }}
        >
          <Coffee size={18} className="shrink-0" style={{ color: theme.colors.primary }} />
          <div>
            <p className="font-bold">
              分享者已接受您的邀请，请在 2 小时内完成支付
            </p>
            <p className="text-[11px] opacity-80" style={{ color: theme.colors.textSecondary }}>
              支付成功后立即生成正式对谈订单并确认时段，超时未付将自动释放该时段。
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 space-y-3.5 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h2 
            className="font-hanken text-[16px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            对谈与饮品信息
          </h2>

          <div className="flex items-start gap-3">
            <img
              src={session.receiverAvatar}
              alt={session.receiverName}
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surfaceElevated,
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 
                className="font-inter text-[14px] font-bold truncate"
                style={{ color: theme.colors.textPrimary }}
              >
                {session.themeTitle}
              </h3>
              <p 
                className="font-inter text-[12px] mt-0.5 truncate"
                style={{ color: theme.colors.textSecondary }}
              >
                分享者：{session.receiverName} ({session.receiverTitle})
              </p>
            </div>
          </div>

          {/* Inquirer's Question Display */}
          <div 
            className="p-3 rounded-xl border text-[12px] font-inter space-y-1"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            }}
          >
            <span className="font-bold text-[11px]" style={{ color: theme.colors.primary }}>
              您提交的咨询问题：
            </span>
            <p className="line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
              {session.inquirerQuestion}
            </p>
          </div>

          <hr style={{ borderColor: theme.colors.border }} />

          {/* Time and Meeting Details */}
          <div className="space-y-2 font-inter text-[12px]">
            <div className="flex justify-between items-center">
              <span className="flex items-center" style={{ color: theme.colors.textSecondary }}>
                <Calendar size={14} className="mr-1.5" style={{ color: theme.colors.primary }} />
                已确认时段
              </span>
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                {session.confirmedSlot || session.candidateSlots[0] || '10月24日 14:00 - 14:30'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center" style={{ color: theme.colors.textSecondary }}>
                <Clock size={14} className="mr-1.5" style={{ color: theme.colors.primary }} />
                对谈时长
              </span>
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                30 分钟 (1对1)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center" style={{ color: theme.colors.textSecondary }}>
                <Video size={14} className="mr-1.5" style={{ color: theme.colors.primary }} />
                会议方式
              </span>
              <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                腾讯会议 (付款后展示链接)
              </span>
            </div>
          </div>
        </section>

        {/* Digital Coffee Breakdown */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 space-y-2.5 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h3 
            className="font-hanken text-[15px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            费用明细
          </h3>

          <div className="flex justify-between items-center font-inter text-[13px]">
            <span className="flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
              <span>{session.coffeeDrink?.icon || '☕'}</span>
              <span>签名饮品：{session.coffeeDrink?.name || '电子咖啡'}</span>
            </span>
            <span className="font-semibold font-mono" style={{ color: theme.colors.textPrimary }}>
              ¥{price.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center font-inter text-[12px]">
            <span style={{ color: theme.colors.textMuted }}>平台服务费</span>
            <span className="text-emerald-500 font-medium">免收发起人服务费</span>
          </div>

          <hr style={{ borderColor: theme.colors.border }} />

          <div className="flex justify-between items-center font-inter pt-1">
            <span className="font-bold text-[14px]" style={{ color: theme.colors.textPrimary }}>
              实付金额
            </span>
            <span className="font-hanken text-[20px] font-bold" style={{ color: theme.colors.primary }}>
              ¥{price.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Payment Method Selector */}
        <section 
          className="rounded-2xl p-4 shadow-ambient-lvl1 space-y-3 border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h3 
            className="font-hanken text-[15px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            支付方式
          </h3>

          <div className="space-y-2">
            {/* WeChat Pay */}
            <div
              onClick={() => setPaymentMethod('微信支付')}
              className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99]"
              style={{
                backgroundColor: paymentMethod === '微信支付' ? theme.colors.surfaceElevated : theme.colors.surface,
                borderColor: paymentMethod === '微信支付' ? theme.colors.primary : theme.colors.border,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  微
                </div>
                <div>
                  <h4 className="font-inter text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                    微信支付 (推荐)
                  </h4>
                  <p className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    使用微信安全便捷支付
                  </p>
                </div>
              </div>
              <div 
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: paymentMethod === '微信支付' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === '微信支付' ? theme.colors.primary : 'transparent',
                }}
              >
                {paymentMethod === '微信支付' && <Check size={11} className="text-white" />}
              </div>
            </div>

            {/* Alipay */}
            <div
              onClick={() => setPaymentMethod('支付宝')}
              className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99]"
              style={{
                backgroundColor: paymentMethod === '支付宝' ? theme.colors.surfaceElevated : theme.colors.surface,
                borderColor: paymentMethod === '支付宝' ? theme.colors.primary : theme.colors.border,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  支
                </div>
                <div>
                  <h4 className="font-inter text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                    支付宝
                  </h4>
                  <p className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    支持花呗及银行卡
                  </p>
                </div>
              </div>
              <div 
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: paymentMethod === '支付宝' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: paymentMethod === '支付宝' ? theme.colors.primary : 'transparent',
                }}
              >
                {paymentMethod === '支付宝' && <Check size={11} className="text-white" />}
              </div>
            </div>
          </div>
        </section>

        {/* Security & Refund Guarantees */}
        <section 
          className="rounded-xl p-3.5 border flex items-start gap-2.5 font-inter text-[11px] leading-relaxed"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.textSecondary,
          }}
        >
          <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-emerald-600">履约与退款保障：</strong>
            对谈开始前取消全额原路退款；若分享者未到场或会议失效全额退款并记异常；完成后24小时内支持售后反馈。
          </p>
        </section>
      </main>

      {/* Sticky Bottom Payment Button */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t p-4 shadow-ambient-top transition-colors duration-300"
        style={{
          backgroundColor: `${theme.colors.bg}FA`,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px]" style={{ color: theme.colors.textSecondary }}>实付总额</div>
            <div className="font-hanken text-[22px] font-bold" style={{ color: theme.colors.primary }}>
              ¥{price.toFixed(2)}
            </div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handlePay}
            className="text-white font-inter text-[15px] font-bold py-3.5 px-8 rounded-xl active:scale-95 transition-all duration-200 flex-1 max-w-[200px] flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              boxShadow: theme.colors.shadowGlow,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>支付中...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>立即支付</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
