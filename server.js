const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected")).catch(err => console.log(err));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let currentLotIndex = 0;
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', async (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        
        if (data.action === 'ACCEPT_AND_NEXT') {
            auctionState.timeLeft = 0;
            auctionState.isEnded = true;
            
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) {
                    const nextLot = auctionCatalogue[currentLotIndex];
                    auctionState = { currentLot: nextLot.lotNumber, highestBid: nextLot.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: nextLot.weight };
                    io.emit('updateBid', auctionState);
                }
            }, 3000);
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

http.listen(process.env.PORT || 10000);
