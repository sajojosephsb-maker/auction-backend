const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// DATABASE CONNECTION
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// DATA SCHEMA
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

io.on('connection', (socket) => {
    console.log("Connected");

    // SIMPLE DEV LOGIN & UPLOAD
    socket.on('uploadCatalogue', async (data) => {
        if (data.password === "1234") { // Simple password as requested
            auctionCatalogue = data.list;
            await Sale.deleteMany({}); // Clear old test data
            await Sale.insertMany(data.list);
            console.log(`✅ Received & Saved ${data.list.length} lots`);
            io.emit('catalogUpdate', { count: data.list.length });
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
