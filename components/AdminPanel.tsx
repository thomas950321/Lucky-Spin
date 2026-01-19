import React from 'react';
import { GameState } from '../types';
import { Play, RotateCcw, Users, Trophy } from 'lucide-react';

interface AdminPanelProps {
    gameState: GameState;
    onStart: () => void;
    onReset: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ gameState, onStart, onReset }) => {
    return (
        <div className="min-h-screen p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">

                {/* Header Stat */}
                <div className="glass-card p-10 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-violet-500"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-colors"></div>

                    <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="bg-white/5 p-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            <Users className="text-cyan-400" size={48} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-violet-200 text-sm font-bold tracking-[0.2em] uppercase mb-2">Currently Active</h2>
                            <p className="text-7xl font-black text-white tracking-tight glow-text">{gameState.users.length}</p>
                            <span className="text-white/30 text-xs uppercase tracking-widest mt-2 block">Participants</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        onClick={onStart}
                        disabled={gameState.users.length === 0 || gameState.status === 'ROLLING'}
                        className="group relative glass-card p-8 transition-all duration-300 hover:border-green-400/50 hover:bg-green-500/5 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-white/10"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 group-hover:shadow-green-500/40 transition-all duration-300">
                                <Play className="text-white fill-current ml-1" size={40} />
                            </div>
                            <span className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">開始抽獎</span>
                            <span className="text-xs text-white/40 uppercase tracking-widest">Start Game</span>
                        </div>
                    </button>

                    <button
                        onClick={onReset}
                        className="group relative glass-card p-8 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/5 hover:-translate-y-1"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 group-hover:rotate-180 group-hover:shadow-red-500/40 transition-all duration-500">
                                <RotateCcw className="text-white" size={36} />
                            </div>
                            <span className="text-3xl font-bold text-white group-hover:text-red-400 transition-colors">重置遊戲</span>
                            <span className="text-xs text-white/40 uppercase tracking-widest">Reset State</span>
                        </div>
                    </button>
                </div>

                {/* Last Winner Info */}
                {gameState.winner && (
                    <div className="glass-card p-6 border-yellow-500/30 flex items-center gap-6 animate-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl shadow-lg shadow-orange-500/20">
                            <Trophy className="text-white" size={28} />
                        </div>
                        <div>
                            <div className="text-xs text-yellow-200 uppercase tracking-wider font-bold mb-1">Previous Winner</div>
                            <div className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-4xl filter drop-shadow-md flex items-center justify-center">
                                    {gameState.winner.avatar.startsWith('http') ? (
                                        <img src={gameState.winner.avatar} alt="Winner" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-200/50" />
                                    ) : (
                                        gameState.winner.avatar
                                    )}
                                </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-100">{gameState.winner.name}</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
