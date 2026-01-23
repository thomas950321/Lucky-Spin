import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Image as ImageIcon, Link as LinkIcon, Copy, ArrowLeft, Settings, Check, Trash2, ExternalLink } from 'lucide-react';
import { useGameSocket } from '../services/socket';
import { AdminLogin } from './AdminLogin';

export const EventCreator: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, emitLogin, loginError, socket } = useGameSocket();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [bgUrl, setBgUrl] = useState('');
    const [createdEvent, setCreatedEvent] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // Track which button shows "Copied!" state
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [eventsList, setEventsList] = useState<any[]>([]);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const data = await res.json();
                setEventsList(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    React.useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`確定要刪除活動 "${title}" 嗎？\n此動作無法復原！`)) return;

        const check = prompt('請輸入 "DELETE" 確認刪除：');
        if (check !== 'DELETE') return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('刪除成功');
                fetchEvents(); // Refresh list
            } else {
                alert('刪除失敗');
            }
        } catch (e) {
            alert('發生錯誤');
        }
    };

    if (!isAdmin) {
        return <AdminLogin onLogin={emitLogin} error={loginError} />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, background_url: bgUrl, slug: slug || undefined })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create event');

            setCreatedEvent(data);
            fetchEvents(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const eventIdentifier = createdEvent ? (createdEvent.slug || createdEvent.id) : '';
    const eventLink = createdEvent ? `${window.location.origin}/#/event/${eventIdentifier}` : '';
    const joinLink = createdEvent ? `${window.location.origin}/#/event/${eventIdentifier}/join` : '';
    const adminLink = createdEvent ? `${window.location.origin}/#/admin/event/${eventIdentifier}` : '';

    const copyToClipboard = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates(prev => ({ ...prev, [key]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [key]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers or if permission denied
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedStates(prev => ({ ...prev, [key]: true }));
                setTimeout(() => {
                    setCopiedStates(prev => ({ ...prev, [key]: false }));
                }, 2000);
            } catch (err2) {
                console.error('Fallback copy failed', err2);
                alert('複製失敗，請手動複製連結');
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    返回管理後台
                </button>
            </div>

            <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-6 flex items-center gap-2">
                    <Calendar className="text-purple-400" />
                    建立新活動
                </h2>

                {!createdEvent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold">活動標題 (Event Title)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="例如：2026 年度尾牙抽獎"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-slate-600 focus:border-purple-500/50 outline-none transition-all"
                                    required
                                />
                                <Calendar className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold">自訂活動網址 ID (Custom URL ID)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder="例如：my-year-end-party"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-slate-600 focus:border-purple-500/50 outline-none transition-all"
                                    pattern="[a-zA-Z0-9-]+"
                                    title="只允許英文、數字和連字號"
                                />
                                <LinkIcon className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            </div>
                            <p className="text-xs text-slate-500">選填。若留空將自動生成亂數代碼。</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold">背景圖片連結 (Background URL)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    value={bgUrl}
                                    onChange={e => setBgUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder:text-slate-600 focus:border-purple-500/50 outline-none transition-all"
                                />
                                <ImageLinkIcon className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            </div>
                            <p className="text-xs text-slate-500">選填。若留空將使用預設賭場風格背景。</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            {loading ? '建立中...' : '建立活動'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-100">建立成功！</h3>
                                <p className="text-xs text-green-200/60">{createdEvent.title}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                                    <LinkIcon size={12} /> 大螢幕連結 (Big Screen)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={eventLink}
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(eventLink, 'event')}
                                        className={`p-2 rounded-lg text-slate-300 transition-all duration-300 ${copiedStates['event'] ? 'bg-green-500 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {copiedStates['event'] ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                                    <LinkIcon size={12} /> 手機加入連結 (Mobile Join)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={joinLink}
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(joinLink, 'join')}
                                        className={`p-2 rounded-lg text-slate-300 transition-all duration-300 ${copiedStates['join'] ? 'bg-green-500 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {copiedStates['join'] ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold flex items-center gap-2">
                                    <Settings size={12} /> 後臺管理連結 (Admin Panel)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={adminLink}
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(adminLink, 'admin')}
                                        className={`p-2 rounded-lg text-slate-300 transition-all duration-300 ${copiedStates['admin'] ? 'bg-green-500 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {copiedStates['admin'] ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setCreatedEvent(null);
                                setTitle('');
                                setSlug('');
                                setBgUrl('');
                            }}
                            className="w-full py-3 border border-white/10 rounded-xl font-bold text-slate-300 hover:bg-white/5 transition-colors"
                        >
                            建立另一個活動
                        </button>
                    </div>
                )}
            </div>

            {/* Event List Section */}
            <div className="absolute top-24 right-6 w-80 hidden xl:block">
                <div className="glass-card p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-purple-400" />
                        已建立的活動
                    </h3>
                    <div className="space-y-3">
                        {eventsList.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">尚無活動</p>
                        ) : (
                            eventsList.map(event => (
                                <div key={event.id} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-white text-sm truncate max-w-[150px]" title={event.title}>{event.title}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{event.slug || 'Default UUID'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(event.id, event.title)}
                                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                            title="刪除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.open(`/#/admin/event/${event.slug || event.id}`, '_blank')}
                                            className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Settings size={12} />
                                            管理
                                        </button>
                                        <button
                                            onClick={() => window.open(`/#/event/${event.slug || event.id}`, '_blank')}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <ExternalLink size={12} />
                                            開啟
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet List (Below Form) */}
            <div className="mt-8 xl:hidden max-w-md w-full">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">已建立的活動</h3>
                    <div className="space-y-3">
                        {eventsList.map(event => (
                            <div key={event.id} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-sm truncate" title={event.title}>{event.title}</h4>
                                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex gap-2">
                                        <span>{event.slug || 'UUID'}</span>
                                        <a href={`/#/admin/event/${event.slug || event.id}`} className="text-purple-400 hover:underline">管理</a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(event.id, event.title)}
                                    className="text-slate-600 hover:text-red-400 transition-colors p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImageLinkIcon = ({ className, size }: any) => (
    <ImageIcon className={className} size={size} />
);
