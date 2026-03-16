const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// 1. Connect to MongoDB
mongoose.connect("mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction")
    .then(() => console.log("🚀 MongoDB Connected"));

// 2. Define User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: String,
    phone: String,
    password: { type: String },
    role: { type: String },
    status: { type: String, default: 'active' }
}));

// 3. Central Login Gateway Logic
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        const user = await User.findOne({ 
            $or: [{ userId: loginId }, { phone: loginId }], 
            password: password 
        });

        if (user && user.status === 'active') {
            let target = ""; 
            if (user.role === 'admin')   target = 'index.html';
            if (user.role === 'company') target = 'company-dashboard.html';
            if (user.role === 'quality') target = 'colour-check.html';
            if (user.role === 'trader')  target = 'buyer.html';
            if (user.role === 'planter') target = 'planter-portal.html';

            socket.emit('loginResponse', { success: true, target: target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });
});

// 4. Start Server
http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
