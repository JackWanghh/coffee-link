export type TabType = 'discover' | 'chats' | 'mine';

export type ViewRoute = 
  | { type: 'tab'; tab: TabType }
  | { type: 'sharer-detail'; sharerId: string }
  | { type: 'create-invitation'; sharerId: string; initialMode?: 'ECOFFEE' | 'TOPIC_SWAP'; initialThemeId?: string }
  | { type: 'checkout'; sessionId: string }
  | { type: 'chat-detail'; sessionId: string }
  | { type: 'sharing-center' };

export interface CoffeeDrink {
  id: string;
  name: string;
  nameEn: string;
  price: number; // 平台统一定价
  icon: string;
  description: string;
  tag?: string;
}

export interface ChatTheme {
  id: string;
  title: string;
  description: string;
  durationMinutes?: 30; // 固定30分钟
  includes: string[];
  excludes: string[];
}

export interface Review {
  id: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  comment: string;
  date: string;
  isSwapReview?: boolean;
}

export interface Sharer {
  id: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  industry?: string;
  isVerified: boolean;
  declarationNote: string;
  highlights: string[];
  signatureDrink: CoffeeDrink; // 签名饮品
  acceptsTopicSwap: boolean; // 是否接受主题互换
  weeklySwapLimit: number; // 每周互换上限
  remainingSwapQuota: number; // 本周剩余互换名额
  themes: ChatTheme[];
  nextAvailableText: string;
  availableDays: {
    date: string;
    dayOfWeek: string;
    slotsCount: number;
    isFull?: boolean;
    slots: string[];
  }[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  swapFeedbackCount: number;
  meetingLink: string;
  onTimeRate: string;
  responseMedianTime: string;
}

export type SessionType = 'ECOFFEE' | 'TOPIC_SWAP';

export type SessionStatus = 
  | 'PENDING_RESPONSE'           // 待回应 (分享者处理中)
  | 'ACCEPTED_PENDING_PAYMENT'   // 已接受待付款 (发起人2小时内付款)
  | 'BOOKED'                     // 电子咖啡已预约付款成功
  | 'SWAP_SCHEDULED'             // 主题互换已排期成立
  | 'COMPLETED'                  // 已完成30分钟对谈
  | 'IN_AFTER_SALE'              // 售后处理中 (24小时内)
  | 'REFUNDING'                  // 退款中
  | 'DECLINED'                   // 分享者已婉拒
  | 'EXPIRED'                    // 邀请超时 / 待付款超时
  | 'CANCELLED';                 // 已取消

export interface ChatSession {
  id: string;
  sessionType: SessionType;
  orderNumber: string;
  
  // 发起人信息 (Inquirer)
  senderId: string;
  senderName: string;
  senderTitle: string;
  senderAvatar: string;
  
  // 接收方/分享者信息 (Sharer)
  receiverId: string;
  receiverName: string;
  receiverTitle: string;
  receiverAvatar: string;
  
  // 主题信息
  themeId: string;
  themeTitle: string;
  themeDescription?: string;
  
  // 主题互换特有信息 (Topic Swap)
  swapThemeId?: string;
  swapThemeTitle?: string;
  swapThemeDescription?: string;
  
  // 双方问题与分享说明
  inquirerQuestion: string; // 发起人想聊的具体问题 (必填)
  whatInquirerCanShare?: string; // 互换时发起人可分享内容
  receiverQuestion?: string; // 接收方接受互换时补充想问发起人的问题
  
  // 期望时段与确认时段
  candidateSlots: string[]; // 最多3个期望时段
  confirmedSlot?: string; // 分享者接受时确认的时段
  
  // 电子咖啡饮品与价格 (仅 ECOFFEE 类型)
  coffeeDrink?: CoffeeDrink;
  price?: number; // 实付金额
  paymentMethod?: '微信支付' | '支付宝';
  paymentDeadline?: string; // 付款倒计时
  
  // 状态与会议
  status: SessionStatus;
  statusText: string;
  declineReason?: string; // 婉拒原因
  meetingType: '腾讯会议';
  meetingId: string;
  meetingUrl: string;
  createdAt: string;
  durationMinutes: 30; // 固定30分钟 (互换时各15分钟)
  
  // 评价与反馈
  review?: {
    rating: number;
    comment: string;
    tag?: string;
    createdAt: string;
  };
  complaintReason?: string;
}

// 兼容别名
export type Order = ChatSession;
export type OrderStatus = SessionStatus;

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
  totalChats: number;
  rating: number;
  replyRate: string;
  onTimeRate: string;
  phone: string;
  isLoggedIn: boolean;
  isSharingOpen: boolean; // 是否开放分享 (用户默认是咨询者，设置后成为分享者)
  signatureDrink: CoffeeDrink;
  acceptsTopicSwap: boolean;
  weeklySwapLimit: number;
  totalEarnings: number;
  completedSessionsCount: number;
  completedSwapsCount: number;
  meetingLink: string;
  myThemes: ChatTheme[];
}

export interface SharingCenterConfig {
  isOnline: boolean;
  signatureDrink: CoffeeDrink;
  acceptsTopicSwap: boolean;
  weeklySwapLimit: number;
  remainingSwapQuota: number;
  totalEarnings: number;
  pendingEarnings: number;
  settledEarnings: number;
  platformFeeRate: number; // 0.15
  defaultMeetingUrl: string;
  defaultMeetingId: string;
  themesCount: number;
  maxThemes: number;
}
