import React, { useEffect, useState, useRef } from 'react';
import { GameState, User } from '../types';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyWheelProps {
    gameState: GameState;
    onSpinComplete: () => void;
    onSpin: () => void;
}

// Casino High-End Colors
const SEGMENT_COLORS = [
    '#9b1c31', // Ruby Red
    '#0f52ba', // Sapphire Blue
    '#004d25', // Emerald Green 
    '#4a0404', // Deep Garnet
    '#1a1a7a', // Deep Indigo
    '#004d25', // Forest Green
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ gameState, onSpinComplete, onSpin }) => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const users = gameState.users;

    // Sound Effects
    // Using local files in public/ folder to avoid CDN 403 Forbidden issues
    const spinAudio = useRef(new Audio('/spin.mp3'));
    const winAudio = useRef(new Audio('/win.mp3'));

    const enableAudio = () => {
        // Unlock AudioContext by playing a silent snippet
        spinAudio.current.play().then(() => {
            spinAudio.current.pause();
            spinAudio.current.currentTime = 0;
            // setHasInteracted(true); // No longer needed
        }).catch(e => console.error("Audio unlock failed: User interaction required to play audio.", e));
    };

    const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        spinAudio.current.loop = true;
        spinAudio.current.volume = 1.0; // Max volume for clearer ticking
        winAudio.current.volume = 0.6;

        // Auto-unlock on ANY click (e.g. Login button, background click)
        const unlockHandler = () => {
            enableAudio();
            window.removeEventListener('click', unlockHandler);
            window.removeEventListener('touchstart', unlockHandler);
        };

        window.addEventListener('click', unlockHandler);
        window.addEventListener('touchstart', unlockHandler);

        // Cleanup on unmount (FIX for Strict Mode double-spin/audio)
        return () => {
            window.removeEventListener('click', unlockHandler);
            window.removeEventListener('touchstart', unlockHandler);

            if (spinTimeoutRef.current) {
                clearTimeout(spinTimeoutRef.current);
            }
            spinAudio.current.pause();
            spinAudio.current.currentTime = 0;
            winAudio.current.pause();
            winAudio.current.currentTime = 0;
        };
    }, []);

    const spinningRef = useRef(false);
    const lastWinnerIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Trigger spin ONLY when status is ROLLING (Start of draw)
        if (gameState.status === 'ROLLING' && gameState.winner) {

            // Deduplication Check
            if (spinningRef.current) return;
            if (lastWinnerIdRef.current === (gameState.winner.lineUserId || gameState.winner.id)) return;

            const winnerIndex = users.findIndex(u => {
                if (u.lineUserId && gameState.winner?.lineUserId) {
                    return u.lineUserId === gameState.winner.lineUserId;
                }
                return u.id === gameState.winner?.id;
            });

            if (winnerIndex !== -1) {
                lastWinnerIdRef.current = gameState.winner.lineUserId || gameState.winner.id;
                spinToWinner(winnerIndex);
            } else {
                console.error('[LuckyWheel] Winner not found in users array!');
            }
        } else if (gameState.status === 'WAITING') {
            setRotation(0);
            setIsSpinning(false);
            spinningRef.current = false;
            lastWinnerIdRef.current = null;
        }
    }, [gameState.status, gameState.winner, users]);

    const spinToWinner = (winnerIndex: number) => {
        setIsSpinning(true);
        spinningRef.current = true;

        const segmentAngle = 360 / users.length;
        const spinCount = 8; // More spins for dramatic effect
        const extraSpins = 360 * spinCount;
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.6); // Tighter landing
        const winnerCenterAngle = (winnerIndex + 0.5) * segmentAngle;



        // Base alignment: To land at 0deg (Top), we rotate by -winnerAngle
        // Using 360 as base to keep numbers positive before loop
        let targetRotation = 360 - winnerCenterAngle + randomOffset;
        const current = rotation;
        while (targetRotation < current + extraSpins) {
            targetRotation += 360;
        }


        setRotation(targetRotation);

        // Play Spin Sound
        spinAudio.current.currentTime = 0;
        spinAudio.current.play().catch(e => console.warn("Audio play failed (user interaction needed first):", e));

        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            spinningRef.current = false;
            onSpinComplete();

            // Stop Spin Sound
            spinAudio.current.pause();

            // Play Win Sound
            winAudio.current.currentTime = 0;
            winAudio.current.play().catch(e => console.warn("Win Audio failed:", e));
        }, 8000); // 8s spin for suspense
    };

    const segmentAngle = 360 / Math.max(users.length, 1);

    const wheelBackground = React.useMemo(() => {
        return `conic-gradient(from 0deg, ${users.map((_, i) => {
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            return `${color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`;
        }).join(', ')})`;
    }, [users.length, segmentAngle]);

    const dividers = React.useMemo(() => {
        return users.map((_, i) => (
            <div
                key={`div-${i}`}
                className="absolute top-0 left-1/2 w-1 h-1/2 bg-gradient-to-b from-[#fcf6ba] via-[#bf953f] to-transparent origin-bottom -ml-0.5"
                style={{ transform: `rotate(${i * segmentAngle}deg)` }}
            />
        ));
    }, [users.length, segmentAngle]);

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[700px]">

            {/* Ambient Casino Lighting */}
            <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none animate-pulse-slow"></div>

            {/* Pointer - Diamond Arrow */}
            <div className="absolute top-[calc(50%-330px)] sm:top-[calc(50%-280px)] z-30 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-20 bg-gradient-to-b from-slate-200 to-slate-400 rotate-180 [clip-path:polygon(50%_0%,_0%_100%,_100%_100%)] flex items-center justify-center shadow-inner relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-50"></div>
                    <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] border-2 border-white animate-pulse"></div>
                </div>
            </div>

            {/* Main Wheel Structure */}
            <div className="relative p-4 rounded-full bg-gradient-to-br from-[#4a3b18] via-[#856b28] to-[#4a3b18] shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)]">

                {/* Chasing Lights Ring */}
                <div className="absolute inset-3 border-4 border-dotted border-yellow-200/50 rounded-full animate-[spin_20s_linear_infinite] opacity-50"></div>

                {/* Diamond Studs Ring */}
                {Array.from({ length: 24 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-4 h-4 bg-white rounded-full diamond-stud z-20"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * (360 / 24)}deg) translate(0, -320px)`, // Radius adjustment
                            animation: `running-light 3s linear infinite`,
                            animationDelay: `${(i * 0.125) - 3.0}s`
                        }}
                    ></div>
                ))}

                {/* The Rotating Wheel */}
                <div
                    className={`w-[85vw] h-[85vw] max-w-[600px] max-h-[600px] rounded-full border-[12px] border-[#bf953f] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden ${isSpinning ? 'transition-transform duration-[8000ms] cubic-bezier(0.12, 0, 0.05, 1)' : ''}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Metallic Segments */}
                    <div
                        className="absolute inset-0 -z-10 w-full h-full"
                        style={{
                            background: wheelBackground
                        }}
                    >
                        {/* Overlay Gradient for metallic sheen */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]"></div>
                    </div>

                    {/* Gold Dividers */}
                    {dividers}

                    {/* Content (Avatars & Names) */}
                    {users.map((user, idx) => {
                        const angle = idx * segmentAngle;
                        const centerAngle = angle + segmentAngle / 2;
                        return (
                            <div
                                key={user.id}
                                className="absolute w-full h-full top-0 left-0 flex items-center justify-center origin-center pointer-events-none"
                                style={{ transform: `rotate(${centerAngle}deg)` }}
                            >
                                <div
                                    className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start pt-10 sm:pt-14 md:pt-16 pb-4"
                                    style={{ height: '50%', transformOrigin: 'bottom center' }}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {/* Gold Framed Avatar */}
                                        <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#bf953f] to-[#fcf6ba] shadow-lg">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/20 flex items-center justify-center text-3xl sm:text-4xl backdrop-blur-sm overflow-hidden">
                                                {user.avatar.startsWith('http') ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-xl">{user.avatar}</span>
                                                )}
                                                {/* Fallback for broken images */}
                                                <div className="avatar-fallback hidden w-full h-full flex items-center justify-center bg-slate-800 text-white font-bold text-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        {users.length < 16 && (
                                            <span className="font-serif text-gold font-bold text-sm sm:text-lg tracking-wider bg-black/40 px-3 py-1 rounded-full border border-[#bf953f]/30 max-w-[100px] truncate shadow-sm">
                                                {user.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Central Jeweled Button */}
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 z-50"
                    onClick={!isSpinning ? onSpin : undefined}
                >
                    <div className="relative group">
                        {/* Outer gold ring */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#bf953f] to-[#aa771c] shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                            {/* Inner Ruby Gem */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#ff0044] via-[#990033] to-[#550011] shadow-[inset_0_5px_10px_rgba(255,255,255,0.4),inset_0_-5px_10px_rgba(0,0,0,0.6)] flex items-center justify-center relative overflow-hidden">
                                {/* Gem Shine reflection */}
                                <div className="absolute top-2 right-4 w-6 h-4 bg-white/40 blur-sm rounded-full rotate-45"></div>

                                <span className="text-[#fcf6ba] font-serif font-black text-xl sm:text-2xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10 animate-pulse">
                                    SPIN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Winner Badge - Casino Chip Style */}
            {
                gameState.status === 'WINNER' && !isSpinning && gameState.winner && (
                    <div className="absolute bottom-4 sm:bottom-10 z-50 animate-in zoom-in slide-in-from-bottom duration-700 pointer-events-none">
                        <div className="relative">
                            {/* Spinning rays background */}
                            <div className="absolute inset-0 bg-yellow-500/30 blur-2xl animate-[spin_4s_linear_infinite]"></div>

                            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-black p-1 rounded-full border-4 border-[#bf953f] shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                                <div className="bg-[radial-gradient(circle,transparent_20%,#000_120%)] p-8 sm:p-12 rounded-full flex flex-col items-center gap-2 border border-[#fcf6ba]/20">
                                    <span className="text-[#bf953f] uppercase tracking-[0.3em] text-xs font-bold">Jackpot Winner</span>
                                    <div className="text-8xl animate-[bounce_1s_infinite] filter drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] flex justify-center w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-4 border-[#bf953f] relative">
                                        {gameState.winner.avatar.startsWith('http') ? (
                                            <>
                                                <img
                                                    src={gameState.winner.avatar}
                                                    className="w-full h-full object-cover"
                                                    alt={gameState.winner.name}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement?.querySelector('.winner-fallback')?.classList.remove('hidden');
                                                    }}
                                                />
                                                <div className="winner-fallback hidden absolute inset-0 flex items-center justify-center bg-slate-800 text-[#bf953f] font-bold text-5xl">
                                                    {gameState.winner.name.charAt(0).toUpperCase()}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-[#bf953f] font-bold text-5xl">
                                                {gameState.winner.avatar}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fcf6ba] to-[#bf953f] filter drop-shadow-lg font-serif mt-2">
                                        {gameState.winner.name}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};
