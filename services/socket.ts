
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, GameState } from '../types';

export const useGameSocket = () => {
    const [gameState, setGameState] = useState<GameState>({
        users: [],
        status: 'WAITING',
        winner: null,
    });

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Connect to the server
        // In dev: proxy forwards /socket.io to localhost:3001
        // In prod: connects to relative path
        const newSocket = io();

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('UPDATE_STATE', (newState: GameState) => {
            setGameState(newState);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const emitJoin = (name: string, avatar: string) => {
        if (!socket) return;
        const user: User = {
            id: Math.random().toString(36).substr(2, 9), // Client-gen ID for now, could be server
            name,
            avatar,
        };
        socket.emit('JOIN', user);
    };

    const emitReset = () => {
        socket?.emit('RESET');
    };

    const emitStart = () => {
        socket?.emit('START_DRAW');
    };

    return {
        gameState,
        emitJoin,
        emitReset,
        emitStart,
    };
};
