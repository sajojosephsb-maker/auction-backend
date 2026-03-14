const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let bannedBuyers = new Set();
let creditLimits = {}; // Stores { "BuyerName": 5000000 }
let currentSpending = {}; // Tracks total spent in current session

let auctionState = {
    currentLot: "WAITING",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    status: "IDLE",
    qualityNote: "",
    weight: 600
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'SET_CREDIT') {
            creditLimits[data.buyerName] = parseFloat(data.amount);
        } else if (data.action === 'BAN_BUYER') {
            bannedBuyers.add(data.buyerName);
        } else if (data.action === 'ACCEPT') {
            auctionState.timeLeft = 0;
        }
        // ... include START, RERUN, WITHDRAW, SKIP logic
        io.emit('updateBid', auctionState);
    });

    socket.on('placeBid', (data) => {
        const totalBidCost = data.amount * auctionState.weight;
        const buyerSpent = currentSpending[data.bidderName] || 0;
        const limit = creditLimits[data.bidderName] || 999999999; // Default no limit

        if (bannedBuyers.has(data.bidderName)) {
            socket.emit('error', 'Account Suspended.');
            return;
        }

        if ((buyerSpent + totalBidCost) > limit) {
            socket.emit('error', 'Credit Limit Exceeded! Contact Admin.');
            return;
        }

        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Master Server Active'); });
