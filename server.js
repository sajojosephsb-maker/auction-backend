const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Database Connection
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: String,
    password: { type: String },
    role: { type: String }, // 'trader', 'company', 'planter', 'quality'
    status: { type: String, default: 'active' }
}));

// 3. Login & Report Engine
io.on('connection', (socket) => {
    // Universal Login Logic
    socket.on('attemptLogin', async ({ loginId, password }) => {
        const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });
        if (user && user.status === 'active') {
            let target = "buyer.html"; // Default
            if (user.role === 'company') target = 'company-dashboard.html';
            if (user.role === 'planter') target = 'planter-portal.html';
            if (user.role === 'quality') target = 'colour-check.html';
            socket.emit('loginResponse', { success: true, userId: user.userId, target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });

    // Admin Reports Logic
    socket.on('getAdminReports', async (filter) => {
        // Logic to fetch from a 'Sales' collection would go here
        socket.emit('reportDataUpdate', []); 
    });
});

// 4. Start Server
const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
