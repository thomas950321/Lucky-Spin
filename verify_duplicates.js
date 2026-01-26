import { io } from "socket.io-client";

const URL = "http://localhost:4000";
const ADMIN_PASSWORD = "admin123";

const adminSocket = io(URL);
const user1Socket = io(URL);
const user2Socket = io(URL);

const user1 = { lineUserId: "u1", name: "User 1", avatar: "a1" };
const user2 = { lineUserId: "u2", name: "User 2", avatar: "a2" };

let winner1 = null;
let winner2 = null;

async function run() {
    console.log("Connecting...");

    // Admin Login
    adminSocket.emit("ADMIN_LOGIN", ADMIN_PASSWORD);
    adminSocket.emit("REQUEST_STATE", 'default'); // Join room to receive updates

    // Reset State first (This clears users, so do it BEFORE joining)
    adminSocket.emit("RESET", 'default');
    adminSocket.emit("CLEAR_HISTORY", 'default');
    console.log("Reset state.");
    await new Promise(r => setTimeout(r, 500));

    // Users Join
    user1Socket.emit("JOIN", { user: user1 });
    user2Socket.emit("JOIN", { user: user2 });

    // Wait for joins
    await new Promise(r => setTimeout(r, 1000));
    console.log("Joined.");

    // Draw 1
    console.log("Starting Draw 1...");
    adminSocket.emit("START_DRAW");

    await waitForWinner(adminSocket).then(w => {
        winner1 = w;
        console.log("Winner 1:", w.name);
    });

    // Draw 2
    console.log("Starting Draw 2...");
    adminSocket.emit("START_DRAW");

    await waitForWinner(adminSocket).then(w => {
        winner2 = w;
        console.log("Winner 2:", w.name);
    });

    if (winner1.lineUserId === winner2.lineUserId) {
        console.error("FAIL: Duplicate winner in same round!");
        process.exit(1);
    } else {
        console.log("PASS: Different winners in same round.");
    }

    // New Round
    console.log("Starting New Round...");
    adminSocket.emit("NEW_ROUND");
    await new Promise(r => setTimeout(r, 500));

    // Draw 3 (Should fail or timeout)
    console.log("Starting Draw 3 (Should fail)...");
    adminSocket.emit("START_DRAW");

    // We expect NO winner update within 5 seconds

    const p = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.log("PASS: No winner selected (Timeout as expected).");
            resolve();
        }, 5000);

        adminSocket.on("UPDATE_STATE", (state) => {
            // If status changes to ROLLING or WINNER, that's bad if we expected failure
            if (state.status === "ROLLING") {
                console.error("FAIL: Started ROLLING when no eligible winners!");
                clearTimeout(timeout);
                reject();
            }
        });

        adminSocket.on("ERROR", (err) => {
            console.log("PASS: Received Error:", err.message);
            clearTimeout(timeout);
            resolve();
        });
    });

    await p;

    console.log("Verification Complete!");
    process.exit(0);
}

function waitForWinner(socket) {
    return new Promise(resolve => {
        const listener = (state) => {
            console.log(`[Verify] State Update: ${state.status}, Winner: ${state.winner ? state.winner.name : "None"}`);
            if (state.status === "WINNER") {
                socket.off("UPDATE_STATE", listener);
                resolve(state.winner);
            }
        };
        socket.on("UPDATE_STATE", listener);
    });
}

run();
