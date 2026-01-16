import React, { useEffect, useState, useRef } from 'react';
import { GameState, User } from '../types';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LuckyWheelProps {
    gameState: GameState;
    onSpinComplete: () => void;
}

const COLORS = [
    '#ec4899', // Pink-500
    '#8b5cf6', // Violet-500
    '#ef4444', // Red-500
    '#f59e0b', // Amber-500
    '#10b981', // Emerald-500
    '#3b82f6', // Blue-500
    '#6366f1', // Indigo-500
    '#d946ef', // Fuchsia-500
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ gameState, onSpinComplete }) => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const users = gameState.users;

    // When status becomes WINNER, we need to spin to the winner
    useEffect(() => {
        if (gameState.status === 'WINNER' && gameState.winner && !isSpinning) {
            const winnerIndex = users.findIndex(u => u.id === gameState.winner?.id);
            if (winnerIndex !== -1) {
                spinToWinner(winnerIndex);
            }
        } else if (gameState.status === 'WAITING') {
            // Reset rotation when game resets
            setRotation(0);
            setIsSpinning(false);
        }
    }, [gameState.status, gameState.winner, users]);

    const spinToWinner = (winnerIndex: number) => {
        setIsSpinning(true);
        const segmentAngle = 360 / users.length;

        // We want the winner segment to align with the pointer at 0 degrees (right side normally, adjusted visuals)
        // The visual pointer is at Top (270deg).
        // Segment i occupies [i*seg, (i+1)*seg]. Center is (i+0.5)*seg.

        // We want target center to land at 270deg (-90deg).
        // rotation + center = 270
        // rotation = 270 - center

        const spinCount = 5; // number of full spins
        const extraSpins = 360 * spinCount;

        // Randomize slightly within the segment to avoid landing on lines
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);

        const winnerCenterAngle = (winnerIndex + 0.5) * segmentAngle;

        let targetRotation = 270 - winnerCenterAngle + randomOffset;

        // Make target always greater than current
        const current = rotation;
        while (targetRotation < current + extraSpins) {
            targetRotation += 360;
        }

        setRotation(targetRotation);

        // Wait for transition to end
        setTimeout(() => {
            setIsSpinning(false);
            onSpinComplete();
        }, 5000); // 5s matches the CSS transition time
    };

    if (users.length === 0) return null;

    const segmentAngle = 360 / users.length;

    return (
        <div className="relative flex flex-col items-center justify-center py-10 w-full h-full min-h-[600px]">

            {/* Pointer */}
            <div className="absolute top-[calc(50%-300px-20px)] sm:top-[calc(50%-250px-20px)] md:top-10 z-20">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[40px] border-t-yellow-400 border-r-[20px] border-r-transparent drop-shadow-md pb-[-10px]"></div>
            </div>

            {/* Wheel Container */}
            <div
                className="w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(139,92,246,0.5)] relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* Background Gradients using Conic Gradient */}
                <div
                    className="absolute inset-0 -z-10 w-full h-full"
                    style={{
                        background: `conic-gradient(from 0deg, ${users.map((_, i) => `${COLORS[i % COLORS.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')})`
                    }}
                />

                {/* Segments Text */}
                {users.map((user, idx) => {
                    const angle = idx * segmentAngle;
                    const centerAngle = angle + segmentAngle / 2;
                    return (
                        <div
                            key={user.id}
                            className="absolute w-full h-full top-0 left-0 flex items-center justify-center origin-center pointer-events-none"
                            style={{
                                transform: `rotate(${centerAngle}deg)`,
                            }}
                        >
                            {/* Text Content - pushed to the edge */}
                            <div
                                className="absolute right-0 flex items-center justify-end pr-8 sm:pr-12 md:pr-16"
                                style={{ width: '50%', transformOrigin: 'left center' }}
                            >
                                <div className="flex flex-col items-center gap-1 text-white font-bold" style={{ transform: `rotate(90deg)` }}>
                                    <span className="text-2xl sm:text-4xl filter drop-shadow-md">{user.avatar}</span>
                                    {users.length < 16 && (
                                        <span className="text-xs sm:text-sm md:text-lg whitespace-nowrap filter drop-shadow-md max-w-[80px] sm:max-w-[120px] truncate">{user.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Center Decoration */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded-full border-4 border-slate-700 shadow-xl flex items-center justify-center z-10">
                        <span className="text-white font-bold text-lg sm:text-xl">GO</span>
                    </div>
                </div>

            </div>

            {/* Winner Display below */}
            {gameState.status === 'WINNER' && !isSpinning && gameState.winner && (
                <div className="absolute bottom-10 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700 pointer-events-none">
                    <div className="flex flex-col items-center gap-4 bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="text-8xl animate-bounce">{gameState.winner.avatar}</div>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 filter drop-shadow-lg">
                            {gameState.winner.name}
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
};
