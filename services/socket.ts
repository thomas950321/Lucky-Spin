
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
            const savedPwd = sessionStorage.getItem('admin_password');
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
            sessionStorage.removeItem('admin_password'); // Clear invalid
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const emitJoin = (userOrName: string | User, avatar?: string, eventId?: string) => {
        if (!socket) return;

        let user: User;
        // Handle legacy signature (name, avatar) vs new signature (userObj, null, eventId)
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
    };

    // For BigScreen/Admin to just listen to a specific event
    const joinEventRoom = (eventId: string) => {
        socket?.emit('REQUEST_STATE', eventId);
    };

    const emitReset = (eventId?: string) => {
        socket?.emit('RESET', eventId);
    };

    const emitStart = (eventId?: string) => {
        socket?.emit('START_DRAW', eventId);
    };

    const emitLogin = (password: string) => {
        if (!socket) return;
        socket.emit('ADMIN_LOGIN', password);
        // Optimistically save, or wait for success?
        // Better wait for success, but for simplicity saving here or in SUCCESS handler
        // The SUCCESS handler handles the "IsAdmin=true" state.
        // We need to save it somewhere to restore it.
        // Let's explicitly save it here so the connect handler can pick it up if we refresh immediately?
        // Actually, saving in SUCCESS handler is safer.
        // But the SUCCESS handler inside useEffect needs access to 'password' variable which isn't there.
        // So we save to sessionStorage HERE.
        sessionStorage.setItem('admin_password', password);
    };

    return {
        gameState,
        emitJoin,
        emitReset,
        emitStart,
        joinEventRoom,
        isAdmin,
        loginError,
        emitLogin,
        emitClearHistory: (eventId?: string) => socket?.emit('CLEAR_HISTORY', eventId),
        emitNewRound: (eventId?: string) => socket?.emit('NEW_ROUND', eventId),
        socket
    };
};
