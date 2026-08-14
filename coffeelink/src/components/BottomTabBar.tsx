import React from 'react';
import { Search, MessageSquare, User } from 'lucide-react';
import { TabType } from '../types';
import { useTheme } from '../theme';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 1,
}) => {
  const { theme } = useTheme();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full z-40 h-[72px] pb-4 backdrop-blur-lg border-t flex justify-around items-center px-4 select-none transition-colors duration-300 shadow-ambient-top"
      style={{
        backgroundColor: `${theme.colors.bg}E6`,
        borderColor: theme.colors.border,
      }}
    >
      {/* Tab 1: Discover */}
      <button
        onClick={() => onTabChange('discover')}
        className="flex flex-col items-center justify-center w-20 py-1 rounded-xl transition-all duration-200 active:scale-95"
        style={{
          color: activeTab === 'discover' ? theme.colors.primary : theme.colors.textMuted,
          transform: activeTab === 'discover' ? 'scale(1.05)' : 'scale(1)',
          fontWeight: activeTab === 'discover' ? 700 : 500,
        }}
      >
        <Search
          size={22}
          strokeWidth={activeTab === 'discover' ? 2.5 : 2}
          className="mb-1"
        />
        <span className="font-inter text-[11px] tracking-wide">发现</span>
      </button>

      {/* Tab 2: Chats */}
      <button
        onClick={() => onTabChange('chats')}
        className="flex flex-col items-center justify-center w-20 py-1 rounded-xl transition-all duration-200 active:scale-95 relative"
        style={{
          color: activeTab === 'chats' ? theme.colors.primary : theme.colors.textMuted,
          transform: activeTab === 'chats' ? 'scale(1.05)' : 'scale(1)',
          fontWeight: activeTab === 'chats' ? 700 : 500,
        }}
      >
        <div className="relative">
          <MessageSquare
            size={22}
            strokeWidth={activeTab === 'chats' ? 2.5 : 2}
            className="mb-1"
          />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full border shadow-sm animate-pulse"
              style={{
                backgroundColor: theme.colors.secondary,
                borderColor: theme.colors.bg,
              }}
            />
          )}
        </div>
        <span className="font-inter text-[11px] tracking-wide">对谈</span>
      </button>

      {/* Tab 3: Mine */}
      <button
        onClick={() => onTabChange('mine')}
        className="flex flex-col items-center justify-center w-20 py-1 rounded-xl transition-all duration-200 active:scale-95"
        style={{
          color: activeTab === 'mine' ? theme.colors.primary : theme.colors.textMuted,
          transform: activeTab === 'mine' ? 'scale(1.05)' : 'scale(1)',
          fontWeight: activeTab === 'mine' ? 700 : 500,
        }}
      >
        <User
          size={22}
          strokeWidth={activeTab === 'mine' ? 2.5 : 2}
          className="mb-1"
        />
        <span className="font-inter text-[11px] tracking-wide">我的</span>
      </button>
    </nav>
  );
};

