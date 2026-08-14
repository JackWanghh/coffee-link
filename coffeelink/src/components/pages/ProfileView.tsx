import React from 'react';
import { 
  CheckCircle2, 
  Star, 
  Calendar, 
  BadgeCheck, 
  HelpCircle, 
  LogOut, 
  LogIn,
  UserPlus,
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Settings,
  Palette,
  Coffee,
  Repeat,
  Layers,
  HeartHandshake,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { TopAppBar } from '../TopAppBar';
import { useTheme } from '../../theme';

interface ProfileViewProps {
  user: UserProfile;
  onOpenSharingCenter: () => void;
  onOpenMyAppointments: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogoutToggle: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenSharingCenter,
  onOpenMyAppointments,
  onOpenSettings,
  onOpenLogin,
  onOpenRegister,
  onLogoutToggle,
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-[90px] transition-colors duration-300"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <TopAppBar 
        title="我的" 
        rightAction={
          <button 
            onClick={onOpenSettings}
            className="p-2 rounded-full active:scale-95 transition-all"
            style={{ 
              color: theme.colors.textSecondary,
              backgroundColor: `${theme.colors.surfaceElevated}99`,
            }}
            title="系统与外观设置"
            aria-label="打开设置"
          >
            <Settings size={20} />
          </button>
        }
      />

      <main className="px-5 py-4 space-y-4">
        {/* Profile Header Bento Card: Logged in vs Guest */}
        {user.isLoggedIn ? (
          <section 
            className="rounded-3xl p-4 shadow-ambient-lvl1 relative overflow-hidden flex flex-col gap-4 border transition-all duration-300"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            {/* Ambient artistic glow */}
            <div 
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: `${theme.colors.primary}25` }}
            />

            <div className="relative z-10 flex items-center gap-4">
              <div 
                className="w-18 h-18 rounded-full overflow-hidden border-2 shrink-0 relative shadow-md"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceElevated,
                }}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                {user.isVerified && (
                  <div 
                    className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 shadow-sm"
                    style={{ borderColor: theme.colors.surface }}
                  >
                    <CheckCircle2 size={12} className="text-white fill-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 
                  className="font-hanken text-[19px] font-bold truncate"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {user.name}
                </h2>
                <p 
                  className="font-inter text-[13px] truncate mt-0.5"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {user.title} @ {user.company}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="border px-2 py-0.5 rounded font-inter text-[11px] font-semibold flex items-center gap-1"
                    style={{
                      backgroundColor: theme.colors.accentTagBg,
                      borderColor: theme.colors.accentTagBorder,
                      color: theme.colors.primary,
                    }}
                  >
                    <ShieldCheck size={12} style={{ color: theme.colors.primary }} /> 身份已核验
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Bento */}
            <div 
              className="flex items-center justify-between pt-3 border-t relative z-10"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex flex-col items-center justify-center flex-1">
                <span 
                  className="font-hanken text-[18px] font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {user.totalChats}
                </span>
                <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>对谈总数</span>
              </div>
              <div className="w-px h-7" style={{ backgroundColor: theme.colors.border }} />
              
              <div className="flex flex-col items-center justify-center flex-1">
                <span 
                  className="font-hanken text-[18px] font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  {user.rating.toFixed(1)}
                </span>
                <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>综合评分</span>
              </div>
              <div className="w-px h-7" style={{ backgroundColor: theme.colors.border }} />

              <div className="flex flex-col items-center justify-center flex-1">
                <span 
                  className="font-hanken text-[18px] font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {user.onTimeRate || '100%'}
                </span>
                <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>按时率</span>
              </div>
            </div>
          </section>
        ) : (
          /* Guest / Not Logged In Bento Card */
          <section 
            className="rounded-3xl p-5 shadow-ambient-lvl1 relative overflow-hidden flex flex-col gap-4 border transition-all duration-300"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 shrink-0 shadow-sm"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceElevated,
                  color: theme.colors.textSecondary,
                }}
              >
                <Coffee size={32} />
              </div>

              <div className="flex-1">
                <h2 
                  className="font-hanken text-[18px] font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  登录 / 注册 CoffeeLink
                </h2>
                <p 
                  className="font-inter text-[12px] mt-0.5"
                  style={{ color: theme.colors.textSecondary }}
                >
                  和真正做过的人聊一次，开启 30 分钟职业对谈
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
              <button
                type="button"
                onClick={onOpenLogin}
                className="py-2.5 px-3 rounded-xl font-inter text-[13px] font-bold text-white flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: theme.colors.shadowGlow,
                }}
              >
                <LogIn size={15} />
                <span>手机密码登录</span>
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="py-2.5 px-3 rounded-xl font-inter text-[13px] font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                }}
              >
                <UserPlus size={15} style={{ color: theme.colors.primary }} />
                <span>新用户注册</span>
              </button>
            </div>
          </section>
        )}

        {/* Sharing Center Entrance Card */}
        <section 
          onClick={user.isLoggedIn ? onOpenSharingCenter : onOpenLogin}
          className="rounded-2xl p-4 shadow-ambient-lvl1 cursor-pointer transition-all duration-200 active:scale-[0.99] border relative overflow-hidden group"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: user.isSharingOpen && user.isLoggedIn ? theme.colors.primary : theme.colors.border,
            boxShadow: user.isSharingOpen && user.isLoggedIn ? theme.colors.shadowGlow : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: theme.colors.accentTagBg,
                  color: theme.colors.primary,
                }}
              >
                <Coffee size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 
                    className="font-inter text-[15px] font-bold"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    分享中心
                  </h3>
                  <span 
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      user.isLoggedIn && user.isSharingOpen 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {user.isLoggedIn && user.isSharingOpen ? '已开放分享' : '未开放分享'}
                  </span>
                </div>
                <p 
                  className="font-inter text-[12px] mt-0.5"
                  style={{ color: theme.colors.textSecondary }}
                >
                  设置签名饮品、开放 30 分钟主题及 0 元互换
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: theme.colors.primary }} />
          </div>

          {/* Quick config badges inside card */}
          {user.isLoggedIn && (
            <div 
              className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-[11px] font-inter"
              style={{ borderColor: theme.colors.border }}
            >
              <div className="flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                <span>{user.signatureDrink?.icon || '☕'}</span>
                <span className="truncate">签名：{user.signatureDrink?.name || '燕麦拿铁'} (¥{user.signatureDrink?.price})</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: theme.colors.textSecondary }}>
                <Repeat size={13} className="text-blue-500 shrink-0" />
                <span className="truncate">{user.acceptsTopicSwap ? `互换 (周限${user.weeklySwapLimit}次)` : '未开启互换'}</span>
              </div>
            </div>
          )}
        </section>

        {/* Feature List & Tooling Menu */}
        <section 
          className="rounded-2xl shadow-ambient-lvl1 overflow-hidden border transition-colors"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="divide-y" style={{ borderColor: theme.colors.border }}>
            {/* My Appointments Shortcut */}
            <button 
              onClick={user.isLoggedIn ? onOpenMyAppointments : onOpenLogin}
              className="w-full p-4 flex items-center justify-between transition-colors active:opacity-70 text-left"
              style={{ color: theme.colors.textPrimary }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} style={{ color: theme.colors.primary }} />
                <div>
                  <span className="font-inter text-[14px] font-medium block">
                    我的对谈与日程
                  </span>
                  <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    查看已预约、待付款及历史对谈
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: theme.colors.textMuted }} />
            </button>

            {/* Appearance & Themes */}
            <button 
              onClick={onOpenSettings}
              className="w-full p-4 flex items-center justify-between transition-colors active:opacity-70 text-left"
              style={{ color: theme.colors.textPrimary }}
            >
              <div className="flex items-center gap-3">
                <Palette size={18} style={{ color: theme.colors.primary }} />
                <div>
                  <span className="font-inter text-[14px] font-medium block">
                    外观与主题切换
                  </span>
                  <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    暖阳燕麦 / 暗夜流光 / 极简白
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: theme.colors.textMuted }} />
            </button>

            {/* Credibility & Guarantee */}
            <div 
              className="p-4 flex items-center justify-between text-left"
              style={{ color: theme.colors.textPrimary }}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-500" />
                <div>
                  <span className="font-inter text-[14px] font-medium block">
                    对谈安全与履约保障
                  </span>
                  <span className="font-inter text-[11px]" style={{ color: theme.colors.textSecondary }}>
                    24小时维权 · 未到场全额退款 · 盲评机制
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">100%履约</span>
            </div>
          </div>
        </section>

        {/* Account Logout / Switch Button if logged in */}
        {user.isLoggedIn ? (
          <button
            type="button"
            onClick={onLogoutToggle}
            className="w-full py-3 rounded-2xl border font-inter text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
            }}
          >
            <LogOut size={15} />
            <span>切换账号 / 退出登录</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full py-3 rounded-2xl border font-inter text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: theme.colors.accentTagBg,
              borderColor: theme.colors.accentTagBorder,
              color: theme.colors.primary,
            }}
          >
            <LogIn size={15} />
            <span>快捷登录已有账号</span>
          </button>
        )}

        {/* Declaration Notice Footer */}
        <p 
          className="text-center font-inter text-[11px] px-4 leading-relaxed"
          style={{ color: theme.colors.textMuted }}
        >
          咖啡对谈 · 真实同侪经验交流平台
          <br />
          身份已核验 · 职业信息由用户自行填写
        </p>
      </main>
    </div>
  );
};
