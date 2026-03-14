const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected")).catch(err => console.log("DB Error:", err));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

// 2. State Management
const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let biddingOpen = false;
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 600 };

io.on('connection', (socket) => {
    Sale.find().sort({date: -1}).limit(20).then(records => socket.emit('initialResults', records));
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', async (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'OPEN_BIDS') {
            biddingOpen = true;
            io.emit('statusUpdate', { message: "Bidding is now OPEN!" });
        } else if (data.action === 'CLOSE_BIDS') {
            biddingOpen = false;
            io.emit('statusUpdate', { message: "Bidding is CLOSED." });
        } else if (data.action === 'RERUN_LOT') {
            auctionState.timeLeft = 60;
            auctionState.isEnded = false;
            io.emit('statusUpdate', { message: "Lot is being RE-RUN!" });
        } else if (data.action === 'WITHDRAW_LOT') {
            auctionState.isEnded = true;
            auctionState.highestBidder = "WITHDRAWN";
            io.emit('statusUpdate', { message: "Lot WITHDRAWN." });
        }
        io.emit('updateBid', auctionState);
    });

    socket.on('placeBid', (data) => {
        if (!biddingOpen) return socket.emit('error', "Bidding is locked.");
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids" && auctionState.highestBidder !== "WITHDRAWN") {
                const finalSale = new Sale({
                    lot: auctionState.currentLot, buyer: auctionState.highestBidder,
                    rate: auctionState.highestBid, total: (auctionState.highestBid * auctionState.weight * 1.06).toFixed(2)
                });
                await finalSale.save();
                io.emit('newResult', finalSale);
            }
            io.emit('updateBid', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000);
