
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, GameState } from '../types';

export const useGameSocket = () => {
    const [gameState, setGameState] = useState<GameState>({
        users: [],
        status: 'WAITING',
        winner: null,
        winnersHistory: [],
    });

    const [isAdmin, setIsAdmin] = useState(false);
    const [loginError, setLoginError] = useState(false);

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

        newSocket.on('ADMIN_LOGIN_SUCCESS', () => {
            setIsAdmin(true);
            setLoginError(false);
        });

        newSocket.on('ADMIN_LOGIN_FAIL', () => {
            setLoginError(true);
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

    const emitLogin = (password: string) => {
        console.log('Emitting login:', password, !!socket);
        if (!socket) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('ADMIN_LOGIN', password);
    };

    return {
        gameState,
        emitJoin,
        emitReset,
        emitStart,
        isAdmin,
        loginError,
        emitLogin,
        socket
    };
};
