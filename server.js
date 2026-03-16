const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// Database Connection
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// User Schema (Includes Phone for Planters)
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: String,
    password: { type: String },
    role: { type: String }, // 'admin', 'trader', 'planter', 'company', 'quality'
    status: { type: String, default: 'active' }
}));

// Master Gateway Login Logic
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        // Search by ID (Admin/Trader/Co) or Phone (Planter)
        const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });

        if (user && user.status === 'active') {
            let destination = "buyer.html"; // Default
            if (user.role === 'admin')   destination = 'index.html';
            if (user.role === 'company') destination = 'company-dashboard.html';
            if (user.role === 'planter') destination = 'planter-portal.html';
            if (user.role === 'quality') destination = 'colour-check.html';

            socket.emit('loginResponse', { success: true, target: destination });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });
});

http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
