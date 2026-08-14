import React from 'react';
import { 
  Palette, 
  Type, 
  Layers, 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Lock,
  UserCheck,
  Coffee,
  Repeat,
  Sparkles,
  KeyRound,
  FileCheck
} from 'lucide-react';

export const DesignSystemInspector: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#fef8f4] text-[#1A1110] overflow-y-auto p-6 space-y-8 font-inter max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="border-b border-[#f3ede9] pb-4">
        <h2 className="font-hanken text-[26px] font-bold text-[#271310] tracking-tight">
          CoffeeLink PRD V1.6 架构设计与交互规范
        </h2>
        <p className="font-inter text-[14px] text-[#5F4B49] mt-1">
          Aroma Professional 设计风格 • 统一用户模型 • 电子咖啡 & 主题互换 • 手机号密码注册登录与找密
        </p>
      </div>

      {/* 1. Account & Authentication Architecture (PRD 4.1 New) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={20} className="text-[#835500]" />
          <h3 className="font-hanken text-[18px] font-bold text-[#271310]">
            PRD 4.1 账号认证体系：手机号注册、密码登录与找回密码
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-inter text-xs">
          {/* Register Flow */}
          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-[#835500] text-white flex items-center justify-center text-[11px]">1</span>
                <span>新用户注册 (Register)</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[#5F4B49] leading-relaxed">
                <li>• <strong>手机号输入：</strong>+86 中国大陆 11 位合法格式校验。</li>
                <li>• <strong>短信验证码：</strong>6 位数字验证码，60 秒防刷倒计时，5 分钟有效。</li>
                <li>• <strong>密码规则：</strong>8~20 位，必须同时包含英文字母和数字，禁止包含空格。</li>
                <li>• <strong>密码二次确认：</strong>两次输入实时一致性校验。</li>
                <li>• <strong>协议授权：</strong>强制勾选《用户服务协议》与《隐私政策》。</li>
                <li>• <strong>注册完成：</strong>保存新账号，自动返回登录页并回填手机号。</li>
              </ul>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-lg text-[11px] font-semibold">
              ✓ 注册成功后自动回填手机号
            </div>
          </div>

          {/* Login Flow */}
          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-[#835500] text-white flex items-center justify-center text-[11px]">2</span>
                <span>手机号密码登录 (Login)</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[#5F4B49] leading-relaxed">
                <li>• <strong>凭据输入：</strong>手机号 + 登录密码，支持密码明暗切换。</li>
                <li>• <strong>找回入口：</strong>密码输入栏右侧醒目提供“忘记密码？”入口。</li>
                <li>• <strong>注册入口：</strong>表单底部常驻“还没有账号？免费注册新账号”。</li>
                <li>• <strong>拦截与回跳：</strong>游客浏览不受限，发起邀请/进分享中心自动拦截并拉起登录，成功后恢复原流程。</li>
              </ul>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-800 rounded-lg text-[11px] font-semibold">
              ✓ 游客可自由浏览，操作时平滑拉起登录
            </div>
          </div>

          {/* Forgot Password Flow */}
          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-[#835500] text-white flex items-center justify-center text-[11px]">3</span>
                <span>找回密码 (Forgot Password)</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-[#5F4B49] leading-relaxed">
                <li>• <strong>账号核验：</strong>输入已注册手机号并校验有效性。</li>
                <li>• <strong>安全验证码：</strong>获取并校验 6 位短信安全验证码。</li>
                <li>• <strong>新密码设置：</strong>输入新密码（8~20位字母数字组合）并再次确认。</li>
                <li>• <strong>凭据重置：</strong>提交成功后旧密码立即作废，提示重置成功并返回登录页。</li>
              </ul>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-700 rounded-lg text-[11px] font-semibold">
              ✓ 密码重置成功立即生效并自动回填
            </div>
          </div>
        </div>
      </section>

      {/* 2. Unified User Model & Dual Invitation Mechanics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck size={20} className="text-[#835500]" />
          <h3 className="font-hanken text-[18px] font-bold text-[#271310]">
            统一用户模型与双轨发起机制 (PRD 3.2 &amp; 3.3)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-inter text-xs">
          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <Coffee size={16} className="text-[#FF5E03]" />
              <span>方式一：请喝电子咖啡 (E-Coffee Invitation)</span>
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              任何用户均可向分享者发起。咨询者根据分享者设置的签名饮品（如燕麦拿铁 ¥28、瑰夏手冲 ¥38 等）进行点单，并必须填写具体咨询问题（≥10字）及最多3个期望时段。分享者评估问题适合度后决定是否接受。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <Repeat size={16} className="text-blue-500" />
              <span>方式二：0 元主题互换 (Topic Swap Invitation)</span>
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              要求咨询者本身也已开启分享中心并设置了可分享的主题。咨询者发起时选择对方主题并附带自己的互换主题，无需购买饮品（0元），对谈时长建议双方各占15分钟（共30分钟）。
            </p>
          </div>
        </div>
      </section>

      {/* 3. Color Palette Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette size={20} className="text-[#835500]" />
          <h3 className="font-hanken text-[18px] font-bold text-[#271310]">
            品牌色彩令牌 (Color Tokens)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#271310] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Primary Espresso</div>
            <div className="font-bold text-[14px]">#271310</div>
            <div className="text-[10px] text-gray-300">核心品牌、主要标题、权威感</div>
          </div>

          <div className="bg-[#835500] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Secondary Caramel</div>
            <div className="font-bold text-[14px]">#835500</div>
            <div className="text-[10px] text-gray-200">次级强调、时间标签、核心行为</div>
          </div>

          <div className="bg-[#feae2c] text-[#291800] p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Caramel Orange CTA</div>
            <div className="font-bold text-[14px]">#FEAE2C</div>
            <div className="text-[10px] text-[#291800]/80">立即预约按钮、在线高亮、角标</div>
          </div>

          <div className="bg-[#fef8f4] text-[#1A1110] p-3.5 rounded-2xl shadow-sm space-y-1 border border-[#d3c3c0]/60">
            <div className="text-[11px] font-mono text-[#827472]">Warm Rice White</div>
            <div className="font-bold text-[14px]">#FEF8F4</div>
            <div className="text-[10px] text-[#5F4B49]">全局背景底色、温润护眼、低反射</div>
          </div>

          <div className="bg-[#ffffff] text-[#1A1110] p-3.5 rounded-2xl shadow-ambient-lvl1 space-y-1 border border-[#f3ede9]">
            <div className="text-[11px] font-mono text-[#827472]">Surface Card</div>
            <div className="font-bold text-[14px]">#FFFFFF</div>
            <div className="text-[10px] text-[#5F4B49]">独立卡片、微漫反射阴影抬升</div>
          </div>

          <div className="bg-[#2E7D32] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Status Success</div>
            <div className="font-bold text-[14px]">#2E7D32</div>
            <div className="text-[10px] text-gray-200">已实名认证、已完成、已支付</div>
          </div>

          <div className="bg-[#D32F2F] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Status Error</div>
            <div className="font-bold text-[14px]">#D32F2F</div>
            <div className="text-[10px] text-gray-200">已取消、离线、不可用</div>
          </div>

          <div className="bg-[#5F4B49] text-white p-3.5 rounded-2xl shadow-sm space-y-1">
            <div className="text-[11px] font-mono opacity-75">Text Secondary</div>
            <div className="font-bold text-[14px]">#5F4B49</div>
            <div className="text-[10px] text-gray-200">正文说明、辅助文字</div>
          </div>
        </div>
      </section>

      {/* 4. 7 Core Pages Architecture Checklist */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#2E7D32]" />
          <h3 className="font-hanken text-[18px] font-bold text-[#271310]">
            7 个核心页面体系 (PRD 验收规范)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-inter text-xs">
          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 1：发现首页 (Discover)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              展示品牌语“和真正做过的人，聊一次。”，展示已认证分享者卡片、签名饮品、主题标签、最早可约时间与主题互换标识。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 2：分享者详情 (Sharer Profile)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              职业履历、签名咖啡卡片、主题列表（适聊/不适聊边界）、未来7天时段看板、真实对谈评价与双按钮（请喝咖啡 / 主题互换）。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 3：发起对谈邀请 (Create Invitation)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              电子咖啡 / 主题互换模式切换、想聊的问题（必填）、最多3个期望时段选择、互换资质校验与未登录智能拦截。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 4：支付咖啡款 (Checkout)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              当分享者接受电子咖啡邀请后进入待付款，展示订单摘要、微信/支付宝支付单选、未到场全额退款保障与即时结算。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 5：对谈管理列表 (Chats List)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              “我发起的 / 收到邀请” 分段切换、状态筛选（待回复/待付款/已排期/已完成/已取消/售后中）、接受/婉拒邀请弹窗操作。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 6：对谈详情 (Chat Details)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              全状态时间轴、腾讯会议房间卡（一键复制与即时进入）、改约协商、双盲评价与24小时投诉维权入口。
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-ambient-lvl1 border border-[#f3ede9] space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-[#271310] font-bold text-sm">
              <CheckCircle2 size={16} className="text-[#2E7D32]" />
              页面 7：我的 (Profile) &amp; 分享中心 (Sharing Center)
            </div>
            <p className="text-[#5F4B49] leading-relaxed">
              支持游客未登录与已登录状态无缝切换、实名认证标识、对谈统计、在线分享开关、签名咖啡配置、30分钟主题管理、周互换次数上限设置、腾讯会议号配置与主页实时预览。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
