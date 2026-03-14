const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let allTransactions = [];

let auctionState = {
    currentLot: "IDLE",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    weight: 0,
    imageUrl: "default-cardamom.jpg"
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // Video Streaming Relay
    socket.on('streamFrame', (frameData) => {
        // Broadcast the live video frame to all buyers
        socket.broadcast.emit('liveVideoFrame', frameData);
    });

    socket.on('startLotByIndex', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            const lot = auctionCatalogue[data.index];
            auctionState = {
                currentLot: lot.lotNumber,
                highestBid: lot.auctionStartPrice,
                highestBidder: "No Bids",
                timeLeft: 60,
                isEnded: false,
                weight: lot.quantity,
                imageUrl: lot.imageUrl || "default-cardamom.jpg"
            };
            io.emit('updateBid', auctionState);
        }
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

http.listen(process.env.PORT || 10000, () => { console.log('Video Master Engine Live'); });
