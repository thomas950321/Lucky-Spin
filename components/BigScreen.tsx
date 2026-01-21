import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameSocket } from '../services/socket';
import { Trophy, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LuckyWheel } from './LuckyWheel';

export const BigScreen: React.FC = () => {
  const { id: eventId } = useParams();
  const { gameState, emitStart, joinEventRoom, socket } = useGameSocket();
  const [showParticipants, setShowParticipants] = useState(false);
  const [eventConfig, setEventConfig] = useState<{ title?: string, background_url?: string } | null>(null);

  useEffect(() => {
    // Join the specific event room
    if (gameState.users.length === 0 && joinEventRoom) {
      // This check is a bit redundant if we trust socket logic, but focusing on socket dependency
    }
  }, []);

  // Separate effect for joining
  useEffect(() => {
    if (socket) {
      joinEventRoom(eventId || 'default');
    }

    // Fetch Event Config if ID exists
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => setEventConfig(data))
        .catch(err => console.error("Failed to load event config", err));
    }
  }, [eventId, socket, joinEventRoom]);

  const handleSpinComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Custom Background Style
  const containerStyle = eventConfig?.background_url ? {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('${eventConfig.background_url}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={containerStyle}>
      {/* Event Title Overlay */}
      {eventConfig?.title && (
        <div className="absolute top-6 left-6 z-30">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-md font-serif tracking-wider">
            {eventConfig.title}
          </h1>
        </div>
      )}

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
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-yellow-500/20 shadow-lg relative">
                  {winner.avatar.startsWith('http') ? (
                    <>
                      <img
                        src={winner.avatar}
                        alt={winner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.querySelector('.sidebar-fallback')?.classList.remove('hidden');
                        }}
                      />
                      <div className="sidebar-fallback hidden w-full h-full flex items-center justify-center bg-violet-600 text-white font-bold text-xs">
                        {winner.name.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <span className="text-lg">{winner.avatar}</span>
                  )}
                </div>
                <div>
                  <div className="text-yellow-100 font-bold text-sm truncate max-w-[120px]">{winner.name}</div>
                  <div className="text-yellow-500/50 text-[10px] uppercase tracking-wider">第 {gameState.winnersHistory.length - index} 位</div>
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
                  <div className="text-2xl filter drop-shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center relative w-10 h-10 rounded-full overflow-hidden bg-slate-700">
                    {user.avatar.startsWith('http') ? (
                      <>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.modal-fallback')?.classList.remove('hidden');
                          }}
                        />
                        <div className="modal-fallback hidden w-full h-full flex items-center justify-center bg-violet-600 text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      user.avatar
                    )}
                  </div>
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
              {window.location.host}/#/{eventId ? `event/${eventId}/join` : 'join'}
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center scale-90 sm:scale-100">
            <LuckyWheel
              gameState={gameState}
              onSpinComplete={handleSpinComplete}
              onSpin={() => emitStart(eventId || 'default')}
            />
          </div>
        )}
      </main>
    </div>
  );
};