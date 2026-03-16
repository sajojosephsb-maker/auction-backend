const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// MASTER SCHEMA FOR ALL HISTORY
const SaleSchema = new mongoose.Schema({
    lotNumber: String, planterId: String, traderId: String, companyId: String,
    finalPrice: Number, weight: Number, totalValue: Number,
    timestamp: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

io.on('connection', (socket) => {
    // Report Engine: Daily/Weekly/Monthly/Annual
    socket.on('getAdminReports', async (filter) => {
        let query = {};
        const now = new Date();
        if(filter.time === 'daily') query.timestamp = { $gte: new Date().setHours(0,0,0,0) };
        if(filter.time === 'weekly') query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        if(filter.time === 'monthly') query.timestamp = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        
        // Search by Trader/Planter/Company
        if(filter.searchId) {
            query.$or = [{ traderId: filter.searchId }, { planterId: filter.searchId }, { companyId: filter.searchId }];
        }

        const data = await Sale.find(query).sort({ timestamp: -1 });
        socket.emit('reportDataUpdate', data);
    });

    // Login for All Roles (Trader, Company, Planter, Quality)
    socket.on('attemptLogin', async ({ loginId, password }) => {
        // Logic to check roles and redirect to specific portals
        // ... (as provided in previous steps)
    });
});

http.listen(process.env.PORT || 10000);
