const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// DATABASE CONNECTION
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// USER SCHEMA (Traders & Companies)
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    role: { type: String }, // 'trader' or 'company'
    status: { type: String, default: 'active' }
});
const User = mongoose.model('User', UserSchema);

io.on('connection', (socket) => {
    // Admin: Fetch all users
    socket.on('getUsers', async () => {
        const users = await User.find({});
        socket.emit('userListUpdate', users);
    });

    // Admin: Create Account (Trader or Company)
    socket.on('createAccount', async (data) => {
        try {
            await new User({ userId: data.userId, password: data.password, role: data.role }).save();
            const users = await User.find({});
            io.emit('userListUpdate', users);
            socket.emit('status', { success: true, msg: `${data.role} Created!` });
        } catch (e) {
            socket.emit('status', { success: false, msg: "ID already exists." });
        }
    });

    // Login Logic with Redirection
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        if (user && user.status === 'active') {
            let target = user.role === 'company' ? 'company-dashboard.html' : 'buyer.html';
            socket.emit('loginResponse', { success: true, userId: user.userId, target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Access Denied" });
        }
    });
});

http.listen(process.env.PORT || 10000);
