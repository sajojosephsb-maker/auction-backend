const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction");

const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    role: { type: String },
    status: { type: String }
}));

io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        const user = await User.findOne({ userId: loginId, password: password });
        if (user && user.status === 'active') {
            let target = ""; 
            if (user.role === 'admin')   target = 'index.html';
            if (user.role === 'company') target = 'company-dashboard.html';
            if (user.role === 'quality') target = 'colour-check.html';
            
            if (target) {
                socket.emit('loginResponse', { success: true, target: target });
            } else {
                socket.emit('loginResponse', { success: false, message: "Role Not Authorized for Gateway" });
            }
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });
});

http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
