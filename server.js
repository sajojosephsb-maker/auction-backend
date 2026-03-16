const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// Fast DB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("🚀 Cloud DB Connected"));

const Sale = mongoose.model('Sale', new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number, date: { type: Date, default: Date.now } }));
const User = mongoose.model('User', new mongoose.Schema({ userId: String, name: String, isApproved: { type: Boolean, default: false } }));

let authorizedBidders = {}; 
let salesHistory = [];
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, videoUrl: "" };
let auctionCatalogue = [];
let currentLotIndex = 0;

// Instant Cache for Bidders
async function loadBidders() {
    const users = await User.find({ isApproved: true });
    users.forEach(u => authorizedBidders[u.userId] = u.name);
}
loadBidders();

// High-speed Socket Logic
io.on('connection', (socket) => {
    socket.emit('updateBid', { ...auctionState, history: salesHistory });

    socket.on('registerUser', async (data) => {
        const newId = "BID-" + Math.floor(1000 + Math.random() * 9000);
        await new User({ userId: newId, name: data.name }).save();
        socket.emit('registrationSuccess', { id: newId, name: data.name });
        io.emit('receiveChat', { user: "SYSTEM", msg: `New request from ${data.name}. Admin, please approve.` });
    });

    socket.on('approveUser', async (data) => {
        if (data.password === "spices_admin_2026") {
            await User.findOneAndUpdate({ userId: data.targetId }, { isApproved: true });
            loadBidders(); // Refresh cache
            const allUsers = await User.find();
            io.emit('userList', allUsers);
        }
    });

    socket.on('placeBid', (data) => {
        const name = authorizedBidders[data.userId];
        if (name && !auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = name;
            io.emit('playBidSound');
            io.emit('updateBid', { ...auctionState, history: salesHistory });
        }
    });

    socket.on('uploadCatalogue', (data) => {
        if (data.password === "spices_admin_2026") {
            auctionCatalogue = data.list; currentLotIndex = 0; startLot(0);
        }
    });
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { ...auctionState, currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: item.weight };
    io.emit('updateBid', auctionState);
}

setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const sale = { lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid, weight: auctionState.weight };
                salesHistory.unshift(sale); await new Sale(sale).save();
            }
            setTimeout(() => { currentLotIndex++; if(currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex); }, 3000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
