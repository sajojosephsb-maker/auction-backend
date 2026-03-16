const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

// DATABASE CONNECTION
const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// HISTORY SCHEMA
const QualityHistorySchema = new mongoose.Schema({
    lotNumber: String,
    planterId: String,
    phone: String,
    status: String, // 'Passed' or 'Artificially Coloured'
    parameters: { moisture: Number, weight: Number },
    timestamp: { type: Date, default: Date.now }
});
const QualityHistory = mongoose.model('QualityHistory', QualityHistorySchema);

io.on('connection', (socket) => {
    // Save Record to History
    socket.on('submitQualityReport', async (data) => {
        const record = new QualityHistory({
            lotNumber: data.lotNo,
            planterId: data.planterName,
            status: data.isColoured ? 'Artificially Coloured' : 'Passed',
            parameters: data.params
        });
        await record.save();
        
        // Notify Admin & Planter
        io.emit('newHistoryRecord', record);
        socket.emit('status', { success: true, msg: "Record Saved to History" });
    });

    // Fetch History for Planter
    socket.on('getPlanterHistory', async (phone) => {
        const history = await QualityHistory.find({ phone: phone }).sort({ timestamp: -1 });
        socket.emit('planterHistoryData', history);
    });
});

http.listen(process.env.PORT || 10000);
