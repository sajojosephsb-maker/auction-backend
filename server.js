const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("🚀 Multi-Role System Live"));

const User = mongoose.model('User', new mongoose.Schema({ 
    userId: String, name: String, role: String, isApproved: { type: Boolean, default: false } 
}));
const Sale = mongoose.model('Sale', new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number, quality: Object }));

let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, videoUrl: "" };
let authorizedBidders = {};

// Load Users into Memory for Speed
async function loadUsers() {
    const users = await User.find({ isApproved: true });
    users.forEach(u => authorizedBidders[u.userId] = { name: u.name, role: u.role });
}
loadUsers();

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // Dynamic Login Logic
    socket.on('login', async (data) => {
        const user = await User.findOne({ userId: data.userId, isApproved: true });
        if (user) socket.emit('loginSuccess', { role: user.role, name: user.name });
        else socket.emit('loginError', "Unauthorized or Pending Approval");
    });

    // Lab/Colour Center: Update Quality
    socket.on('updateQuality', async (data) => {
        if (authorizedBidders[data.userId]?.role === 'lab') {
            io.emit('qualityUpdate', data.quality);
        }
    });

    socket.on('placeBid', (data) => {
        const bidder = authorizedBidders[data.userId];
        if (bidder?.role === 'trader' && !auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = bidder.name;
            io.emit('updateBid', auctionState);
        }
    });
});

http.listen(process.env.PORT || 10000);
