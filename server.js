const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
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
    // Send current state to anyone who connects (Buyers & Observers)
    socket.emit('updateBid', auctionState);
    socket.emit('updateLotHistory', lotHistory);

    // Registration for Buyers
    socket.on('registerBuyer', (data) => {
        pendingBuyers.push({ id: socket.id, ...data });
        io.emit('newRegistrationRequest', pendingBuyers);
    });

    // Bidding (Blocked for Observers)
    socket.on('placeBid', (data) => {
        if (approvedBuyers[data.bidderName] && !auctionState.isEnded) {
            if (data.amount > auctionState.highestBid) {
                auctionState.highestBid = data.amount;
                auctionState.highestBidder = data.bidderName;
                auctionState.timeLeft = 10; 
                io.emit('updateBid', auctionState);
            }
        }
    });

    // Admin Approvals
    socket.on('adminAction', (data) => {
        if (data.password === ADMIN_PASSWORD && data.action === 'approve_buyer') {
            approvedBuyers[data.targetUser] = { limit: data.limit || 1000000 };
            pendingBuyers = pendingBuyers.filter(b => b.username !== data.targetUser);
            io.emit('newRegistrationRequest', pendingBuyers);
            io.emit('buyerApproved', { username: data.targetUser, limit: data.limit });
        }
    });
});

// Timer Logic
setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            const win = { lot: auctionState.currentLot, price: auctionState.highestBid, bidder: auctionState.highestBidder };
            lotHistory.unshift(win);
            if (lotHistory.length > 5) lotHistory.pop();
            io.emit('updateLotHistory', lotHistory);
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Server Active'); });
