const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { 
    cors: { origin: "*" } 
});

// Middleware
app.use(cors());
app.use(express.json());

// 1. Database Connection
// Ensure DATABASE_URL is in Render -> Environment
const mongoURI = process.env.DATABASE_URL || "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Force exit so Render knows it failed
    });

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: 'active' }
}));

// 3. Role-Based Routing Logic
const routes = {
    admin: 'index.html',
    trader: 'buyer.html',
    planter: 'planter-portal.html',
    company: 'company-dashboard.html',
    quality: 'colour-check.html'
};

// 4. Socket.io Logic
io.on('connection', (socket) => {
    console.log("🔌 New Client Connected:", socket.id);

    socket.on('attemptLogin', async ({ loginId, password }) => {
        try {
            const user = await User.findOne({ userId: loginId, password: password });
            
            if (user && user.status === 'active') {
                socket.emit('loginResponse', { 
                    success: true, 
                    target: routes[user.role] || 'login.html',
                    user: { userId: user.userId, role: user.role }
                });
            } else {
                socket.emit('loginResponse', { 
                    success: false, 
                    message: "Invalid credentials or inactive account." 
                });
            }
        } catch (err) {
            socket.emit('loginResponse', { success: false, message: "Server Error" });
        }
    });
});

// 5. Start Server
const PORT = process.env.PORT || 10000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
