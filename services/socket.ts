
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
        const newSocket = io();

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            // Auto-login if password saved
            const savedPwd = localStorage.getItem('admin_password');
            if (savedPwd) {
                newSocket.emit('ADMIN_LOGIN', savedPwd);
            }
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
            localStorage.removeItem('admin_password'); // Clear invalid
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const emitJoin = useCallback((userOrName: string | User, avatar?: string, eventId?: string) => {
        if (!socket) return;

        let user: User;
        if (typeof userOrName === 'string') {
            user = {
                id: Math.random().toString(36).substr(2, 9),
                name: userOrName,
                avatar: avatar || '',
            };
        } else {
            user = userOrName;
        }

        socket.emit('JOIN', { user, eventId });
    }, [socket]);

    const joinEventRoom = useCallback((eventId: string) => {
        socket?.emit('REQUEST_STATE', eventId);
    }, [socket]);

    const emitReset = useCallback((eventId?: string) => {
        socket?.emit('RESET', eventId);
    }, [socket]);

    const emitStart = useCallback((eventId?: string) => {
        socket?.emit('START_DRAW', eventId);
    }, [socket]);

    const emitLogin = useCallback((password: string) => {
        if (!socket) return;
        socket.emit('ADMIN_LOGIN', password);
        localStorage.setItem('admin_password', password);
    }, [socket]);

    const emitClearHistory = useCallback((eventId?: string) => {
        socket?.emit('CLEAR_HISTORY', eventId);
    }, [socket]);

    const emitNewRound = useCallback((eventId?: string) => {
        socket?.emit('NEW_ROUND', eventId);
    }, [socket]);

    const emitRemoveBots = useCallback((eventId?: string) => {
        socket?.emit('REMOVE_BOTS', eventId);
    }, [socket]);

    return {
        gameState,
        emitJoin,
        emitReset,
        emitStart,
        joinEventRoom,
        isAdmin,
        loginError,
        emitLogin,
        emitClearHistory,
        emitNewRound,
        emitRemoveBots,
        socket
    };
};
