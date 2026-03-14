const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";

let auctionState = {
    currentLot: "LOT-101: Bold Green Cardamom",
    highestBid: 1200,
    highestBidder: "No Bids",
    timeLeft: 60,
    isEnded: false,
    specs: { bags: 12, totalWeight: 600, moisture: "10.5%", size: "8mm+" }
};

let sessionLeaderboard = {};

io.on('connection', (socket) => {
    console.log('Buyer connected:', socket.id);
    socket.emit('updateBid', auctionState);
    socket.emit('updateLeaderboard', Object.entries(sessionLeaderboard));

    // BIDDING LOGIC
    socket.on('placeBid', (data) => {
        const currentLotValue = data.amount * auctionState.specs.totalWeight;
        const sessionTotalSpent = data.currentSpent || 0;
        const creditLimit = 1000000;

        if (sessionTotalSpent + currentLotValue > creditLimit) {
            return socket.emit('error', 'Credit Limit Exceeded! Max session limit is ₹10L.');
        }

        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            auctionState.timeLeft = 10; // 10-second fast-reset
            io.emit('updateBid', auctionState);
        }
    });

    // ADMIN CONTROLS
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return socket.emit('error', 'Wrong Password!');
        
        if (data.action === 'next') {
            // Logic to move to next lot goes here
            auctionState.isEnded = false;
            auctionState.timeLeft = 60;
            io.emit('updateBid', auctionState);
        }
    });
});

// Timer Loop
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

http.listen(process.env.PORT || 10000, () => {
    console.log('Spice Auction Server is Live on Port 10000');
});
