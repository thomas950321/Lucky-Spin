
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (password: string) => void;
    error?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(password);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-500/20 rounded-full">
                        <Lock className="w-8 h-8 text-purple-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-6">管理員登入</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="請輸入密碼..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">
                            密碼錯誤
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        登入
                    </button>
                </form>
            </div>
        </div>
    );
};
