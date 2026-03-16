const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// Database Connection
mongoose.connect("mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction")
    .then(() => console.log("🚀 MongoDB Connected"));

// Expanded User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: String,
    status: { type: String, default: 'active' }
}));

io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        try {
            // Support both ID and Phone
            const user = await User.findOne({ 
                $or: [{ userId: loginId }, { phone: loginId }], 
                password: password 
            });

            if (user && user.status === 'active') {
                const routes = {
                    admin: 'index.html',
                    trader: 'buyer.html',
                    company: 'company-dashboard.html',
                    quality: 'colour-check.html',
                    planter: 'planter-portal.html'
                };
                
                socket.emit('loginResponse', { 
                    success: true, 
                    target: routes[user.role],
                    user: { name: user.name, role: user.role } 
                });
            } else {
                socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
            }
        } catch (err) {
            socket.emit('loginResponse', { success: false, message: "Server Error. Try again." });
        }
    });
});

http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
