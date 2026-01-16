import React, { useState } from 'react';
import { User, GameState } from '../types';
import { LuckyWheel } from './LuckyWheel';
import { UserPlus, CheckCircle } from 'lucide-react';

interface MobileJoinProps {
  onJoin: (name: string, avatar: string) => void;
  gameState: GameState;
}

const AVATARS = ['🐼', '🦁', '🐸', '🦄', '🐲', '👻', '🤖', '👽', '🐶', '🐱'];

export const MobileJoin: React.FC<MobileJoinProps> = ({ onJoin, gameState }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [hasJoined, setHasJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name, selectedAvatar);
    setHasJoined(true);
  };

  if (hasJoined) {
    if (gameState.status === 'ROLLING' || gameState.status === 'WINNER') {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
          <LuckyWheel gameState={gameState} onSpinComplete={() => { }} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">加入成功！</h2>
          <p className="text-slate-400 mb-6">請在大螢幕上尋找您的頭像。</p>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700/50">
            <div className="text-6xl mb-2">{selectedAvatar}</div>
            <div className="text-xl font-semibold text-slate-200">{name}</div>
          </div>

          <div className="mt-8 text-sm text-slate-500">
            抽獎結束前請勿關閉此頁面。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
            參加抽獎
          </h1>
          <p className="text-slate-400">輸入您的資料以參與活動</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-700 space-y-8">

          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 ml-1">您的暱稱</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：幸運兒"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-lg"
              required
              maxLength={15}
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 ml-1">選擇您的頭像</label>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                                aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200
                                ${selectedAvatar === avatar
                      ? 'bg-violet-600 shadow-lg shadow-violet-600/30 scale-110 ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-800'
                      : 'bg-slate-900 border border-slate-700 text-white/50 hover:bg-slate-700 hover:text-white'
                    }
                            `}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={24} />
            立即加入
          </button>
        </form>
      </div>
    </div>
  );
};
