const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected"));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, weight: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

const ADMIN_PASS = "spices_admin_2026";
// List of authorized bidders (You can add more here)
const AUTHORIZED_BIDDERS = {
    "BID-001": "Sajo Joseph",
    "BID-002": "Puttady Trader",
    "BID-003": "Spice King"
};

let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };
let auctionCatalogue = [];
let currentLotIndex = 0;

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // ADMIN: Start/Next Lot
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASS) {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            startLot(0);
        }
    });

    socket.on('adminAction', (data) => {
        if (data.password === ADMIN_PASS) auctionState.timeLeft = 0;
    });

    // BIDDER: Place Bid (Requires User ID)
    socket.on('placeBid', (data) => {
        const bidderName = AUTHORIZED_BIDDERS[data.userId];
        if (bidderName && !auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: item.weight };
    io.emit('updateBid', auctionState);
}

// Timer Logic
setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                await new Sale({ lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid, weight: auctionState.weight }).save();
            }
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex);
            }, 3000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
