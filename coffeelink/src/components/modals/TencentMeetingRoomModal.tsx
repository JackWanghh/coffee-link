import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Share2, 
  MessageSquare, 
  Users, 
  PhoneOff, 
  Volume2, 
  Settings,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../../types';

interface TencentMeetingRoomModalProps {
  order: Order;
  onClose: () => void;
}

export const TencentMeetingRoomModal: React.FC<TencentMeetingRoomModalProps> = ({
  order,
  onClose,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(120); // 2 mins in

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F12] text-white flex flex-col select-none animate-in fade-in duration-200">
      {/* Meeting Header */}
      <header className="h-14 bg-[#16161D]/90 backdrop-blur-md px-4 flex items-center justify-between border-b border-[#262634]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <div>
            <h2 className="font-inter text-[13px] font-bold truncate max-w-[180px] text-white">
              {order.themeTitle}
            </h2>
            <p className="text-[10px] text-[#A1A1AA] font-mono">
              会议号: {order.meetingId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] bg-[#141419] border border-[#2E2E3C] px-2 py-0.5 rounded text-emerald-400 font-semibold">
            {formatTime(elapsedSeconds)} / 30:00
          </span>
          <button
            onClick={onClose}
            className="bg-[#FF2D55] hover:bg-[#FF2D55]/90 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
          >
            离开会议
          </button>
        </div>
      </header>

      {/* Video Grid Canvas */}
      <main className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden bg-[#0F0F12]">
        {/* Mentor / Partner Screen */}
        <div className="relative bg-[#16161D] rounded-2xl overflow-hidden flex items-center justify-center border border-[#2E2E3C] shadow-inner">
          <img
            src={order.sharerAvatar}
            alt={order.sharerName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute top-3 left-3 bg-[#0F0F12]/80 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {order.sharerName} ({order.sharerTitle})
          </div>
          <div className="absolute bottom-3 right-3 bg-[#0F0F12]/80 border border-white/10 px-2 py-0.5 rounded text-[10px] text-[#A1A1AA]">
            1080P HD 腾讯天籁音频
          </div>
        </div>

        {/* User Self Screen */}
        <div className="relative bg-[#16161D] rounded-2xl overflow-hidden flex items-center justify-center border border-[#2E2E3C]">
          {videoOn ? (
            <div className="w-full h-full bg-gradient-to-tr from-[#16161D] via-[#1A1A24] to-[#251A24] flex flex-col items-center justify-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF5E03] to-[#FF2D55] flex items-center justify-center text-[24px] font-bold text-white shadow-glow-orange border-2 border-white/30">
                我
              </div>
              <p className="text-[12px] text-[#A1A1AA] mt-2">摄像头已开启 (自拍视图)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-[#1A1A24] border border-[#2E2E3C] flex items-center justify-center text-[#71717A]">
                <VideoOff size={24} />
              </div>
              <p className="text-[12px] text-[#A1A1AA]">摄像头已关闭</p>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-[#0F0F12]/80 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5">
            {micOn ? (
              <Mic size={12} className="text-emerald-400" />
            ) : (
              <MicOff size={12} className="text-[#FF2D55]" />
            )}
            我 (已连线)
          </div>
        </div>
      </main>

      {/* Control Action Toolbar */}
      <footer className="h-20 bg-[#16161D] border-t border-[#262634] px-4 flex items-center justify-around select-none">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            micOn ? 'text-white' : 'text-[#FF2D55]'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            micOn ? 'bg-[#1A1A24] border border-[#2E2E3C] hover:bg-white/10' : 'bg-[#FF2D55]/20 border border-[#FF2D55]/40'
          }`}>
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </div>
          {micOn ? '静音' : '解除静音'}
        </button>

        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            videoOn ? 'text-white' : 'text-[#FF2D55]'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            videoOn ? 'bg-[#1A1A24] border border-[#2E2E3C] hover:bg-white/10' : 'bg-[#FF2D55]/20 border border-[#FF2D55]/40'
          }`}>
            {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
          </div>
          {videoOn ? '停止视频' : '开启视频'}
        </button>

        <button className="flex flex-col items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-white">
          <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#2E2E3C] flex items-center justify-center hover:bg-white/10">
            <Share2 size={18} />
          </div>
          共享屏幕
        </button>

        <button className="flex flex-col items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-white">
          <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#2E2E3C] flex items-center justify-center hover:bg-white/10">
            <Users size={18} />
          </div>
          成员 (2人)
        </button>

        <button
          onClick={onClose}
          className="flex flex-col items-center gap-1 text-[11px] text-[#FF2D55]"
        >
          <div className="w-10 h-10 rounded-full bg-[#FF2D55] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <PhoneOff size={18} />
          </div>
          结束对谈
        </button>
      </footer>
    </div>
  );
};
