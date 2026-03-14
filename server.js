const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Cloud DB Connected"));

const SaleSchema = new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number, date: { type: Date, default: Date.now } });
const Sale = mongoose.model('Sale', SaleSchema);

const UserSchema = new mongoose.Schema({ userId: String, name: String, isApproved: { type: Boolean, default: false } });
const User = mongoose.model('User', UserSchema);

let authorizedBidders = {}; 
let salesHistory = [];
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true };
let auctionCatalogue = [];
let currentLotIndex = 0;

// Load approved users on start
async function loadApproved() {
    const users = await User.find({ isApproved: true });
    users.forEach(u => authorizedBidders[u.userId] = u.name);
}
loadApproved();

app.get('/download-report', async (req, res) => {
    const allSales = await Sale.find().sort({ date: -1 });
    let csv = "Lot,Buyer,Rate,Weight\n";
    allSales.forEach(s => csv += `${s.lot},${s.buyer},${s.rate},${s.weight}\n`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
});

io.on('connection', (socket) => {
    socket.emit('updateBid', { ...auctionState, history: salesHistory });

    socket.on('getUsers', async () => {
        const users = await User.find();
        socket.emit('userList', users);
    });

    socket.on('approveUser', async (data) => {
        if (data.password === "spices_admin_2026") {
            await User.findOneAndUpdate({ userId: data.targetId }, { isApproved: true });
            const u = await User.findOne({ userId: data.targetId });
            authorizedBidders[u.userId] = u.name;
            const users = await User.find();
            io.emit('userList', users); // Refresh list for admin
        }
    });

    socket.on('registerUser', async (data) => {
        const newId = "BID-" + Math.floor(100 + Math.random() * 900);
        await new User({ userId: newId, name: data.name, isApproved: false }).save();
        socket.emit('registrationSuccess', { id: newId, name: data.name });
    });

    socket.on('placeBid', (data) => {
        const bidderName = authorizedBidders[data.userId];
        if (bidderName && !auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = bidderName;
            io.emit('playBidSound'); 
            io.emit('updateBid', { ...auctionState, history: salesHistory });
        }
    });

    socket.on('uploadCatalogue', (data) => {
        if (data.password === "spices_admin_2026") {
            auctionCatalogue = data.list; currentLotIndex = 0; startLot(0);
        }
    });
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { ...auctionState, currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: item.weight };
    io.emit('updateBid', auctionState);
}

setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const sale = { lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid, weight: auctionState.weight };
                salesHistory.unshift(sale); await new Sale(sale).save();
            }
            setTimeout(() => { currentLotIndex++; if (currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex); }, 3000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
