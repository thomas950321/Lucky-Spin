import { useEffect, useState, useCallback } from 'react';
import { User, GameState, EventType } from '../types';

const CHANNEL_NAME = 'raffle_royale_channel';

// Simulate a backend server by using BroadcastChannel to sync state across tabs
export const useGameSocket = () => {
  const [gameState, setGameState] = useState<GameState>({
    users: [],
    status: 'WAITING',
    winner: null,
  });

  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  // Initialize Channel
  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    setChannel(bc);

    bc.onmessage = (event) => {
      const data = event.data as EventType;
      handleEvent(data);
    };

    // Ask other tabs for current state on load
    bc.postMessage({ type: 'SYNC_REQUEST', payload: null });

    return () => {
      bc.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEvent = useCallback((event: EventType) => {
    switch (event.type) {
      case 'JOIN':
        setGameState((prev) => {
            if (prev.users.find(u => u.id === event.payload.id)) return prev;
            return { ...prev, users: [...prev.users, event.payload] };
        });
        break;
      case 'RESET':
        setGameState({ users: [], status: 'WAITING', winner: null });
        break;
      case 'START_DRAW':
        setGameState((prev) => ({ ...prev, status: 'ROLLING', winner: null }));
        break;
      case 'SHOW_WINNER':
        setGameState((prev) => ({ ...prev, status: 'WINNER', winner: event.payload }));
        break;
      case 'SYNC_REQUEST':
        // If I have users, share them with the new tab
        setGameState((prev) => {
            if (prev.users.length > 0 && channel) {
                 channel.postMessage({ type: 'SYNC_RESPONSE', payload: prev.users });
            }
            return prev;
        });
        break;
      case 'SYNC_RESPONSE':
        setGameState((prev) => {
            // Merge users avoiding duplicates
            const newUsers = event.payload.filter(u => !prev.users.find(existing => existing.id === u.id));
            return { ...prev, users: [...prev.users, ...newUsers] };
        });
        break;
    }
  }, [channel]);

  const emitJoin = (name: string, avatar: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      avatar,
    };
    // Update local
    handleEvent({ type: 'JOIN', payload: newUser });
    // Broadcast
    channel?.postMessage({ type: 'JOIN', payload: newUser });
    return newUser;
  };

  const emitReset = () => {
    handleEvent({ type: 'RESET', payload: null });
    channel?.postMessage({ type: 'RESET', payload: null });
  };

  const emitStart = () => {
    handleEvent({ type: 'START_DRAW', payload: null });
    channel?.postMessage({ type: 'START_DRAW', payload: null });

    // Simulate server-side delay for winner selection logic
    // In a real socket app, this would happen on server.js
    // Here, the Admin client acts as the "Server" for this action
    setTimeout(() => {
      setGameState(currentState => {
        if (currentState.users.length === 0) return currentState;
        const randomIndex = Math.floor(Math.random() * currentState.users.length);
        const winner = currentState.users[randomIndex];
        
        // Broadcast winner
        channel?.postMessage({ type: 'SHOW_WINNER', payload: winner });
        return { ...currentState, status: 'WINNER', winner };
      });
    }, 500); // Short delay before lock-in, animation handles visual duration
  };

  return {
    gameState,
    emitJoin,
    emitReset,
    emitStart,
  };
};
