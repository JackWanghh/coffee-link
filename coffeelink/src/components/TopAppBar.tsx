import React from 'react';
import { ChevronLeft, MoreHorizontal, Share2 } from 'lucide-react';
import { useTheme } from '../theme';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  subtitle,
}) => {
  const { theme } = useTheme();

  return (
    <header 
      className="sticky top-0 w-full z-40 h-14 backdrop-blur-md flex items-center justify-between px-5 transition-colors duration-300 border-b shrink-0"
      style={{
        backgroundColor: `${theme.colors.bg}E6`,
        borderColor: theme.colors.border,
      }}
    >
      <div className="w-10 flex items-center justify-start">
        {showBack ? (
          <button
            onClick={onBack}
            className="hover:opacity-80 rounded-full p-2 active:scale-95 transition-all duration-150 -ml-2 flex items-center justify-center"
            style={{ color: theme.colors.textPrimary }}
            aria-label="Back"
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 
          className="font-hanken text-[18px] font-bold tracking-tight truncate max-w-[200px]"
          style={{ color: theme.colors.textPrimary }}
        >
          {title}
        </h1>
        {subtitle && (
          <span 
            className="text-[11px] truncate font-inter"
            style={{ color: theme.colors.textSecondary }}
          >
            {subtitle}
          </span>
        )}
      </div>

      <div className="w-10 flex items-center justify-end">
        {rightAction ? (
          rightAction
        ) : (
          <button
            className="hover:opacity-80 rounded-full p-2 active:scale-95 transition-all duration-150 -mr-2"
            style={{ color: theme.colors.textSecondary }}
            aria-label="More"
          >
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

