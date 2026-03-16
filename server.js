const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. DATABASE CONNECTION
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// 2. USER SCHEMA (Includes Status)
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    status: { type: String, default: 'active' }, // active, blocked, banned
    role: { type: String, default: 'trader' }
});
const User = mongoose.model('User', UserSchema);

// 3. LOGIC
io.on('connection', (socket) => {
    // LOGIN ATTEMPT
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        if (user && user.status === 'active') {
            socket.emit('loginResponse', { success: true, userId: user.userId });
        } else {
            const msg = user ? `Account is ${user.status}` : "Invalid Credentials";
            socket.emit('loginResponse', { success: false, message: msg });
        }
    });

    // SECURE BIDDING
    socket.on('placeBid', async (data) => {
        const user = await User.findOne({ userId: data.userId });
        if (user && user.status === 'active') {
            // ... (Your Auction Bidding Logic Here) ...
            io.emit('updateBid', auctionState);
        } else {
            socket.emit('error', 'Unauthorized or Blocked');
        }
    });

    // ADMIN CONTROLS (Create/Block/Delete)
    socket.on('createTrader', async (data) => {
        try {
            await new User({ userId: data.traderId, password: data.traderPassword }).save();
            const traders = await User.find({ role: 'trader' });
            io.emit('traderListUpdate', traders);
        } catch (e) { socket.emit('error', 'ID Exists'); }
    });
});

http.listen(process.env.PORT || 10000);
