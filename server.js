const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected"));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

// 2. State Management
const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 600 };

io.on('connection', (socket) => {
    // Sync initial data
    Sale.find().sort({date: -1}).limit(20).then(records => socket.emit('initialResults', records));
    socket.emit('updateBid', auctionState);

    // CSV Upload Handler
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.list;
            io.emit('catalogueUpdated', { count: auctionCatalogue.length });
        }
    });

    // Admin Controls
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        if (data.action === 'START') {
            const lot = auctionCatalogue[data.index];
            if(lot) {
                auctionState = { currentLot: lot.lotNumber, highestBid: lot.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: lot.weight };
            }
        } else if (data.action === 'ACCEPT') {
            auctionState.timeLeft = 0;
        }
        io.emit('updateBid', auctionState);
    });

    // Bidding Logic
    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

// 3. Automated Sales Saving
setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const finalSale = new Sale({
                    lot: auctionState.currentLot,
                    buyer: auctionState.highestBidder,
                    rate: auctionState.highestBid,
                    total: (auctionState.highestBid * auctionState.weight * 1.06).toFixed(2)
                });
                await finalSale.save();
                io.emit('newResult', finalSale);
            }
            io.emit('updateBid', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000);
