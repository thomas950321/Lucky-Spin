import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import supabase from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(express.json());
app.use(cookieParser());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Serve React App (Production Only or if dist exists)
import fs from 'fs';

const PORT = process.env.PORT || 4000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(/(.*)/, (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // In development (API only mode)
    app.get('/', (req, res) => {
        res.send('Backend Server is Running. For frontend, use the Vite dev server (usually port 3000).');
    });
}

// State
const gameStates = new Map();

// Helper to get or create state
const getGameState = (eventId = 'default') => {
    if (!gameStates.has(eventId)) {
        gameStates.set(eventId, {
            users: [],
            status: 'WAITING',
            winner: null,
            winnersHistory: []
        });
    }
    return gameStates.get(eventId);
};

// Initialize default state
getGameState('default');

// --- Event API Routes ---

// Create Event
app.post('/api/events', async (req, res) => {
    const { title, background_url } = req.body;
    try {
        const { data, error } = await supabase
            .from('events')
            .insert({ title, background_url })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Event
app.get('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: 'Event not found' });
    }
});

// --- Auth Routes ---

// 1. Redirect to LINE Login
app.get('/api/auth/line/login', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const redirectUri = process.env.LINE_CALLBACK_URL;
    const clientId = process.env.LINE_CHANNEL_ID;

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state: state,
        scope: 'profile openid'
    });

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
    res.redirect(lineAuthUrl);
});

// 2. LINE Callback
app.get('/api/auth/line/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.LINE_CALLBACK_URL);
        params.append('client_id', process.env.LINE_CHANNEL_ID);
        params.append('client_secret', process.env.LINE_CHANNEL_SECRET);

        const tokenRes = await axios.post('https://api.line.me/oauth2/v2.1/token', params);
        const { id_token } = tokenRes.data;

        const profileParams = new URLSearchParams();
        profileParams.append('id_token', id_token);
        profileParams.append('client_id', process.env.LINE_CHANNEL_ID);

        const profileRes = await axios.post('https://api.line.me/oauth2/v2.1/verify', profileParams);
        const { sub: lineUserId, name, picture } = profileRes.data;

        // Upsert to Supabase
        const { data: user, error } = await supabase
            .from('participants')
            .upsert({
                line_user_id: lineUserId,
                display_name: name,
                picture_url: picture
            }, { onConflict: 'line_user_id' })
            .select()
            .single();

        if (error) throw error;

        // Set Cookies
        const cookieOptions = {
            httpOnly: true,
            maxAge: 86400000,
            path: '/',
            sameSite: 'lax',
            secure: false
        };

        res.cookie('user_id', user.id, cookieOptions);
        res.cookie('display_name', name, { httpOnly: false, path: '/', sameSite: 'lax', secure: false, maxAge: 86400000 });
        res.cookie('avatar', picture, { httpOnly: false, path: '/', sameSite: 'lax', secure: false, maxAge: 86400000 });

        // Redirect to Frontend
        res.redirect(`${FRONTEND_URL}/#/join?login=success`);

    } catch (err) {
        console.error('Login Error:', err.response?.data || err.message);
        res.redirect(`${FRONTEND_URL}/#/join?error=login_failed`);
    }
});

// Shared Cookie Options for clearing
const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: false
};

// 2.5 Logout
app.get('/api/auth/logout', (req, res) => {
    res.clearCookie('user_id', cookieOptions);
    res.clearCookie('display_name', { ...cookieOptions, httpOnly: false }); // display_name was set with httpOnly: false
    res.clearCookie('avatar', { ...cookieOptions, httpOnly: false });       // avatar was set with httpOnly: false
    res.json({ success: true });
});

// 3. Get Current User
app.get('/api/user/me', async (req, res) => {
    console.log('[Auth Check] Cookies received:', req.cookies);
    const userId = req.cookies.user_id;
    console.log('[Auth Check] UserID from cookie:', userId);

    if (!userId) return res.json({ authenticated: false });

    // Optional: Query DB to double check or get fresh data
    try {
        const { data: user, error } = await supabase
            .from('participants')
            .select('line_user_id, display_name, picture_url')
            .eq('id', userId)
            .single();

        if (error || !user) return res.json({ authenticated: false });

        res.json({
            authenticated: true,
            name: user.display_name,
            avatar: user.picture_url,
            lineUserId: user.line_user_id
        });
    } catch {
        res.json({ authenticated: false });
    }
});




