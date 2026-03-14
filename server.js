const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// Cloud Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected"));

// Define Record Schema
const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

const ADMIN_PASSWORD = "spices_admin_2026";
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", isEnded: true };

io.on('connection', (socket) => {
    // 1. Load History from Cloud on Login
    Sale.find().sort({date: -1}).limit(50).then(records => {
        socket.emit('initialResults', records);
    });

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        if (data.action === 'RESET_ALL') {
             // Optional: Clear cloud records for new season
             Sale.deleteMany({}).then(() => io.emit('dataCleared'));
        }
    });

    // 2. Save Sale to Cloud automatically when Auction Ends
    socket.on('auctionEnded', async (state) => {
        if (state.highestBidder !== "No Bids") {
            const newSale = new Sale({
                lot: state.currentLot,
                buyer: state.highestBidder,
                rate: state.highestBid,
                total: (state.highestBid * 600 * 1.06).toFixed(2) // Incl Tax/Comm
            });
            await newSale.save(); // Saved permanently in MongoDB
            io.emit('newResult', newSale);
        }
    });
});

http.listen(process.env.PORT || 10000, () => console.log('Cloud-Enabled Server Live'));
