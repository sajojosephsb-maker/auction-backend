const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let participantCount = 0;
let lotHistory = [];
let pendingBuyers = [];
let approvedBuyers = {}; 

let auctionState = {
    currentLot: "LOT-101: Bold Green Cardamom",
    highestBid: 1200,
    highestBidder: "No Bids",
    timeLeft: 60,
    isEnded: false,
    specs: { totalWeight: 600 }
};

io.on('connection', (socket) => {
    participantCount++;
    io.emit('updateParticipantCount', participantCount);
    socket.emit('updateBid', auctionState);
    socket.emit('updateLotHistory', lotHistory);

    // MESSAGE BROADCAST
    socket.on('adminBroadcast', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            io.emit('showAnnouncement', data.message);
        }
    });

    socket.on('registerBuyer', (data) => {
        pendingBuyers.push({ id: socket.id, ...data });
        io.emit('newRegistrationRequest', pendingBuyers);
    });

    socket.on('disconnect', () => {
        participantCount--;
        io.emit('updateParticipantCount', participantCount);
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Server Live'); });
