/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  ViewRoute, 
  Sharer, 
  ChatTheme, 
  ChatSession, 
  UserProfile, 
  SharingCenterConfig,
  SessionType,
  CoffeeDrink
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_SHARING_CONFIG, 
  MOCK_SHARERS, 
  INITIAL_SESSIONS,
  COFFEE_CATALOG
} from './data/mockData';

// Components
import { BottomTabBar } from './components/BottomTabBar';
import { DiscoverView } from './components/pages/DiscoverView';
import { SharerDetailView } from './components/pages/SharerDetailView';
import { CreateInvitationView } from './components/pages/CreateInvitationView';
import { BookingCheckoutView } from './components/pages/BookingCheckoutView';
import { ChatsListView } from './components/pages/ChatsListView';
import { ChatDetailView } from './components/pages/ChatDetailView';
import { ProfileView } from './components/pages/ProfileView';
import { SharingCenterView } from './components/pages/SharingCenterView';
import { TencentMeetingRoomModal } from './components/modals/TencentMeetingRoomModal';
import { SettingsThemeModal } from './components/modals/SettingsThemeModal';
import { AuthModal } from './components/modals/AuthModal';
import { useTheme } from './theme';
import { 
  EditProfileModal, 
  ManageThemesModal, 
  SelectSignatureDrinkModal,
  TopicSwapSettingsModal,
  SharerAcceptInvitationModal,
  SharerDeclineInvitationModal,
  ReviewModal, 
  ComplaintModal 
} from './components/modals/InteractiveModals';

