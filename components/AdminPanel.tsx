import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSocket } from '../services/socket';
import { Play, RotateCcw, Users, Trophy, PlusCircle, Download, Trash2, Archive } from 'lucide-react';
import { AdminLogin } from './AdminLogin';

export const AdminPanel: React.FC = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const { gameState, emitStart, emitReset, joinEventRoom, emitJoin, socket, isAdmin, emitLogin, loginError, emitClearHistory, emitNewRound, emitRemoveBots } = useGameSocket();
    const [eventConfig, setEventConfig] = useState<{ title?: string, background_url?: string } | null>(null);
    const [showAllWinnersAlert, setShowAllWinnersAlert] = useState(false);

    useEffect(() => {
        if (socket) {
            joinEventRoom(eventId || 'default');

            const handleAllWinners = () => {
                setShowAllWinnersAlert(true);
                setTimeout(() => setShowAllWinnersAlert(false), 3000);
            };

            socket.on('NOTIFY_ALL_WINNERS', handleAllWinners);
            return () => {
                socket.off('NOTIFY_ALL_WINNERS', handleAllWinners);
            };
        }
    }, [eventId, socket, joinEventRoom]);

    useEffect(() => {
        if (eventId) {
            fetch(`/api/events/${eventId}`)
                .then(res => res.json())
                .then(data => setEventConfig(data))
                .catch(console.error);
        }
    }, [eventId]);

    if (!isAdmin) {
        return <AdminLogin onLogin={emitLogin} error={loginError} />;
    }

    // Custom Background Style
    const containerStyle = eventConfig?.background_url ? {
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url('${eventConfig.background_url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : {};

    // Mock User Helper
    const onAddMockUser = (count: number) => {
        for (let i = 0; i < count; i++) {
            const randomId = Math.random().toString(36).substring(7);
            const mockUser = {
                lineUserId: `mock_${randomId}`,
                name: `Bot_${Math.floor(Math.random() * 1000)}`,
                // using v9 and robust seed
                avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomId}`
            };
            // socket.emit directly to bypass hook wrapper simplification if needed or update hook
            // Hook's emitJoin uses strict signature. Let's use socket directly for mock or update hook.
            // Keeping it simple with direct socket emit for "mock" which is dev only
            socket?.emit('JOIN', {
                user: mockUser,
                eventId: eventId || 'default'
            });
        }
    };

    const onClearHistory = () => {
        if (confirm("確定要清除中獎紀錄嗎？這不會清除目前的參加者以及與目前的狀態。")) {
            emitClearHistory(eventId || 'default');
        }
    };

    const onNewRound = () => {
        if (confirm("確定要開啟新一輪嗎？\n\n- 目前的參加者會被【保留】。\n- 目前的中獎名單會直接【存檔並顯示於下方】。\n- 大螢幕中央的獲獎畫面會【歸位】。")) {
            emitNewRound(eventId || 'default');
        }
    };



    const exportToCSV = () => {
        const hasHistory = gameState.winnersHistory?.length > 0 || gameState.pastRounds?.length > 0;

        if (!hasHistory) {
            alert("目前沒有中獎名單可匯出");
            return;
        }

        const headers = ["狀態 (Status)", "回合 (Round)", "順序 (Rank)", "名稱 (Name)", "LINE ID / ID", "頭像網址 (Avatar URL)"];

        // Add BOM for Excel UTF-8 compatibility
        let csvContent = "\uFEFF";
        csvContent += headers.join(",") + "\n";

        // Helper to add rows
        const addRoundRows = (status: string, roundNum: any, winners: any[]) => {
            [...winners].reverse().forEach((winner, index) => {
                const row = [
                    status,
                    roundNum,
                    winners.length - index,
                    `"${winner.name.replace(/"/g, '""')}"`, // Escape quotes
                    `"${winner.lineUserId || winner.id}"`,
                    `"${winner.avatar}"`
                ];
                csvContent += row.join(",") + "\n";
            });
        };

        // 1. Past Rounds
        if (gameState.pastRounds && gameState.pastRounds.length > 0) {
            const archivedRoundsCount = gameState.pastRounds.filter(r => r.hidden).length;
            gameState.pastRounds.forEach((round, idx) => {
                const isHidden = round.hidden === true;
                const status = isHidden ? "已存檔 (Archived)" : "進行中 (Active)";

                // For roundNum: use stored roundNumber, or fallback to chronological sequence among its type
                let displayRoundNum = round.roundNumber;
                if (!displayRoundNum) {
                    if (isHidden) {
                        // Finding its index among hidden rounds
                        const currentHiddenIdx = gameState.pastRounds.filter((r, i) => r.hidden && i <= idx).length;
                        displayRoundNum = `Archive ${currentHiddenIdx}`;
                    } else {
                        const currentActiveIdx = gameState.pastRounds.filter((r, i) => !r.hidden && i <= idx).length;
                        displayRoundNum = currentActiveIdx;
                    }
                }

                addRoundRows(status, displayRoundNum, round.winners);
            });
        }

        // 2. Current Live Round
        if (gameState.winnersHistory && gameState.winnersHistory.length > 0) {
            const currentRoundNum = (gameState.pastRounds?.filter(r => !r.hidden).length || 0) + 1;
            addRoundRows("進行中 (Active)", currentRoundNum, gameState.winnersHistory);
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `winner_list_${eventConfig?.title || 'event'}_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-screen w-full relative overflow-hidden" style={containerStyle}>
            {/* Background Image is inherited from body */}

            {/* Winner History Sidebar */}
            {(gameState.winnersHistory?.length > 0 || gameState.pastRounds?.length > 0) && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 max-h-[70vh] glass-card p-4 overflow-hidden flex flex-col z-10 border-white/20 animate-in slide-in-from-left duration-500">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-white uppercase tracking-widest text-xs font-black flex items-center gap-2">
                            <Trophy size={14} className="text-yellow-400" />
                            中獎名單
                        </h3>
                        <div className="flex gap-1">
                            <button
                                onClick={onClearHistory}
                                className="text-white/60 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/10"
                                title="清除紀錄 (Clear History)"
                            >
                                < Trash2 size={14} />
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10 flex items-center gap-1"
                                title="匯出 Excel (CSV)"
                            >
                                <Download size={14} />
                                <span className="text-[10px] whitespace-nowrap">下載中獎名單</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar flex-1 space-y-6 pr-1">

                        {/* 1. Current Active Round (TOP) */}
                        <div className="space-y-3">
                            <div className="text-[10px] text-yellow-400 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                <div className="h-[1px] flex-1 bg-yellow-400/30"></div>
                                ROUND #{(gameState.pastRounds?.filter(r => !r.hidden).length || 0) + 1}
                                <div className="h-[1px] flex-1 bg-yellow-400/30"></div>
                            </div>
                            {gameState.winnersHistory?.length > 0 ? (
                                <div className="space-y-1.5">
                                    {[...gameState.winnersHistory].reverse().map((winner, index) => (
                                        <div key={`current-${index}`} className="bg-yellow-500/20 p-2 rounded-lg flex items-center gap-3 border border-yellow-400/40 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                            <div className="w-6 h-6 rounded-full bg-yellow-900 flex items-center justify-center overflow-hidden border border-yellow-400/50 shrink-0">
                                                {winner.avatar.startsWith('http') ? (
                                                    <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px]">{winner.avatar}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-yellow-200 font-black text-xs truncate">{winner.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center border border-dashed border-white/20 rounded-lg bg-white/5">
                                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">等待抽獎...</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Past Rounds (Active Game) */}
                        {[...(gameState.pastRounds || [])].filter(r => r.hidden !== true).reverse().map((round, visibleIndex) => (
                            <div key={round.id} className="space-y-4">
                                <div className="text-xs text-white uppercase tracking-[0.3em] font-black flex items-center gap-2">
                                    <div className="h-[1px] flex-1 bg-white/40"></div>
                                    ROUND #{round.roundNumber || (gameState.pastRounds!.filter(r => r.hidden !== true).length - visibleIndex)}
                                    <div className="h-[1px] flex-1 bg-white/40"></div>
                                </div>
                                <div className="space-y-3">
                                    {[...round.winners].reverse().map((winner, index) => (
                                        <div key={`${round.id}-${index}`} className="bg-white/30 backdrop-blur-md p-3 rounded-xl flex items-center gap-4 border border-white/40 hover:bg-white/40 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/30 shrink-0">
                                                {winner.avatar.startsWith('http') ? (
                                                    <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px]">{winner.avatar}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-white font-bold text-xs truncate">{winner.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* 3. Archived History (After Reset) */}
                        {gameState.pastRounds?.some(r => r.hidden === true) && (
                            <div className="pt-4 border-t border-white/10 space-y-6">
                                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black text-center mt-2">
                                    ─── 歷史存檔 (Archived) ───
                                </div>
                                {[...(gameState.pastRounds || [])].filter(r => r.hidden === true).reverse().map((round, archivedIndex) => (
                                    <div key={`archived-${round.id}`} className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="text-[10px] text-white/60 font-bold flex items-center gap-2">
                                            <div className="h-[1px] w-2 bg-white/20"></div>
                                            PAST ROUND #{round.roundNumber || (gameState.pastRounds.filter(r => r.hidden).length - archivedIndex)} ({new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                        </div>
                                        <div className="pl-4 space-y-2 border-l border-white/10">
                                            {[...round.winners].reverse().map((winner, index) => (
                                                <div key={`archived-winner-${index}`} className="bg-slate-900/40 p-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                                        {winner.avatar.startsWith('http') ? (
                                                            <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover opacity-50" />
                                                        ) : (
                                                            <span className="text-[8px] opacity-50">{winner.avatar}</span>
                                                        )}
                                                    </div>
                                                    <div className="text-white/60 font-bold text-[10px] truncate">{winner.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="h-full w-full overflow-y-auto py-12 px-4 pb-24">
                <div className="max-w-2xl w-full mx-auto space-y-8">

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                {eventConfig?.title ? `${eventConfig.title} (Admin)` : '管理後台'}
                            </h1>
                            <div className="text-yellow-400/80 text-[10px] font-black tracking-[0.2em] uppercase">
                                ROUND #{(gameState.pastRounds?.filter(r => !r.hidden).length || 0) + 1}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!eventId && (
                                <button
                                    onClick={() => navigate('/admin/events')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
                                >
                                    <PlusCircle size={18} />
                                    建立新活動
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header Stat */}
                    <div className="glass-card p-10 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-violet-500"></div>
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-colors"></div>

                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div className="bg-white/5 p-4 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                <Users className="text-cyan-400" size={48} />
                            </div>
                            <div className="text-center">
                                <h2 className="text-violet-200 text-sm font-bold tracking-[0.2em] uppercase mb-2">目前參與人數</h2>
                                <p className="text-7xl font-black text-white tracking-tight glow-text">{gameState.users.length}</p>
                                <span className="text-white/30 text-xs uppercase tracking-widest mt-2 block">人</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <button
                            onClick={() => {
                                // 1. Collect all past winners
                                const pastWinnerIds = new Set();
                                gameState.winnersHistory?.forEach(w => pastWinnerIds.add(w.lineUserId));
                                gameState.pastRounds?.forEach(round => {
                                    round.winners?.forEach(w => pastWinnerIds.add(w.lineUserId));
                                });

                                // 2. Filter eligible
                                const eligibleCount = gameState.users.filter(u => !pastWinnerIds.has(u.lineUserId)).length;

                                if (gameState.users.length === 0) {
                                    alert("目前沒有參加者加入！");
                                } else if (eligibleCount === 0) {
                                    alert("所有人均已中獎");
                                } else {
                                    emitStart(eventId || 'default');
                                }
                            }}
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
                            onClick={onNewRound}
                            className="group relative glass-card p-8 transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-500/5 hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-blue-500/40 transition-all duration-300">
                                    <Archive className="text-white" size={36} />
                                </div>
                                <span className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">開啟新一輪抽獎</span>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (confirm("確定要【重置遊戲】嗎？\n\n提醒：\n-重置後，所有參加者將歸零，需重新加入。\n-重置後，中獎名單會被清空，請確認已下載中獎名單。\n若還未下載，請按【取消】回後臺下載中獎名單")) {
                                    emitReset(eventId || 'default');
                                }
                            }}
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
                    <div className="glass-card p-6 border-dashed border-slate-700">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">測試機器人</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onAddMockUser(1)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-medium transition-colors border border-white/5"
                            >
                                + 加入 1 個機器人
                            </button>
                            <button
                                onClick={() => onAddMockUser(5)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 font-medium transition-colors border border-white/5"
                            >
                                + 加入 5 個機器人
                            </button>
                            <button
                                onClick={() => emitRemoveBots(eventId || 'default')}
                                className="px-4 py-2 bg-red-900/30 hover:bg-red-800/50 rounded-lg text-sm text-red-300 font-medium transition-colors border border-red-500/10 ml-auto"
                            >
                                移除所有機器人
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* All Winners Alert Overlay */}
            {showAllWinnersAlert && (
                <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card p-12 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-in zoom-in-95 duration-300 flex flex-col items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-widest drop-shadow-lg text-center">
                            所有人均已中獎
                        </h2>
                        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
