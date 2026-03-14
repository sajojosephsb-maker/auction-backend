const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let auctionState = {
    currentLot: "LOT-100",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    status: "CLOSED" // "LIVE", "CLOSED", "WITHDRAWN"
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminControl', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'START_AUCTION') {
            auctionState = { ...auctionState, currentLot: data.lotId, highestBid: data.startPrice, isEnded: false, timeLeft: 60, status: "LIVE" };
        } 
        else if (data.action === 'WITHDRAW') {
            auctionState.isEnded = true;
            auctionState.status = "WITHDRAWN";
            auctionState.timeLeft = 0;
        }
        else if (data.action === 'CLOSE_MANUAL') {
            auctionState.timeLeft = 0; // Forces the timer to end and save
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

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            auctionState.status = "CLOSED";
            // Save to transactions only if sold
            if (auctionState.highestBidder !== "No Bids") {
                allTransactions.push({ date: new Date(), lot: auctionState.currentLot, bidder: auctionState.highestBidder, rate: auctionState.highestBid });
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Admin Master Server Live'); });
