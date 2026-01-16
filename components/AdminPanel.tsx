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
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">

                {/* Header Stat */}
                <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
                    <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="bg-slate-800 p-4 rounded-full">
                            <Users className="text-blue-400" size={40} />
                        </div>
                        <div>
                            <h2 className="text-slate-400 text-sm font-semibold tracking-wider uppercase">目前參與人數</h2>
                            <p className="text-6xl font-black text-white mt-2">{gameState.users.length}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        onClick={onStart}
                        disabled={gameState.users.length === 0 || gameState.status === 'ROLLING'}
                        className="group relative bg-slate-900 hover:bg-slate-800 border-2 border-green-500/30 hover:border-green-500 p-8 rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-green-500/30"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="text-green-500 fill-current ml-1" size={32} />
                            </div>
                            <span className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">開始抽獎</span>
                        </div>
                    </button>

                    <button
                        onClick={onReset}
                        className="group relative bg-slate-900 hover:bg-slate-800 border-2 border-red-500/30 hover:border-red-500 p-8 rounded-3xl transition-all duration-300"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:-rotate-90">
                                <RotateCcw className="text-red-500" size={32} />
                            </div>
                            <span className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">重置遊戲</span>
                        </div>
                    </button>
                </div>

                {/* Last Winner Info */}
                {gameState.winner && (
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex items-center gap-6 animate-in slide-in-from-bottom-4">
                        <div className="bg-yellow-500/10 p-3 rounded-xl">
                            <Trophy className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">上一位得獎者</div>
                            <div className="text-xl font-bold text-white flex items-center gap-2">
                                <span>{gameState.winner.avatar}</span>
                                <span>{gameState.winner.name}</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
