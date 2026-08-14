import React, { useState, useEffect } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Coffee,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useTheme } from '../../theme';
import { UserProfile } from '../../types';

export interface RegisteredAccount {
  phone: string;
  password: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot-password';
  onClose: () => void;
  onLoginSuccess: (userProfile: Partial<UserProfile>) => void;
  defaultPhone?: string;
  sourceNotice?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  defaultPhone = '',
  sourceNotice,
}) => {
  const { theme } = useTheme();

  // Mode: 'login' | 'register' | 'forgot-password'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  // Form Fields
  const [phone, setPhone] = useState<string>(defaultPhone || '13800138000');
  const [smsCode, setSmsCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // Password Visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Agreement Checkbox
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  // Countdown for SMS Code
  const [countdown, setCountdown] = useState<number>(0);
  const [generatedSmsCode, setGeneratedSmsCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local Storage Accounts Management
  const getStoredAccounts = (): RegisteredAccount[] => {
    const raw = localStorage.getItem('coffeelink_registered_accounts_v1');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    // Default mock accounts
    return [
      {
        phone: '13800138000',
        password: 'Pass123456',
        name: 'Alex Chen',
        title: '资深增长产品专家',
        company: '字节跳动 / 国际化电商',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        createdAt: '2026-01-01',
      },
      {
        phone: '13912345678',
        password: 'Pass123456',
        name: 'Elena Rodriguez',
        title: 'AI 产品与交互负责人',
        company: 'Midjourney Labs',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        createdAt: '2026-02-15',
      },
    ];
  };

  const saveAccounts = (accounts: RegisteredAccount[]) => {
    localStorage.setItem('coffeelink_registered_accounts_v1', JSON.stringify(accounts));
  };

  // Reset or Sync on Open/Mode change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setToastMessage(null);
      if (defaultPhone) {
        setPhone(defaultPhone);
      }
    }
  }, [isOpen, initialMode, defaultPhone]);

  // Timer countdown hook
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // Phone Validation
  const isValidPhone = (p: string) => /^1[3-9]\d{9}$/.test(p.trim());

  // Password Complexity Validation: 8-20 chars, must include letters and digits, no spaces
  const isValidPasswordFormat = (pwd: string) => {
    if (pwd.length < 8 || pwd.length > 20) return false;
    if (/\s/.test(pwd)) return false;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    return hasLetter && hasDigit;
  };

  // Trigger Mock SMS Send
  const handleSendSms = () => {
    setErrorMessage(null);
    if (!phone || !isValidPhone(phone)) {
      setErrorMessage('请输入正确的11位中国大陆手机号码 (+86)');
      return;
    }

    const accounts = getStoredAccounts();
    const isRegistered = accounts.some((a) => a.phone === phone.trim());

    if (mode === 'register' && isRegistered) {
      setErrorMessage('该手机号已注册账号，请直接前往登录');
      return;
    }

    if (mode === 'forgot-password' && !isRegistered) {
      setErrorMessage('该手机号尚未注册，请先注册账号');
      return;
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSmsCode(code);
    setCountdown(60);
    setToastMessage({
      text: `【CoffeeLink】验证码 ${code}，用于${mode === 'register' ? '账号注册' : '找回密码'}，5分钟内有效。`,
      type: 'info',
    });
  };

  // Quick auto-fill mock SMS code
  const handleAutoFillCode = () => {
    if (generatedSmsCode) {
      setSmsCode(generatedSmsCode);
    }
  };

  // Handle Submit: Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidPhone(phone)) {
      setErrorMessage('请输入合法的11位手机号码');
      return;
    }

    if (!password) {
      setErrorMessage('请输入登录密码');
      return;
    }

    const accounts = getStoredAccounts();
    const matched = accounts.find((a) => a.phone === phone.trim());

    if (!matched) {
      setErrorMessage('该手机号未注册，请先点击下方“注册账号”');
      return;
    }

    if (matched.password !== password) {
      setErrorMessage('手机号或密码不正确，请重新输入');
      return;
    }

    // Login success
    setToastMessage({ text: '登录成功，正在进入...', type: 'success' });
    setTimeout(() => {
      onLoginSuccess({
        phone: matched.phone,
        name: matched.name,
        title: matched.title,
        company: matched.company,
        avatarUrl: matched.avatarUrl,
        isVerified: matched.isVerified,
        isLoggedIn: true,
      });
      onClose();
    }, 400);
  };

  // Handle Submit: Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidPhone(phone)) {
      setErrorMessage('请输入合法的11位手机号码');
      return;
    }

    if (!smsCode || smsCode.trim().length !== 6) {
      setErrorMessage('请输入收到的6位短信验证码');
      return;
    }

    if (generatedSmsCode && smsCode.trim() !== generatedSmsCode && smsCode.trim() !== '888888') {
      setErrorMessage('短信验证码不正确或已过期');
      return;
    }

    if (!isValidPasswordFormat(password)) {
      setErrorMessage('密码必须为 8～20 位，且同时包含英文字母和数字，不能包含空格');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致，请核对');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('请阅读并同意《CoffeeLink用户服务协议》与《隐私政策》');
      return;
    }

    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.phone === phone.trim())) {
      setErrorMessage('该手机号已注册，请返回登录');
      return;
    }

    // Create new registered account
    const newAccount: RegisteredAccount = {
      phone: phone.trim(),
      password: password,
      name: `用户_${phone.slice(-4)}`,
      title: '产品探索者',
      company: '互联网科技',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveAccounts([newAccount, ...accounts]);

    setToastMessage({
      text: '🎉 注册成功！已为您自动回填手机号，请使用新设置的密码登录。',
      type: 'success',
    });

    // Reset password field, keep phone, switch to login
    setPassword('');
    setConfirmPassword('');
    setSmsCode('');
    setGeneratedSmsCode(null);
    setMode('login');
  };

  // Handle Submit: Reset Password (Forgot Password)
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValidPhone(phone)) {
      setErrorMessage('请输入合法的11位手机号码');
      return;
    }

    if (!smsCode || smsCode.trim().length !== 6) {
      setErrorMessage('请输入收到的6位短信验证码');
      return;
    }

    if (generatedSmsCode && smsCode.trim() !== generatedSmsCode && smsCode.trim() !== '888888') {
      setErrorMessage('短信验证码不正确或已过期');
      return;
    }

    if (!isValidPasswordFormat(password)) {
      setErrorMessage('新密码必须为 8～20 位，且同时包含英文字母和数字，不能包含空格');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('两次输入的新密码不一致，请核对');
      return;
    }

    const accounts = getStoredAccounts();
    const index = accounts.findIndex((a) => a.phone === phone.trim());

    if (index === -1) {
      setErrorMessage('该手机号未注册账号，无法找回密码');
      return;
    }

    // Update password
    accounts[index].password = password;
    saveAccounts(accounts);

    setToastMessage({
      text: '✅ 密码重置成功！旧密码已失效，请使用新密码进行登录。',
      type: 'success',
    });

    // Reset fields, switch to login
    setPassword('');
    setConfirmPassword('');
    setSmsCode('');
    setGeneratedSmsCode(null);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        {/* Top Header */}
        <div 
          className="p-5 pb-3 border-b flex items-center justify-between relative"
          style={{ borderColor: theme.colors.border }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <Coffee size={18} />
            </div>
            <div>
              <h2 className="font-hanken text-[17px] font-bold" style={{ color: theme.colors.textPrimary }}>
                {mode === 'login' && '密码登录'}
                {mode === 'register' && '新用户注册'}
                {mode === 'forgot-password' && '找回密码'}
              </h2>
              <p className="text-[11px] font-inter" style={{ color: theme.colors.textSecondary }}>
                CoffeeLink · 和真正做过的人聊一次
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:opacity-75 transition-opacity"
            style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.bg }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Source Notice Banner (if triggered by a specific action) */}
        {sourceNotice && (
          <div 
            className="px-5 py-2.5 text-[11px] font-inter flex items-center gap-1.5 border-b"
            style={{
              backgroundColor: theme.colors.accentTagBg,
              borderColor: theme.colors.accentTagBorder,
              color: theme.colors.primary,
            }}
          >
            <Sparkles size={13} className="shrink-0" />
            <span>{sourceNotice}</span>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="px-5 pt-3">
            <div 
              className={`p-3 rounded-xl border text-[12px] font-inter flex items-start gap-2 ${
                toastMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                  : toastMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
              }`}
            >
              {toastMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="leading-tight">{toastMessage.text}</p>
                {generatedSmsCode && (
                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="mt-1.5 text-[11px] font-bold underline flex items-center gap-1 text-amber-700 hover:opacity-80"
                  >
                    ⚡ 一键自动填入验证码 ({generatedSmsCode})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="px-5 pt-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-inter flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Main Form Body */}
        <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
          {/* ===================== MODE 1: LOGIN ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Phone Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  手机号码 (+86)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Smartphone size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <span className="text-[13px] font-mono mr-2 text-zinc-400">+86</span>
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="输入中国大陆11位手机号"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none"
                    style={{ color: theme.colors.textPrimary }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                    登录密码
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot-password');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-inter hover:underline"
                    style={{ color: theme.colors.primary }}
                  >
                    忘记密码？
                  </button>
                </div>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors relative"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Lock size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入 8~20 位密码"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none pr-7"
                    style={{ color: theme.colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Demo Fast Login Shortcut */}
              <div className="p-2.5 rounded-xl border text-[11px] font-inter space-y-1" style={{ backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }}>
                <div className="font-semibold text-zinc-400">💡 快捷演示账号测试：</div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span>演示手机号: <strong className="text-zinc-300 font-mono">13800138000</strong></span>
                  <span>密码: <strong className="text-zinc-300 font-mono">Pass123456</strong></span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-inter text-[14px] font-bold text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: theme.colors.shadowGlow,
                }}
              >
                <span>立即登录</span>
                <ArrowRight size={15} />
              </button>

              {/* Switch to Register */}
              <div className="pt-2 text-center">
                <span className="text-[12px] font-inter" style={{ color: theme.colors.textSecondary }}>
                  还没有账号？{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-[12px] font-bold font-inter underline"
                  style={{ color: theme.colors.primary }}
                >
                  免费注册新账号
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE 2: REGISTER ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Phone Input with SMS Code Button */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  手机号码 (+86)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Smartphone size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <span className="text-[13px] font-mono mr-2 text-zinc-400">+86</span>
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="输入中国大陆11位手机号"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none"
                    style={{ color: theme.colors.textPrimary }}
                  />
                </div>
              </div>

              {/* SMS Code Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  短信验证码 (6位数字)
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6位短信验证码"
                      className="w-full bg-transparent text-[13px] font-mono focus:outline-none"
                      style={{ color: theme.colors.textPrimary }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendSms}
                    className="px-3.5 py-2.5 rounded-xl border text-[12px] font-bold font-inter shrink-0 transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: countdown > 0 ? theme.colors.surfaceElevated : theme.colors.accentTagBg,
                      borderColor: countdown > 0 ? theme.colors.border : theme.colors.accentTagBorder,
                      color: countdown > 0 ? theme.colors.textSecondary : theme.colors.primary,
                    }}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  设置密码 (8～20位包含字母+数字)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors relative"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Lock size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="设置8~20位字母数字密码"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none pr-7"
                    style={{ color: theme.colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Realtime password rule helper */}
                {password.length > 0 && (
                  <div className="text-[10px] space-y-0.5 pt-0.5">
                    <div className={password.length >= 8 && password.length <= 20 ? 'text-emerald-500' : 'text-zinc-400'}>
                      • 长度为 8～20 个字符 {password.length >= 8 && password.length <= 20 && '✓'}
                    </div>
                    <div className={/[a-zA-Z]/.test(password) && /\d/.test(password) ? 'text-emerald-500' : 'text-zinc-400'}>
                      • 同时包含英文字母和数字 {/[a-zA-Z]/.test(password) && /\d/.test(password) && '✓'}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  确认密码 (再次输入)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors relative"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Lock size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入相同密码确认"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none pr-7"
                    style={{ color: theme.colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-rose-500 pt-0.5">两次输入的密码不一致</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-[10px] text-emerald-500 pt-0.5">两次密码一致 ✓</p>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-amber-600 rounded"
                />
                <label htmlFor="agree-checkbox" className="text-[11px] font-inter text-zinc-400 leading-tight">
                  已阅读并同意{' '}
                  <span 
                    onClick={() => setShowTermsModal(true)}
                    className="underline font-semibold cursor-pointer"
                    style={{ color: theme.colors.primary }}
                  >
                    《CoffeeLink用户服务协议》
                  </span>{' '}
                  与{' '}
                  <span 
                    onClick={() => setShowTermsModal(true)}
                    className="underline font-semibold cursor-pointer"
                    style={{ color: theme.colors.primary }}
                  >
                    《隐私政策》
                  </span>
                </label>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={!agreeTerms}
                className="w-full py-3 rounded-xl font-inter text-[14px] font-bold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: theme.colors.shadowGlow,
                }}
              >
                完成注册并登录
              </button>

              {/* Back to Login */}
              <div className="pt-1 text-center">
                <span className="text-[12px] font-inter" style={{ color: theme.colors.textSecondary }}>
                  已有账号？{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-[12px] font-bold font-inter underline"
                  style={{ color: theme.colors.primary }}
                >
                  返回账号登录
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE 3: FORGOT PASSWORD ===================== */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              {/* Phone Input with SMS Code Button */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  已注册的手机号码 (+86)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Smartphone size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <span className="text-[13px] font-mono mr-2 text-zinc-400">+86</span>
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="输入已注册的11位手机号"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none"
                    style={{ color: theme.colors.textPrimary }}
                  />
                </div>
              </div>

              {/* SMS Code Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  短信安全验证码 (6位数字)
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl border transition-colors"
                    style={{
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6位短信验证码"
                      className="w-full bg-transparent text-[13px] font-mono focus:outline-none"
                      style={{ color: theme.colors.textPrimary }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendSms}
                    className="px-3.5 py-2.5 rounded-xl border text-[12px] font-bold font-inter shrink-0 transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: countdown > 0 ? theme.colors.surfaceElevated : theme.colors.accentTagBg,
                      borderColor: countdown > 0 ? theme.colors.border : theme.colors.accentTagBorder,
                      color: countdown > 0 ? theme.colors.textSecondary : theme.colors.primary,
                    }}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  设置新密码 (8～20位包含字母+数字)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors relative"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Lock size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入新的8~20位字母数字密码"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none pr-7"
                    style={{ color: theme.colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-semibold font-inter" style={{ color: theme.colors.textPrimary }}>
                  确认新密码 (再次输入)
                </label>
                <div 
                  className="flex items-center px-3.5 py-2.5 rounded-xl border transition-colors relative"
                  style={{
                    backgroundColor: theme.colors.bg,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Lock size={16} className="mr-2" style={{ color: theme.colors.textMuted }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码核对"
                    className="w-full bg-transparent text-[13px] font-inter focus:outline-none pr-7"
                    style={{ color: theme.colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-rose-500 pt-0.5">两次输入的新密码不一致</p>
                )}
              </div>

              {/* Submit Reset Password Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-inter text-[14px] font-bold text-white shadow-md transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: theme.colors.primary,
                  boxShadow: theme.colors.shadowGlow,
                }}
              >
                重置密码并返回登录
              </button>

              {/* Back to Login */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-[12px] font-bold font-inter underline"
                  style={{ color: theme.colors.primary }}
                >
                  想起密码了？返回登录
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Embedded Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div 
            className="rounded-3xl max-w-sm w-full p-5 max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl border space-y-3"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.colors.border }}>
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: theme.colors.primary }} />
                <h3 className="font-bold text-[15px]" style={{ color: theme.colors.textPrimary }}>
                  服务协议与隐私条款
                </h3>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-[12px] leading-relaxed space-y-2 font-inter text-zinc-400">
              <p>
                <strong>1. 平台定位与对谈边界：</strong>
                CoffeeLink 属于轻量同侪职业经验交流平台。对谈目标在于了解真实职业经历、减少行业信息差，不承诺内推、录用或确定性商业结果。
              </p>
              <p>
                <strong>2. 电子咖啡与主题互换：</strong>
                电子咖啡是咨询者为分享者时间付出的感谢表达；主题互换为双方各约15分钟的对等交流，禁止任何形式的商业推销与骚扰行为。
              </p>
              <p>
                <strong>3. 隐私与数据安全：</strong>
                我们严格保护用户的手机号码与账号密码，仅在用户授权的前提下展示脱敏职业信息与对谈记录。
              </p>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white"
              style={{ backgroundColor: theme.colors.primary }}
            >
              我已了解并同意
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
