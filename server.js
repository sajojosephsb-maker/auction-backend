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
    weight: 600 // Default weight for calculations
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);
    socket.emit('initialResults', allTransactions);

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        if (data.action === 'ACCEPT') auctionState.timeLeft = 0;
        // Other admin actions (START, RERUN, etc.) go here
        io.emit('updateBid', auctionState);
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
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
                const base = auctionState.highestBid * auctionState.weight;
                const comm = base * 0.01;
                const gst = (base + comm) * 0.05;
                const total = base + comm + gst;

                const saleRecord = {
                    lot: auctionState.currentLot,
                    buyer: auctionState.highestBidder,
                    rate: auctionState.highestBid,
                    totalValue: total.toFixed(2)
                };
                allTransactions.push(saleRecord);
                io.emit('newResult', saleRecord);
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Auction Master Live'); });
