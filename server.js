const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Connect to Cloud Database
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected")).catch(err => console.log("DB Error:", err));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

// 2. Global Auction Variables
const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let currentLotIndex = 0;
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };

// 3. Server Logic (Sockets)
io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState); // Send current state to new users

    // Handle Admin Clicking "Accept & Next"
    socket.on('adminAction', async (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        if (data.action === 'ACCEPT_AND_NEXT') {
            auctionState.timeLeft = 0; // Forces the timer to hit 0 and save immediately
        }
    });

    // Handle Quick Bids and Normal Bids
    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState); // Broadcast new price to everyone
        }
    });
    
    // Handle CSV Uploads (Future feature)
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            const first = auctionCatalogue[0];
            auctionState = { currentLot: first.lotNumber, highestBid: first.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: first.weight };
            io.emit('updateBid', auctionState);
        }
    });
});

// 4. THE TIMER ENGINE (Counts down every 1 second)
setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        
        // When timer hits 0 (or Admin clicks Accept)
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            
            // Save to MongoDB if someone bought it
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
            
            // Wait 5 seconds, then load the next lot automatically
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) {
                    const next = auctionCatalogue[currentLotIndex];
                    auctionState = { currentLot: next.lotNumber, highestBid: next.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: next.weight };
                    io.emit('updateBid', auctionState);
                } else {
                    auctionState = { currentLot: "FINISHED", highestBid: 0, highestBidder: "Done", timeLeft: 0, isEnded: true, weight: 0 };
                    io.emit('updateBid', auctionState);
                }
            }, 5000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

// 5. Start the Engine
http.listen(process.env.PORT || 10000);
