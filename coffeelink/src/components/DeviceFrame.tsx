import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';
import { useTheme } from '../theme';

interface DeviceFrameProps {
  children: React.ReactNode;
  activeTabTitle?: string;
  isSimulatorMode: boolean;
  scale: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  isSimulatorMode,
  scale,
}) => {
  const [time, setTime] = useState('09:41');
  const { theme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isLight = theme.category === 'light';

  if (!isSimulatorMode) {
    return (
      <div 
        className="w-full min-h-screen flex flex-col items-center transition-colors duration-300"
        style={{ backgroundColor: theme.colors.bg }}
      >
        <div 
          className="w-full max-w-lg min-h-screen shadow-2xl flex flex-col relative border-x"
          style={{ 
            backgroundColor: theme.colors.bg,
            borderColor: theme.colors.border 
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative transition-all duration-300 origin-top flex justify-center items-start"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Outer Titanium Frame */}
      <div className="relative w-[393px] h-[852px] bg-[#0c0c10] rounded-[55px] p-[12px] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12)_inset] ring-1 ring-white/10 select-none">
        
        {/* Antenna bands & buttons simulation */}
        <div className="absolute -left-[14px] top-[115px] w-[3px] h-[26px] bg-[#2a2a38] rounded-l-sm" />
        <div className="absolute -left-[14px] top-[170px] w-[3px] h-[50px] bg-[#2a2a38] rounded-l-sm" />
        <div className="absolute -left-[14px] top-[230px] w-[3px] h-[50px] bg-[#2a2a38] rounded-l-sm" />
        <div className="absolute -right-[14px] top-[180px] w-[3px] h-[75px] bg-[#2a2a38] rounded-r-sm" />

        {/* Inner Screen Bezel */}
        <div 
          className="w-full h-full rounded-[44px] overflow-hidden relative flex flex-col border-[4px] border-[#050507] transition-colors duration-300"
          style={{ backgroundColor: theme.colors.bg }}
        >
          
          {/* iOS Dynamic Island & Status Bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-[48px] z-50 flex items-center justify-between px-7 pt-2 pointer-events-none transition-colors duration-300"
            style={{ color: isLight ? '#1e293b' : '#ffffff' }}
          >
            {/* Clock */}
            <span className="text-[14px] font-semibold tracking-tight pl-1 font-inter">
              {time}
            </span>

            {/* Dynamic Island */}
            <div className="w-[124px] h-[34px] bg-[#050507] rounded-full flex items-center justify-between px-3 pointer-events-auto shadow-md border border-white/10 text-white">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a24] border border-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Sparkles size={11} style={{ color: theme.colors.primary }} />
              </div>
            </div>

            {/* Icons: 5G, Wifi, Battery */}
            <div className="flex items-center gap-1.5 pr-1">
              <span className="text-[10px] font-bold tracking-tighter opacity-80">5G</span>
              <Wifi size={13} strokeWidth={2.5} />
              <BatteryMedium size={18} strokeWidth={2} />
            </div>
          </div>

          {/* Screen Content Container */}
          <div 
            className="flex-1 w-full overflow-hidden flex flex-col pt-[44px] relative transition-colors duration-300"
            style={{ backgroundColor: theme.colors.bg }}
          >
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-0 right-0 h-5 flex justify-center items-center pointer-events-none z-50">
            <div 
              className="w-[134px] h-[4.5px] rounded-full shadow-sm"
              style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)' }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

