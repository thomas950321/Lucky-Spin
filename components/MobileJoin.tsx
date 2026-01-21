import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameSocket } from '../services/socket';
import { UserPlus, CheckCircle, User as UserIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MobileJoin: React.FC = () => {
  const { id: eventId } = useParams();
  const { emitJoin, socket } = useGameSocket();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [eventConfig, setEventConfig] = useState<{ title?: string, background_url?: string } | null>(null);

  useEffect(() => {
    checkAuth();
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => setEventConfig(data))
        .catch(console.error);
    }
  }, [eventId]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data);
        setCustomName(data.name);
      }
    } catch (error) {
      console.error("Auth check failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/line/login';
  };

  const handleJoin = () => {
    if (socket && currentUser) {
      if (!customName.trim()) {
        alert("請輸入名稱");
        return;
      }

      emitJoin({
        name: customName.trim(),
        avatar: currentUser.avatar,
        lineUserId: currentUser.lineUserId,
        id: currentUser.lineUserId // Use lineUserId as ID or let server/socket generate? socket.ts handles it
      } as any, undefined, eventId || 'default');

      setHasJoined(true);

      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899']
      });
    }
  };

  // Inherit background if configured
  const containerStyle = eventConfig?.background_url ? {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('${eventConfig.background_url}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  if (isLoading) return <div className="text-white text-center mt-20">Loading...</div>;

  if (hasJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={containerStyle}>
        <div className="glass-card p-8 w-full max-w-sm animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 glow-text">加入成功！</h2>
          <p className="text-slate-300 mb-6">請在大螢幕上尋找您的頭像。</p>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <img src={currentUser?.avatar} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20" />
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-pink-300">{customName}</div>
          </div>
          <div className="mt-8 text-sm text-slate-400">
            抽獎結束前請勿關閉此頁面
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={containerStyle}>
      <div className="w-full max-w-sm mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-2 glow-text">
          {eventConfig?.title || 'RaffleRoyale'}
        </h1>
        <p className="text-slate-400">大螢幕互動抽獎系統</p>
      </div>

      <div className="glass-card p-6 md:p-8 w-full max-w-sm">
        {!isAuthenticated ? (
          <div className="space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-full mx-auto flex items-center justify-center border border-white/10">
              <UserIcon size={40} className="text-slate-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">請先登入</h3>
              <p className="text-slate-400 text-sm">使用 LINE 帳號快速登入以參加與抽獎</p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-all flex items-center justify-center gap-3"
            >
              {/* Simple LINE Icon SVG */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M20.6 10c0-4.4-4.7-8-10.6-8S-.6 5.6-.6 10c0 4 3.9 7.4 9.1 7.9.4 0 .9.1 1 .2.5.3.3.8.1 1.3 0 0-.2.8-.2.9-.2.8-.8 2-.8 2 0 0 1 .4 2.8 1.5 1.7 1.1 9.2-5.4 9.2-5.4 3.7-2 6-4.6 6-8zM7.2 12.1H5.7v-2.1h1.5v2.1zm2.8 0H8.5V7.8h1.5v4.3zm2.7 0h-2l1.3-1.8-1.3-2.5h1.7l.6 1.4.5-1.4h1.6l-1.6 2.6 1.7 1.7h-1.8l-.7-1.4zM24 12c0 6.6-5.4 12-12 12S0 18.6 0 12 5.4 0 12 0s12 5.4 12 12z" opacity="0" />
                <path d="M19.4 10c0-3.8-4.2-7-9.4-7S.6 6.2.6 10c0 3.5 3.1 6.4 7.9 6.9.3 0 .7.1.9.2.2.1.2.3.1.6 0 .1-.2.4-.2.5l-.2.8s-.1.4.2.8c.8.5 4.3 2.5 5.8 1.7.1 0 3.6-2.1 3.6-2.1 3.2-1.7 5.2-4 5.2-6.9H19.4zM6.9 12.3H4.7c-.2 0-.4-.2-.4-.4V8.1c0-.2.2-.4.4-.4h2.2c.2 0 .4.2.4.4.1.2-.1.4-.3.4H5.5v1.1h1.4c.2 0 .4.2.4.4 0 .2-.2.4-.4.4zm2.8 0H8c-.2 0-.4-.2-.4-.4V8.1c0-.2.2-.4.4-.4h1.7c.2 0 .4.2.4.4v3.8c0 .2-.2.4-.4.4zm3.6-2.4l1.1 2.3c.1.1.2.1.2.1h1.6c.2 0 .3-.2.2-.4L14.7 9.8l1.6-1.9c.1-.2 0-.4-.2-.4h-1.7c-.1 0-.2 0-.2.1L13.2 9l-1.1-1.3c-.1-.1-.2-.1-.2-.1h-1.6c-.2 0-.3.2-.2.4l1.6 2.2-1.7 2.1c-.1.2 0 .4.2.4h1.7c.1 0 .2-.1.2-.1l1.2-2.3zM16.4 12.3h-2.2c-.2 0-.4-.2-.4-.4V8.1c0-.2.2-.4.4-.4h2.2c.2 0 .4.2.4.4v.4c0 .2-.2.4-.4.4h-1.4v.9h1.4c.2 0 .4.2.4.4v.4c0 .2-.2.4-.4.4h-1.4v1h1.4c.2 0 .4.2.4.4 0 .1-.1.3-.4.3z" fill="#FFF" />
              </svg>
              LINE 登入
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col items-center gap-4">
              <img src={currentUser?.avatar} className="w-24 h-24 rounded-full border-4 border-white/10 shadow-xl" />
              <div className="w-full">
                <label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">
                  顯示名稱 (可修改)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                  placeholder="輸入您的名稱"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={!customName.trim()}
              className="w-full btn-primary text-white font-bold py-4 rounded-xl text-xl shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
              確認加入
            </button>

            <button
              onClick={async () => {
                await fetch('/api/auth/logout');
                window.location.reload();
              }}
              className="text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <span>➜</span> 登出 (Switch Account)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
