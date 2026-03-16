const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected for 25-Field ERP"));

// 2. DATA SCHEMA (Matches your 25 columns)
const LotSchema = new mongoose.Schema({
    lotNumber: String, collectionCentre: String, type: String, ownerName: String, 
    idNumber: String, receiptNumber: String, qtyWithBag: Number, qtyWithoutBag: Number,
    literWeight: Number, bags: Number, gradeType: String, grade: String,
    reservedPrice: Number, startPrice: Number, immature: Number, moisture: Number,
    mobile: String, special: String, colour: String, size: String, split: String,
    bankName: String, branch: String, accountNo: String, ifsc: String,
    buyer: { type: String, default: "No Bids" }, rate: { type: Number, default: 0 }
});
const Sale = mongoose.model('Sale', LotSchema);

let auctionCatalogue = [];
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", isEnded: true };

// 3. SERVER LOGIC
io.on('connection', (socket) => {
    console.log("Admin or User Connected");
    socket.emit('updateBid', auctionState);

    // Upload & Confirm Logic
    socket.on('uploadCatalogue', async (data) => {
        if (data.password === "spices_admin_2026") {
            auctionCatalogue = data.list;
            console.log(`✅ Received ${auctionCatalogue.length} lots from Admin`);
            io.emit('catalogUpdate', { count: auctionCatalogue.length });
        }
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.userId;
            io.emit('updateBid', auctionState);
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
