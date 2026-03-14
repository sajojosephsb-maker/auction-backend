const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let authorizedBidders = [
    { id: "BID001", pass: "1234", name: "Sample Trader" }
];
let activeSessions = {}; 

io.on('connection', (socket) => {
    // Standard Login Logic
    socket.on('loginAttempt', (data) => {
        const user = authorizedBidders.find(u => u.id === data.id && u.pass === data.pass);
        if (user) {
            activeSessions[socket.id] = { id: user.id, name: user.name, loginTime: new Date().toLocaleTimeString() };
            socket.emit('loginResponse', { success: true, name: user.name });
            io.emit('updateActiveUsers', Object.values(activeSessions));
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid ID/Password" });
        }
    });

    // Admin Control: Force Logout (Kick)
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'KICK_USER') {
            // Find the socket ID belonging to the targeted Bidder ID
            for (const [sId, session] of Object.entries(activeSessions)) {
                if (session.id === data.targetId) {
                    io.to(sId).emit('forceLogout', "Your session was terminated by the administrator.");
                    // The socket will disconnect automatically after the client receives this
                }
            }
        }
        // ... (Add CREATE_USER and EDIT_USER cases here)
    });

    socket.on('disconnect', () => {
        delete activeSessions[socket.id];
        io.emit('updateActiveUsers', Object.values(activeSessions));
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Master Auth Engine Live'); });
