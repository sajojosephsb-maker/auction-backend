require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("✅ Database connected successfully"));

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: 'active' }
}));

// 3. Login Logic
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        try {
            const user = await User.findOne({ userId: loginId, password: password });
            if (user && user.status === 'active') {
                const routes = {
                    admin: 'index.html',
                    trader: 'buyer.html',
                    planter: 'planter-portal.html'
                };
                socket.emit('loginResponse', { success: true, target: routes[user.role] });
            } else {
                socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
            }
        } catch (err) {
            socket.emit('loginResponse', { success: false, message: "Server Error" });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
