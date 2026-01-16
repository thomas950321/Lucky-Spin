
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
// CORS config might be needed for dev but we use proxy.
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../dist')));

// Anything that doesn't match the above, send back index.html
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;

// State
let gameState = {
    users: [],
    status: 'WAITING', // 'WAITING' | 'ROLLING' | 'WINNER'
    winner: null,
};

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial state
    socket.emit('UPDATE_STATE', gameState);

    socket.on('JOIN', (user) => {
        // Avoid duplicates
        if (!gameState.users.find(u => u.id === user.id || u.name === user.name)) {
            console.log('User joined:', user.name);
            gameState.users.push(user);
            io.emit('UPDATE_STATE', gameState);
        }
    });

    socket.on('START_DRAW', () => {
        if (gameState.users.length > 0) {
            console.log('Draw started');
            gameState.status = 'ROLLING';
            gameState.winner = null;
            io.emit('UPDATE_STATE', gameState);

            // Server-side delay for fairness/dramatic effect
            setTimeout(() => {
                const winnerIndex = Math.floor(Math.random() * gameState.users.length);
                const winner = gameState.users[winnerIndex];
                gameState.winner = winner;
                gameState.status = 'WINNER';
                console.log('Winner determined:', winner.name);
                io.emit('UPDATE_STATE', gameState);
            }, 500);
        }
    });

    socket.on('RESET', () => {
        console.log('Game reset');
        gameState.status = 'WAITING';
        gameState.winner = null;
        gameState.users = []; // Optional: Clear users on reset? Or keep them?
        // User requested "RESET GAME" in AdminPanel usually implies clearing winner, maybe not users.
        // But in prev logic: "setGameState({ users: [], status: 'WAITING', winner: null });"
        // So yes, clear users.
        gameState.users = [];
        io.emit('UPDATE_STATE', gameState);
    });

    // Clean up
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Socket.io server running on http://localhost:${PORT}`);
});
