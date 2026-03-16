const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Connect to your MongoDB
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// 2. Define the User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: String,
    password: { type: String },
    role: { type: String }, // 'admin', 'trader', 'planter', 'company', 'quality'
    status: { type: String, default: 'active' }
}));

// 3. Central Login Gateway Logic
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        // Search by ID or Phone (for Planters)
        const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });

        if (user && user.status === 'active') {
            let target = "buyer.html"; // Default Trader
            if (user.role === 'admin')   target = 'index.html';
            if (user.role === 'company') target = 'company-dashboard.html';
            if (user.role === 'planter') target = 'planter-portal.html';
            if (user.role === 'quality') target = 'colour-check.html';

            socket.emit('loginResponse', { success: true, target: target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });
});

// 4. Start the Server
http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
