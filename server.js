const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// --- CONFIGURATION ---
const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let auctionCatalogue = [];
let bannedBuyers = new Set();
let creditLimits = {};
let currentSpending = {};
let buyerStats = {};

let auctionState = {
    currentLot: "IDLE",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    weight: 600,
    qualityNote: ""
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // ADMIN ACTIONS
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        
        switch(data.action) {
            case 'ACCEPT': auctionState.timeLeft = 0; break;
            case 'WITHDRAW': auctionState.isEnded = true; auctionState.status = "WITHDRAWN"; break;
            case 'QUALITY_ALERT': auctionState.qualityNote = data.note; break;
            case 'EXPORT_DATA': socket.emit('downloadExcel', allTransactions); break;
            case 'BAN_BUYER': bannedBuyers.add(data.buyerName); break;
        }
        io.emit('updateBid', auctionState);
    });

    // START LOT LOGIC WITH INVENTORY ALERT
    socket.on('startLotByIndex', (data) => {
        if (data.password !== ADMIN_PASSWORD) {
            const lot = auctionCatalogue[data.index];
            const remaining = auctionCatalogue.length - (data.index + 1);
            
            auctionState = {
                currentLot: lot.lotNumber,
                highestBid: lot.auctionStartPrice,
                highestBidder: "No Bids",
                timeLeft: 60,
                isEnded: false,
                weight: lot.quantity
            };

            if (remaining <= 5) {
                socket.emit('inventoryAlert', { count: remaining, message: `Only ${remaining} lots left!` });
            }
            io.emit('updateBid', auctionState);
        }
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid && !bannedBuyers.has(data.bidderName)) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const total = (auctionState.highestBid * auctionState.weight * 1.01 * 1.05).toFixed(2);
                allTransactions.push({ Lot: auctionState.currentLot, Buyer: auctionState.highestBidder, Rate: auctionState.highestBid, Total: total });
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Master Engine Live'); });
