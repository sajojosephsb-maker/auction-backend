const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://sajojosephsb_db_user:Spices2026!@cluster0.o3aaq1h.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI).then(() => console.log("🚀 Connected to MongoDB"));

const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    status: { type: String, default: 'active' }
});
const User = mongoose.model('User', UserSchema);

io.on('connection', (socket) => {
    socket.on('getTraders', async () => {
        const traders = await User.find({});
        socket.emit('traderListUpdate', traders);
    });

    socket.on('createTrader', async (data) => {
        try {
            await new User({ userId: data.traderId, password: data.traderPassword }).save();
            const traders = await User.find({});
            io.emit('traderListUpdate', traders);
            socket.emit('traderStatus', { success: true, msg: "Trader Added Successfully!" });
        } catch (e) {
            socket.emit('traderStatus', { success: false, msg: "Error: ID already exists." });
        }
    });

    socket.on('updateTraderStatus', async ({ id, status }) => {
        await User.findOneAndUpdate({ userId: id }, { status });
        const traders = await User.find({});
        io.emit('traderListUpdate', traders);
    });

    socket.on('deleteTrader', async (id) => {
        await User.findOneAndDelete({ userId: id });
        const traders = await User.find({});
        io.emit('traderListUpdate', traders);
    });
});

http.listen(process.env.PORT || 10000);
