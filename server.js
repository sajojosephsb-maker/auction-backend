const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let auctionState = {
    currentLot: "N/A",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    status: "IDLE", 
    qualityNote: "" // For "Artificially Coloured" or "Suspected"
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'START') {
            auctionState = { ...auctionState, currentLot: data.lotId, highestBid: data.price, isEnded: false, timeLeft: 60, status: "LIVE", qualityNote: "" };
        } else if (data.action === 'WITHDRAW') {
            auctionState.isEnded = true;
            auctionState.status = "WITHDRAWN";
        } else if (data.action === 'SKIP') {
            auctionState.isEnded = true;
            auctionState.status = "SKIPPED";
        } else if (data.action === 'QUALITY_ALERT') {
            auctionState.qualityNote = data.note; // e.g., "Artificially Coloured"
        }
        io.emit('updateBid', auctionState);
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            if (auctionState.timeLeft < 10) auctionState.timeLeft = 10;
            io.emit('updateBid', auctionState);
        }
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Admin Controls Ready'); });
