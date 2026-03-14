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

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            
            // BIDDING WAR MECHANIC: Reset timer to 10s if it's lower
            if (auctionState.timeLeft < 10) auctionState.timeLeft = 10;
            
            io.emit('updateBid', auctionState);
        }
    });

    socket.on('adminBroadcast', (data) => {
        if (data.password === ADMIN_PASSWORD) io.emit('showAnnouncement', data.message);
    });

    socket.on('disconnect', () => {
        participantCount--;
        io.emit('updateParticipantCount', participantCount);
    });
});

// THE TIMER (Must be present for lots to close)
setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Server Live'); });
