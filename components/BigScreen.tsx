import React, { useEffect } from 'react';
import { GameState } from '../types';
import { Trophy, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LuckyWheel } from './LuckyWheel';

interface BigScreenProps {
  gameState: GameState;
}

export const BigScreen: React.FC<BigScreenProps> = ({ gameState }) => {

  const handleSpinComplete = () => {
    // Fire confetti when spin stops
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#ec4899']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 p-6 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-500 to-violet-600 p-2 rounded-lg">
            <Trophy className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400">
            RaffleRoyale
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-full border border-slate-700 shadow-lg hidden sm:flex">
          <span className="text-slate-400 text-lg">Join at:</span>
          <span className="text-xl font-mono text-pink-400 font-bold tracking-wider">
            {window.location.origin}/#/join
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={20} />
          <span className="font-mono text-xl">{gameState.users.length}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative">
        {gameState.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-4 animate-pulse">
            <Users size={64} className="opacity-20" />
            <p className="text-2xl font-light">Waiting for participants...</p>
            <p className="text-sm font-light opacity-50 bg-slate-800 px-4 py-2 rounded-full">
              {window.location.origin}/#/join
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center scale-90 sm:scale-100">
            <LuckyWheel
              gameState={gameState}
              onSpinComplete={handleSpinComplete}
            />
          </div>
        )}
      </main>
    </div>
  );
};