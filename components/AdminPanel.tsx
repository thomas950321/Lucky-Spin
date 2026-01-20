import React from 'react';
import { GameState } from '../types';
import { Play, RotateCcw, Users, Trophy } from 'lucide-react';

interface AdminPanelProps {
    gameState: GameState;
    onStart: () => void;
    onReset: () => void;
    onAddMockUser?: (count: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ gameState, onStart, onReset, onAddMockUser }) => {
    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Background Image (Optional, inherited from body but explicit here for safety if needed) */}

            {/* Winner History Sidebar (Copied from BigScreen) */}
            {gameState.winnersHistory && gameState.winnersHistory.length > 0 && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 max-h-[70vh] glass-card p-4 overflow-hidden flex flex-col z-10 border-purple-500/20 animate-in slide-in-from-left duration-500">
                    <h3 className="text-purple-300 uppercase tracking-widest text-xs font-bold mb-4 flex items-center gap-2 pb-2 border-b border-white/5">
                        <Trophy size={14} />
                        名人堂
                    </h3>
                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-1">
                        {[...gameState.winnersHistory].reverse().map((winner, index) => (
                            <div key={index} className="bg-slate-900/60 p-3 rounded-lg flex items-center gap-3 border border-white/5 group hover:border-purple-500/30 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-purple-500/20 shadow-lg">
                                    {winner.avatar.startsWith('http') ? (
                                        <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg">{winner.avatar}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="text-purple-100 font-bold text-sm truncate max-w-[120px]">{winner.name}</div>
                                    <div className="text-purple-500/50 text-[10px] uppercase tracking-wider">
                                        第 {gameState.winnersHistory.length - index} 屆
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="h-full w-full overflow-y-auto py-12 px-4 pb-24">
                <div className="max-w-2xl w-full mx-auto space-y-8">

                    {/* Header Stat */}
                    <div className="glass-card p-10 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-violet-500"></div>
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-colors"></div>

                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div className="bg-white/5 p-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                <Users className="text-cyan-400" size={48} />
                            </div>
                            <div className="text-center">
                                <h2 className="text-violet-200 text-sm font-bold tracking-[0.2em] uppercase mb-2">目前活躍人數</h2>
                                <p className="text-7xl font-black text-white tracking-tight glow-text">{gameState.users.length}</p>
                                <span className="text-white/30 text-xs uppercase tracking-widest mt-2 block">人</span>
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
                            </div>
                        </button>
                    </div>

                    {/* Debug Tools */}
                    {onAddMockUser && (
                        <div className="glass-card p-6 border-dashed border-slate-700">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Debug Tools</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => onAddMockUser(1)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-medium transition-colors border border-white/5"
                                >
                                    + Add 1 Bot
                                </button>
                                <button
                                    onClick={() => onAddMockUser(5)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-medium transition-colors border border-white/5"
                                >
                                    + Add 5 Bots
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Last Winner Info */}
                    {gameState.winner && (
                        <div className="glass-card p-6 border-yellow-500/30 flex items-center gap-6 animate-in slide-in-from-bottom-4 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl shadow-lg shadow-orange-500/20">
                                <Trophy className="text-white" size={28} />
                            </div>
                            <div>
                                <div className="text-xs text-yellow-200 uppercase tracking-wider font-bold mb-1">前屆冠軍</div>
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
        </div>
    );
};
