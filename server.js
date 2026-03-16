const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// MASTER SCHEMA FOR HISTORY & REPORTS
const Sale = mongoose.model('Sale', new mongoose.Schema({
    lotNumber: String, planterId: String, traderId: String, companyId: String,
    finalPrice: Number, weight: Number, totalValue: Number,
    timestamp: { type: Date, default: Date.now }
}));

// LOGIN & REPORTING LOGIC
io.on('connection', (socket) => {
    socket.on('getAdminReports', async (filter) => {
        let query = {};
        const now = new Date();
        if(filter.time === 'daily') query.timestamp = { $gte: new Date().setHours(0,0,0,0) };
        if(filter.time === 'weekly') query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        if(filter.time === 'monthly') query.timestamp = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        if(filter.traderId) query.$or = [{ traderId: filter.traderId }, { planterId: filter.traderId }];

        const data = await Sale.find(query).sort({ timestamp: -1 });
        socket.emit('reportDataUpdate', data);
    });
});

// AUTOMATED DAILY EMAIL (8:00 PM)
cron.schedule('0 20 * * *', async () => {
    const today = new Date().setHours(0,0,0,0);
    const sales = await Sale.find({ timestamp: { $gte: today } });
    // ... (Nodemailer logic to send full report)
});

http.listen(process.env.PORT || 10000, () => console.log('Server Live'));
