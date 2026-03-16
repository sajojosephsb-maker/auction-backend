const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// SCHEMAS
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: String,
    password: { type: String },
    role: { type: String }, // 'trader', 'company', 'planter', 'quality'
    status: { type: String, default: 'active' }
}));

const Sale = mongoose.model('Sale', new mongoose.Schema({
    lotNumber: String, planterId: String, traderId: String, companyId: String,
    finalPrice: Number, weight: Number, totalValue: Number,
    timestamp: { type: Date, default: Date.now }
}));

// LOGIN & REPORTING LOGIC
io.on('connection', (socket) => {
    socket.on('attemptLogin', async ({ loginId, password }) => {
        const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });
        if (user && user.status === 'active') {
            let target = "buyer.html"; // Default Trader
            if (user.role === 'company') target = 'company-dashboard.html';
            if (user.role === 'planter') target = 'planter-portal.html';
            if (user.role === 'quality') target = 'colour-check.html';
            socket.emit('loginResponse', { success: true, userId: user.userId, target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
        }
    });

    socket.on('getAdminReports', async (filter) => {
        let query = {};
        const now = new Date();
        if(filter.time === 'daily') query.timestamp = { $gte: new Date().setHours(0,0,0,0) };
        if(filter.time === 'weekly') query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        if(filter.time === 'monthly') query.timestamp = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        if(filter.searchId) query.$or = [{ traderId: filter.searchId }, { planterId: filter.searchId }];

        const data = await Sale.find(query).sort({ timestamp: -1 });
        socket.emit('reportDataUpdate', data);
    });
});

http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
