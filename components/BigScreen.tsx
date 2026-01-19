import React, { useEffect } from 'react';
import { GameState } from '../types';
import { Trophy, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LuckyWheel } from './LuckyWheel';

interface BigScreenProps {
  gameState: GameState;
  onStart: () => void;
}

export const BigScreen: React.FC<BigScreenProps> = ({ gameState, onStart }) => {

  const [showParticipants, setShowParticipants] = React.useState(false);



  const handleSpinComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Header Removed for Immersive Experience */}

      {/* Winner History Sidebar */}
      {gameState.winnersHistory && gameState.winnersHistory.length > 0 && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 max-h-[70vh] glass-card p-4 overflow-hidden flex flex-col z-10 border-yellow-500/20 animate-in slide-in-from-left duration-500">
          <h3 className="text-yellow-500 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2 pb-2 border-b border-white/5">
            <Trophy size={14} />
            Hall of Fame
          </h3>
          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-1">
            {[...gameState.winnersHistory].reverse().map((winner, index) => (
              <div key={index} className="bg-slate-900/60 p-3 rounded-lg flex items-center gap-3 border border-white/5 group hover:border-yellow-500/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-yellow-500/20 shadow-lg">
                  {winner.avatar.startsWith('http') ? (
                    <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{winner.avatar}</span>
                  )}
                </div>
                <div>
                  <div className="text-yellow-100 font-bold text-sm truncate max-w-[120px]">{winner.name}</div>
                  <div className="text-yellow-500/50 text-[10px] uppercase tracking-wider">Pass {gameState.winnersHistory.length - index}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Participant Badge */}
      <button
        onClick={() => setShowParticipants(true)}
        className="absolute top-6 right-6 z-40 group"
      >
        <div className="bg-slate-900/80 backdrop-blur-md border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-all flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Users size={18} className="text-yellow-500" />
          </div>
          <span className="font-mono text-xl font-bold text-white tracking-widest">{gameState.users.length}</span>
        </div>
      </button>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowParticipants(false)}>
          <div className="bg-slate-900/95 border border-yellow-500/20 rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900/95 z-10 py-2 border-b border-white/5">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-500 flex items-center gap-3">
                <Users className="text-yellow-500" />
                Participants ({gameState.users.length})
              </h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {gameState.users.map((user) => (
                <div key={user.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors group">
                  <div className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform">{user.avatar}</div>
                  <div className="font-medium text-slate-200 truncate">{user.name}</div>
                </div>
              ))}
              {gameState.users.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-500 italic">
                  No participants yet...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative">
        {gameState.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-4 animate-pulse">
            <Users size={64} className="opacity-20" />
            <p className="text-2xl font-light">等待參與者加入...</p>
            <p className="text-sm font-light opacity-50 bg-slate-800 px-4 py-2 rounded-full">
              {window.location.host}/#/join
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center scale-90 sm:scale-100">
            <LuckyWheel
              gameState={gameState}
              onSpinComplete={handleSpinComplete}
              onSpin={onStart}
            />
          </div>
        )}
      </main>
    </div>
  );
};