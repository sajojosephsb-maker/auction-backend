const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let auctionState = {
    currentLot: "LOT-101: Bold Cardamom",
    highestBid: 1200,
    highestBidder: "No Bids",
    timeLeft: 60,
    isEnded: false,
    specs: { totalWeight: 600 },
    videoUrl: "" // Holds the live stream link
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // Admin Video Control
    socket.on('updateVideo', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionState.videoUrl = data.url;
            io.emit('updateBid', auctionState);
        }
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
            
            // Winner Notification Logic
            if (auctionState.highestBidder !== "No Bids") {
                const netPayable = (auctionState.highestBid * auctionState.specs.totalWeight * 1.01) * 1.05;
                io.emit('sendNotification', {
                    target: auctionState.highestBidder,
                    message: `🔨 WON: ${auctionState.currentLot}\nRate: ₹${auctionState.highestBid}\nTotal: ₹${netPayable.toFixed(2)}`
                });
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Full System Live'); });
