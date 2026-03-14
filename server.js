const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Cloud Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected")).catch(err => console.log("DB Error:", err));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

// 2. Auction State
const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let currentLotIndex = 0;
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', async (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        
        if (data.action === 'ACCEPT_AND_NEXT') {
            auctionState.timeLeft = 0; // Trigger immediate end
        }
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
    
    // Admin uploads the CSV list
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            // Start first lot
            const first = auctionCatalogue[0];
            auctionState = { currentLot: first.lotNumber, highestBid: first.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: first.weight };
            io.emit('updateBid', auctionState);
        }
    });
});

// 3. THE TIMER ENGINE (CRITICAL FIX)
setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            // Auto-Save Sale to MongoDB Cloud
            if (auctionState.highestBidder !== "No Bids") {
                const finalSale = new Sale({
                    lot: auctionState.currentLot,
                    buyer: auctionState.highestBidder,
                    rate: auctionState.highestBid,
                    total: (auctionState.highestBid * auctionState.weight).toFixed(2)
                });
                await finalSale.save();
                io.emit('newResult', finalSale);
            }
            
            // Auto-advance to next lot after 5 seconds
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) {
                    const next = auctionCatalogue[currentLotIndex];
                    auctionState = { currentLot: next.lotNumber, highestBid: next.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: next.weight };
                    io.emit('updateBid', auctionState);
                }
            }, 5000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
