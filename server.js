const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Database Connection
mongoose.connect("mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction")
    .then(() => console.log("🚀 MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: String,
    password: { type: String },
    role: { type: String },
    status: { type: String, default: 'active' }
}));

// 3. Unified Login Logic
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        try {
            const user = await User.findOne({ userId: loginId, password: password });

            if (user && user.status === 'active') {
                let target = ""; 
                // Redirect logic for all roles
                if (user.role === 'admin')   target = 'index.html';
                if (user.role === 'trader')  target = 'buyer.html';
                if (user.role === 'company') target = 'company-dashboard.html';
                if (user.role === 'quality') target = 'colour-check.html';
                if (user.role === 'planter') target = 'planter-portal.html';

                socket.emit('loginResponse', { success: true, target: target });
            } else {
                socket.emit('loginResponse', { success: false, message: "Invalid ID or Password" });
            }
        } catch (error) {
            socket.emit('loginResponse', { success: false, message: "Server Error" });
        }
    });
});

// 4. Start Server
const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log(`Server Live on Port ${PORT}`));
