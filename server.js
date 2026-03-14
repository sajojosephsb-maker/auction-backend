const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let bannedBuyers = new Set(); // Stores banned bidder names

let auctionState = {
    currentLot: "WAITING",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    status: "IDLE",
    qualityNote: ""
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'BAN_BUYER') {
            bannedBuyers.add(data.buyerName);
            io.emit('buyerBanned', { name: data.buyerName });
            console.log(`Buyer Banned: ${data.buyerName}`);
        } else if (data.action === 'UNBAN_BUYER') {
            bannedBuyers.delete(data.buyerName);
        }
        // ... include previous switch cases (START, ACCEPT, RERUN, WITHDRAW, etc.)
    });

    socket.on('placeBid', (data) => {
        // Block the bid if the buyer is in the banned list
        if (bannedBuyers.has(data.bidderName)) {
            socket.emit('error', 'You have been suspended from bidding.');
            return;
        }
        
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            if (auctionState.timeLeft < 10) auctionState.timeLeft = 10;
            io.emit('updateBid', auctionState);
        }
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Admin Master Server Active'); });
