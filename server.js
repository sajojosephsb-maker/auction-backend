const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let buyerStats = {}; // Stores { "Name": { login: Time, logout: Time, purchases: [], limit: 0 } }
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true };

io.on('connection', (socket) => {
    socket.on('registerBuyer', (data) => {
        buyerStats[data.name] = {
            ...buyerStats[data.name],
            loginTime: new Date().toLocaleTimeString(),
            logoutTime: "Still Active",
            company: data.company,
            gst: data.gst,
            purchases: []
        };
        console.log(`${data.name} logged in`);
    });

    socket.on('disconnect', () => {
        // Find the buyer associated with this socket and set logout time
        // Note: In a production app, you'd map socket.id to a username
    });

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        if (data.action === 'GET_STATS') {
            socket.emit('receiveStats', buyerStats[data.targetName]);
        }
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Master System Online'); });