export default function App() {
  const { theme } = useTheme();

  // App Data State with Local Persistence
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('coffeelink_user_v2');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [sharingConfig, setSharingConfig] = useState<SharingCenterConfig>(() => {
    const saved = localStorage.getItem('coffeelink_sharing_config_v2');
    return saved ? JSON.parse(saved) : INITIAL_SHARING_CONFIG;
  });

  const [sharers, setSharers] = useState<Sharer[]>(() => {
    const saved = localStorage.getItem('coffeelink_sharers_v2');
    return saved ? JSON.parse(saved) : MOCK_SHARERS;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('coffeelink_sessions_v2');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>({ type: 'tab', tab: 'discover' });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [authSourceNotice, setAuthSourceNotice] = useState<string | undefined>(undefined);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const openAuthModal = (
    mode: 'login' | 'register' | 'forgot-password' = 'login',
    notice?: string,
    onSuccessAction?: () => void
  ) => {
    setAuthModalMode(mode);
    setAuthSourceNotice(notice);
    setPendingAuthAction(() => onSuccessAction || null);
    setIsAuthModalOpen(true);
  };

  // Modals
  const [activeMeetingSession, setActiveMeetingSession] = useState<ChatSession | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isManageThemesOpen, setIsManageThemesOpen] = useState(false);
  const [isSelectDrinkOpen, setIsSelectDrinkOpen] = useState(false);
  const [isTopicSwapSettingsOpen, setIsTopicSwapSettingsOpen] = useState(false);
  const [acceptingSession, setAcceptingSession] = useState<ChatSession | null>(null);
  const [decliningSession, setDecliningSession] = useState<ChatSession | null>(null);
  const [reviewingSession, setReviewingSession] = useState<ChatSession | null>(null);
  const [complainingSession, setComplainingSession] = useState<ChatSession | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('coffeelink_user_v2', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('coffeelink_sharing_config_v2', JSON.stringify(sharingConfig));
  }, [sharingConfig]);

  useEffect(() => {
    localStorage.setItem('coffeelink_sharers_v2', JSON.stringify(sharers));
  }, [sharers]);

  useEffect(() => {
    localStorage.setItem('coffeelink_sessions_v2', JSON.stringify(sessions));
  }, [sessions]);

  // Tab Switcher handler
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentRoute({ type: 'tab', tab });
  };

  // Start Invitation
  const handleStartInvitation = (sharer: Sharer, mode: SessionType, themeId?: string) => {
    setCurrentRoute({
      type: 'create-invitation',
      sharerId: sharer.id,
      initialMode: mode,
      initialThemeId: themeId,
    });
  };

  // Submit Invitation Success
  const handleSubmitInvitationSuccess = (newSession: ChatSession) => {
    setSessions([newSession, ...sessions]);
    setCurrentRoute({ type: 'chat-detail', sessionId: newSession.id });
    setActiveTab('chats');
  };

  // Pay Session
  const handlePaySession = (session: ChatSession) => {
    setCurrentRoute({ type: 'checkout', sessionId: session.id });
  };

  // Payment Success
  const handlePaymentSuccess = (sessionId: string, paymentMethod: '微信支付' | '支付宝') => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'BOOKED',
              statusText: '已预约',
              paymentMethod,
            }
          : s
      )
    );
    setCurrentRoute({ type: 'chat-detail', sessionId });
  };

  // Sharer Accept
  const handleAcceptInvitation = (sessionId: string, confirmedSlot: string, receiverQuestion?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const isSwap = s.sessionType === 'TOPIC_SWAP';
        return {
          ...s,
          confirmedSlot,
          receiverQuestion: receiverQuestion || s.receiverQuestion,
          status: isSwap ? 'SWAP_SCHEDULED' : 'ACCEPTED_PENDING_PAYMENT',
          statusText: isSwap ? '已排期' : '待付款',
        };
      })
    );
  };

  // Sharer Decline
  const handleDeclineInvitation = (sessionId: string, reason: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'DECLINED',
              statusText: '已婉拒',
              declineReason: reason,
            }
          : s
      )
    );
  };

  // Cancel Session
  const handleCancelSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'CANCELLED', statusText: '已取消' }
          : s
      )
    );
  };

  // Submit Review
  const handleSubmitReview = (sessionId: string, rating: number, comment: string, tag?: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              review: {
                rating,
                comment,
                tag,
                createdAt: '刚刚',
              },
            }
          : s
      )
    );
  };

  // Submit Complaint
  const handleSubmitComplaint = (sessionId: string, reason: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'IN_AFTER_SALE',
              statusText: '售后中',
              complaintReason: reason,
            }
          : s
      )
    );
  };

  // Reset to initial mock data
  const handleResetData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setSharingConfig(INITIAL_SHARING_CONFIG);
    setSharers(MOCK_SHARERS);
    setSessions(INITIAL_SESSIONS);
    setActiveTab('discover');
    setCurrentRoute({ type: 'tab', tab: 'discover' });
  };

  // Render Mobile Prototype Screen based on currentRoute
  const renderScreenContent = () => {
    switch (currentRoute.type) {
      case 'tab': {
        if (currentRoute.tab === 'discover') {
          return (
            <DiscoverView
              sharers={sharers}
              onSelectSharer={(sharer) =>
                setCurrentRoute({ type: 'sharer-detail', sharerId: sharer.id })
              }
            />
          );
        } else if (currentRoute.tab === 'chats') {
          return (
            <ChatsListView
              currentUser={user}
              sessions={sessions}
              onSelectSession={(session) =>
                setCurrentRoute({ type: 'chat-detail', sessionId: session.id })
              }
              onEnterMeeting={(session) => setActiveMeetingSession(session)}
              onPaySession={handlePaySession}
              onOpenAcceptModal={(session) => setAcceptingSession(session)}
              onOpenDeclineModal={(session) => setDecliningSession(session)}
            />
          );
        } else {
          return (
            <ProfileView
              user={user}
              onOpenSharingCenter={() => {
                if (!user.isLoggedIn) {
                  openAuthModal('login', '进入分享中心前请先登录', () => {
                    setCurrentRoute({ type: 'sharing-center' });
                  });
                } else {
                  setCurrentRoute({ type: 'sharing-center' });
                }
              }}
              onOpenMyAppointments={() => {
                if (!user.isLoggedIn) {
                  openAuthModal('login', '查看对谈日程请先登录', () => {
                    setActiveTab('chats');
                    setCurrentRoute({ type: 'tab', tab: 'chats' });
                  });
                } else {
                  setActiveTab('chats');
                  setCurrentRoute({ type: 'tab', tab: 'chats' });
                }
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenLogin={() => openAuthModal('login')}
              onOpenRegister={() => openAuthModal('register')}
              onLogoutToggle={() => {
                setUser({ ...user, isLoggedIn: false });
              }}
            />
          );
        }
      }

      case 'sharer-detail': {
        const sharer = sharers.find((s) => s.id === currentRoute.sharerId) || sharers[0];
        return (
          <SharerDetailView
            sharer={sharer}
            onBack={() => setCurrentRoute({ type: 'tab', tab: activeTab })}
            onStartInvitation={handleStartInvitation}
          />
        );
      }

      case 'create-invitation': {
        const sharer = sharers.find((s) => s.id === currentRoute.sharerId) || sharers[0];
        return (
          <CreateInvitationView
            sharer={sharer}
            currentUser={user}
            initialMode={currentRoute.initialMode}
            initialThemeId={currentRoute.initialThemeId}
            onBack={() => setCurrentRoute({ type: 'sharer-detail', sharerId: sharer.id })}
            onSubmitSuccess={handleSubmitInvitationSuccess}
            onGoToSharingCenter={() => {
              if (!user.isLoggedIn) {
                openAuthModal('login', '请先登录后进入分享中心', () => {
                  setCurrentRoute({ type: 'sharing-center' });
                });
              } else {
                setCurrentRoute({ type: 'sharing-center' });
              }
            }}
            onRequireLogin={() => {
              openAuthModal('login', '发起邀请前请先登录或注册账号');
            }}
          />
        );
      }

      case 'checkout': {
        const session = sessions.find((s) => s.id === currentRoute.sessionId) || sessions[0];
        return (
          <BookingCheckoutView
            session={session}
            onBack={() => setCurrentRoute({ type: 'chat-detail', sessionId: session.id })}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      }

      case 'chat-detail': {
        const session = sessions.find((s) => s.id === currentRoute.sessionId) || sessions[0];
        return (
          <ChatDetailView
            session={session}
            currentUser={user}
            onBack={() => {
              setActiveTab('chats');
              setCurrentRoute({ type: 'tab', tab: 'chats' });
            }}
            onEnterMeeting={(sess) => setActiveMeetingSession(sess)}
            onPaySession={handlePaySession}
            onCancelSession={handleCancelSession}
            onOpenAcceptModal={(sess) => setAcceptingSession(sess)}
            onOpenDeclineModal={(sess) => setDecliningSession(sess)}
            onOpenReview={(sess) => setReviewingSession(sess)}
            onOpenComplaint={(sess) => setComplainingSession(sess)}
          />
        );
      }

      case 'sharing-center': {
        return (
          <SharingCenterView
            user={user}
            onBack={() => setCurrentRoute({ type: 'tab', tab: 'mine' })}
            onToggleSharingOpen={() =>
              setUser({
                ...user,
                isSharingOpen: !user.isSharingOpen,
              })
            }
            onEditProfile={() => setIsEditProfileOpen(true)}
            onManageThemes={() => setIsManageThemesOpen(true)}
            onManageSlots={() => {
              alert('已为您排期未来 7 天的每日 10:00~18:00 可用时段');
            }}
            onEditMeetingLink={() => {
              const newUrl = prompt('请输入您的默认腾讯会议号/链接:', user.meetingLink);
              if (newUrl) {
                setUser({
                  ...user,
                  meetingLink: newUrl,
                });
              }
            }}
            onOpenSelectDrink={() => setIsSelectDrinkOpen(true)}
            onOpenTopicSwapSettings={() => setIsTopicSwapSettingsOpen(true)}
            onPreviewMyPage={() => {
              const mySharer = sharers.find((s) => s.id === 'alex-chen') || sharers[0];
              setCurrentRoute({ type: 'sharer-detail', sharerId: mySharer.id });
            }}
          />
        );
      }

      default:
        return <DiscoverView sharers={sharers} onSelectSharer={(s) => setCurrentRoute({ type: 'sharer-detail', sharerId: s.id })} />;
    }
  };

  const showBottomTabBar = currentRoute.type === 'tab';

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start transition-colors duration-300 font-inter"
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Real Mobile App Viewport */}
      <div 
        className="w-full max-w-md min-h-screen flex flex-col relative shadow-xl overflow-x-hidden border-x transition-colors duration-300"
        style={{ 
          backgroundColor: theme.colors.bg,
          borderColor: theme.colors.border,
        }}
      >
        {/* Screen View Content */}
        {renderScreenContent()}

        {/* Bottom Tab Bar (Only on Tab Views) */}
        {showBottomTabBar && (
          <BottomTabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unreadCount={sessions.filter((s) => s.status === 'ACCEPTED_PENDING_PAYMENT' || s.status === 'PENDING_RESPONSE').length}
          />
        )}
      </div>

      {/* Auth Modal (Login / Register / Forgot-Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        sourceNotice={authSourceNotice}
        defaultPhone={user.phone}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAuthAction(null);
        }}
        onLoginSuccess={(newProfile) => {
          setUser((prev) => ({
            ...prev,
            ...newProfile,
            isLoggedIn: true,
          }));
          setIsAuthModalOpen(false);
          if (pendingAuthAction) {
            pendingAuthAction();
            setPendingAuthAction(null);
          }
        }}
      />

      {/* Interactive Modals */}
      {activeMeetingSession && (
        <TencentMeetingRoomModal
          order={activeMeetingSession}
          onClose={() => setActiveMeetingSession(null)}
        />
      )}

      {/* Edit Profile */}
      <EditProfileModal
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={(updated) => setUser({ ...user, ...updated })}
      />

      {/* Manage My Themes */}
      <ManageThemesModal
        themes={user.myThemes}
        isOpen={isManageThemesOpen}
        onClose={() => setIsManageThemesOpen(false)}
        onSaveThemes={(newThemes) => {
          setUser({ ...user, myThemes: newThemes });
          setSharingConfig({ ...sharingConfig, themesCount: newThemes.length });
        }}
      />

      {/* Select Signature Drink */}
      <SelectSignatureDrinkModal
        currentDrink={user.signatureDrink}
        isOpen={isSelectDrinkOpen}
        onClose={() => setIsSelectDrinkOpen(false)}
        onSelect={(drink: CoffeeDrink) => {
          setUser({ ...user, signatureDrink: drink });
          setSharingConfig({ ...sharingConfig, signatureDrink: drink });
        }}
      />

      {/* Topic Swap Settings */}
      <TopicSwapSettingsModal
        acceptsTopicSwap={user.acceptsTopicSwap}
        weeklyLimit={user.weeklySwapLimit}
        isOpen={isTopicSwapSettingsOpen}
        onClose={() => setIsTopicSwapSettingsOpen(false)}
        onSave={(accepts, limit) => {
          setUser({ ...user, acceptsTopicSwap: accepts, weeklySwapLimit: limit });
          setSharingConfig({ ...sharingConfig, acceptsTopicSwap: accepts, weeklySwapLimit: limit });
        }}
      />

      {/* Sharer Accept Modal */}
      {acceptingSession && (
        <SharerAcceptInvitationModal
          order={acceptingSession}
          isOpen={!!acceptingSession}
          onClose={() => setAcceptingSession(null)}
          onAccept={handleAcceptInvitation}
        />
      )}

      {/* Sharer Decline Modal */}
      {decliningSession && (
        <SharerDeclineInvitationModal
          order={decliningSession}
          isOpen={!!decliningSession}
          onClose={() => setDecliningSession(null)}
          onDecline={handleDeclineInvitation}
        />
      )}

      {/* Review Modal */}
      {reviewingSession && (
        <ReviewModal
          order={reviewingSession}
          isOpen={!!reviewingSession}
          onClose={() => setReviewingSession(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Complaint Modal */}
      {complainingSession && (
        <ComplaintModal
          order={complainingSession}
          isOpen={!!complainingSession}
          onClose={() => setComplainingSession(null)}
          onSubmitComplaint={handleSubmitComplaint}
        />
      )}

      {/* Settings Modal */}
      <SettingsThemeModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
