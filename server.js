const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. DATABASE CONNECTION
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// 2. USER SCHEMA (Includes Status for Blocking/Banning)
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    status: { type: String, default: 'active' }, // active, blocked, banned
    role: { type: String, default: 'trader' }
});
const User = mongoose.model('User', UserSchema);

// 3. LOT SCHEMA
const LotSchema = new mongoose.Schema({
    lotNumber: String, ownerName: String, qtyWithoutBag: Number, moisture: Number,
    status: { type: String, default: 'pending' }
});
const Sale = mongoose.model('Sale', LotSchema);

// 4. ADMIN & TRADER LOGIC
io.on('connection', (socket) => {
    console.log("User Connected");

    // Fetch initial trader list for Admin
    socket.on('getTraders', async () => {
        const traders = await User.find({ role: 'trader' });
        socket.emit('traderListUpdate', traders);
    });

    // Create Trader
    socket.on('createTrader', async (data) => {
        try {
            await new User({ userId: data.traderId, password: data.traderPassword }).save();
            const traders = await User.find({ role: 'trader' });
            io.emit('traderListUpdate', traders);
        } catch (e) { socket.emit('error', 'ID already exists'); }
    });

    // Block/Ban/Unblock Trader
    socket.on('updateTraderStatus', async ({ id, status }) => {
        await User.findOneAndUpdate({ userId: id }, { status: status });
        const traders = await User.find({ role: 'trader' });
        io.emit('traderListUpdate', traders);
    });

    // Delete Trader
    socket.on('deleteTrader', async (id) => {
        await User.findOneAndDelete({ userId: id });
        const traders = await User.find({ role: 'trader' });
        io.emit('traderListUpdate', traders);
    });

    // Login with Status Check
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        if (user && user.status === 'active') {
            socket.emit('loginResponse', { success: true, userId: user.userId, targetPage: 'buyer.html' });
        } else {
            socket.emit('loginResponse', { success: false, message: user ? "Account " + user.status : "Invalid credentials" });
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
