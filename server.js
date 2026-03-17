const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { 
    cors: { origin: "*" } 
});

app.use(express.json());

// 1. Database Connection
// Ensure DATABASE_URL is set in your Render Environment settings
const mongoURI = process.env.DATABASE_URL || "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/auction";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database connected successfully"))
    .catch(err => console.error("❌ Database connection error:", err));

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: 'active' }
}));

// 3. Define Gateway Routes
const routes = {
    admin: 'index.html',
    trader: 'buyer.html',
    planter: 'planter-portal.html',
    company: 'company-dashboard.html',
    quality: 'colour-check.html'
};

// 4. Socket.io Login Logic
io.on('connection', (socket) => {
    console.log("🔌 New client connected");

    socket.on('attemptLogin', async ({ loginId, password }) => {
        try {
            const user = await User.findOne({ userId: loginId, password: password });
            
            if (user && user.status === 'active') {
                const targetPage = routes[user.role] || 'login.html';
                console.log(`✅ Login successful: ${loginId} (${user.role})`);
                socket.emit('loginResponse', { 
                    success: true, 
                    target: targetPage 
                });
            } else {
                console.log(`❌ Login failed for: ${loginId}`);
                socket.emit('loginResponse', { 
                    success: false, 
                    message: "Invalid Credentials or Inactive Account" 
                });
            }
        } catch (err) {
            console.error("Internal Server Error:", err);
            socket.emit('loginResponse', { 
                success: false, 
                message: "Server Error. Please try again later." 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log("❌ Client disconnected");
    });
});

// 5. Start Server
const PORT = process.env.PORT || 10000;
http.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