// Socket Logic
io.on('connection', (socket) => {

    socket.on('ADMIN_LOGIN', (password) => {
        if (password === ADMIN_PASSWORD) {
            socket.data.isAdmin = true;
            socket.emit('ADMIN_LOGIN_SUCCESS');
        } else {
            socket.emit('ADMIN_LOGIN_FAIL');
        }
    });

    socket.on('JOIN', (userData) => {
        // userData can now include eventId
        const eventId = userData.eventId || 'default';
        const userPayload = userData.user || userData; // Handle both simplified and structured payload

        if (!userPayload || !userPayload.lineUserId) return;

        console.log(`[Socket] Join request from ${userPayload.name} (${userPayload.lineUserId}) to Event: ${eventId}`);

        socket.join(eventId);
        const gameState = getGameState(eventId);

        // Check if user already exists
        const existingUserIndex = gameState.users.findIndex(u => u.lineUserId === userPayload.lineUserId);

        if (existingUserIndex !== -1) {
            // Update existing user's socket ID (handle refresh/reconnect)
            console.log(`[Socket] User ${userPayload.name} re-connected/updated.`);
            gameState.users[existingUserIndex].id = socket.id;
            gameState.users[existingUserIndex].name = userPayload.name;
            gameState.users[existingUserIndex].avatar = userPayload.avatar;
        } else {
            // New User
            const newUser = {
                id: socket.id,
                lineUserId: userPayload.lineUserId,
                name: userPayload.name,
                avatar: userPayload.avatar
            };
            gameState.users.push(newUser);
            console.log(`[Socket] New user joined: ${userPayload.name}`);
        }

        io.to(eventId).emit('UPDATE_STATE', gameState);
        // Also send state to the individual socket just in case
        socket.emit('UPDATE_STATE', gameState);
    });

    // Request State (Explicit Sync)
    socket.on('REQUEST_STATE', (eventId = 'default') => {
        socket.join(eventId);
        socket.emit('UPDATE_STATE', getGameState(eventId));
    });

    socket.on('START_DRAW', (eventId = 'default') => {
        // if (!socket.data.isAdmin) return; // Strict Admin Check (Optional)

        const gameState = getGameState(eventId);
        if (gameState.status === 'ROLLING') return; // Prevent double start

        if (gameState.users.length > 0) {
            // Pick winner immediately so wheel knows where to land
            const winnerIndex = Math.floor(Math.random() * gameState.users.length);
            gameState.winner = gameState.users[winnerIndex];
            gameState.status = 'ROLLING'; // Start Animation
            io.to(eventId).emit('UPDATE_STATE', gameState);

            // Wait for Fixed Frontend Animation Time (8s) + Buffer
            setTimeout(() => {
                // Add to history ONLY after spin completes
                if (!gameState.winnersHistory) gameState.winnersHistory = [];
                gameState.winnersHistory.push(gameState.winner);

                gameState.status = 'WINNER'; // Show Result
                io.to(eventId).emit('UPDATE_STATE', gameState);
            }, 8500);
        }
    });

    socket.on('RESET', (eventId = 'default') => {
        console.log(`[Server] RESET requested by ${socket.id} for Event: ${eventId}`);
        if (!socket.data.isAdmin) {
            console.warn('[Server] RESET denied: Not Admin');
            // return; 
        }
        const gameState = getGameState(eventId);
        gameState.status = 'WAITING';
        gameState.winner = null;
        gameState.users = [];
        gameState.winnersHistory = [];
        io.to(eventId).emit('UPDATE_STATE', gameState);
    });

    socket.on('disconnect', () => {
        // Cleanup? Not strictly necessary for simple persistent array
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
