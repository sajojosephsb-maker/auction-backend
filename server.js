const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
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

        switch(data.action) {
            case 'START':
                auctionState = { ...auctionState, currentLot: data.lotId, highestBid: data.price, isEnded: false, timeLeft: 60, status: "LIVE", qualityNote: "" };
                break;
            case 'ACCEPT':
                auctionState.timeLeft = 0; // Ends lot immediately and saves winner
                break;
            case 'RERUN':
                auctionState.highestBid = data.price || 1000;
                auctionState.highestBidder = "No Bids";
                auctionState.timeLeft = 60;
                auctionState.isEnded = false;
                break;
            case 'WITHDRAW':
                auctionState.isEnded = true;
                auctionState.status = "WITHDRAWN";
                break;
            case 'SKIP':
                auctionState.isEnded = true;
                auctionState.status = "SKIPPED";
                break;
            case 'QUALITY_ALERT':
                auctionState.qualityNote = data.note;
                break;
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
            if (auctionState.highestBidder !== "No Bids") {
                allTransactions.push({ date: new Date(), lot: auctionState.currentLot, bidder: auctionState.highestBidder, rate: auctionState.highestBid });
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Admin Master Server Active'); });
