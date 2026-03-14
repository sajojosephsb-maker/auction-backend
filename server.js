const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Cloud DB Connected"));

const SaleSchema = new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number });
const Sale = mongoose.model('Sale', SaleSchema);

let authorizedBidders = { "BID-001": "Sajo Joseph", "BID-002": "Puttady Trader", "BID-003": "Spice King" };
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, videoUrl: "" };
let auctionCatalogue = [];
let currentLotIndex = 0;

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);
    
    // ADMIN: Update Video Stream
    socket.on('updateVideo', (data) => {
        if (data.password === "spices_admin_2026") {
            auctionState.videoUrl = data.url;
            io.emit('updateBid', auctionState);
        }
    });

    socket.on('uploadCatalogue', (data) => {
        if (data.password === "spices_admin_2026") {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            startLot(0);
        }
    });

    socket.on('placeBid', (data) => {
        const bidderName = authorizedBidders[data.userId];
        if (bidderName && !auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = bidderName;
            io.emit('playBidSound'); 
            io.emit('updateBid', auctionState);
        }
    });

    socket.on('adminAction', (data) => {
        if (data.password === "spices_admin_2026") auctionState.timeLeft = 0;
    });
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { ...auctionState, currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false };
    io.emit('updateBid', auctionState);
}

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex);
            }, 3000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
