import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGameSocket } from '../services/socket';
import { UserPlus, CheckCircle, User as UserIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MobileJoin: React.FC = () => {
  const { id: eventId } = useParams();
  const { emitJoin, socket, joinEventRoom } = useGameSocket();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [isAlreadyInList, setIsAlreadyInList] = useState(false);
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

  // Sync event state on mount
  useEffect(() => {
    if (eventId && socket) {
      joinEventRoom(eventId);
    }
  }, [eventId, socket, joinEventRoom]);

  // Sync join state with server (RESET handling)
  const { gameState } = useGameSocket();
  const wasInListRef = useRef(false);

  useEffect(() => {
    if (currentUser) {
      const existingUser = gameState.users.find(u => u.lineUserId === currentUser.lineUserId);
      const inList = !!existingUser;

      // If we WERE in the list and now we are NOT, it's a server RESET
      // Reset the join state so the user can join again
      // If we WERE in the list and now we are NOT, check if it's a RESET
      // We assume it's a reset if the user list is empty or significantly changed
      // For stability, let's only auto-reset if the game status implies waiting or users are cleared
      if (wasInListRef.current && !inList && gameState.users.length === 0) {
        console.log("[MobileJoin] User removed & list empty (RESET) - resetting join state");
        setHasJoined(false);
      }

      setIsAlreadyInList(inList);
      wasInListRef.current = inList;

      // If currently in list, ensure the name shown is the latest one
      if (existingUser && existingUser.name) {
        setCustomName(existingUser.name);
      }
    }
  }, [gameState.users, currentUser]);

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
      if (isAlreadyInList) {
        setHasJoined(true);
        return;
      }

      if (!customName.trim()) {
        alert("請輸入名稱");
        return;
      }

      emitJoin({
        name: customName.trim(),
        avatar: currentUser.avatar,
        lineUserId: currentUser.lineUserId,
        id: currentUser.lineUserId
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
          <h2 className="text-3xl font-bold text-white mb-2 glow-text">
            {isAlreadyInList ? '您已在名單中' : '加入成功！'}
          </h2>
          <p className="text-slate-300 mb-6">
            {isAlreadyInList ? '您的資料已同步至大螢幕。' : '請在大螢幕上尋找您的頭像。'}
          </p>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <img src={currentUser?.avatar} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20" />
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-pink-300">{customName}</div>
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <div className="text-sm text-slate-400">
              抽獎結束前請勿關閉此頁面
            </div>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout');
                window.location.reload();
              }}
              className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
            >
              登出 (切換帳號)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={containerStyle}>
      <div className="w-full max-w-sm mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2 glow-text-gold">
          {eventConfig?.title || '歡迎加入'}
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
              <svg viewBox="0 0 170 170" fill="currentColor" className="w-8 h-8">
                <path d="M147 78c 0-28-28-50-62-50.5-34 0-62 22.5-62 50.5 0 25 22 45.5 52 50 2 .5 5 1.5 5.5 3 .5 1.5.5 4 0 5.5 0 0-.5 4.5 -1 5.5 -.5 1.5 -1 6 5.5 3.5 6.5 -3 35.5-21 48.7-36 9-10 13-20 13.3-31z" />
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
                  {isAlreadyInList || hasJoined ? '顯示名稱' : '顯示名稱 (可修改)'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  readOnly={isAlreadyInList || hasJoined}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all ${isAlreadyInList || hasJoined ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="輸入您的名稱"
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={!customName.trim()}
              className={`w-full btn-primary text-white font-bold py-4 rounded-xl text-xl shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${isAlreadyInList ? 'from-indigo-600 to-indigo-700 bg-none' : ''}`}
            >
              {isAlreadyInList ? (
                <>
                  <CheckCircle size={24} />
                  您已在名單中
                </>
              ) : (
                <>
                  <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
                  確認加入
                </>
              )}
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
