const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; // Archive for Daily, Weekly, Monthly, Yearly reports

let auctionState = {
    currentLot: "LOT-101: Bold Cardamom",
    highestBid: 1200,
    highestBidder: "No Bids",
    timeLeft: 60,
    isEnded: false,
    specs: { totalWeight: 600 }
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // Global Reporting Listener
    socket.on('getReport', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        const now = new Date();
        let filtered = allTransactions;

        if (data.type === 'daily') {
            filtered = allTransactions.filter(t => new Date(t.date).toDateString() === now.toDateString());
        } else if (data.type === 'monthly') {
            filtered = allTransactions.filter(t => new Date(t.date).getMonth() === now.getMonth());
        } else if (data.type === 'trader') {
            filtered = allTransactions.filter(t => t.bidder === data.traderName);
        }
        socket.emit('reportData', { type: data.type, records: filtered });
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
            
            // SAVE TO MASTER ARCHIVE (Daily/Monthly/Yearly)
            const qty = auctionState.specs.totalWeight;
            const bidVal = auctionState.highestBid * qty;
            const comm = bidVal * 0.01;
            const gst = (bidVal + comm) * 0.05;

            allTransactions.push({
                date: new Date(),
                lot: auctionState.currentLot,
                bidder: auctionState.highestBidder,
                rate: auctionState.highestBid,
                total: (bidVal + comm + gst).toFixed(2)
            });

            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Auction System Stable'); });
