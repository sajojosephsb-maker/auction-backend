const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Cloud DB Connected"));

const SaleSchema = new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number, date: { type: Date, default: Date.now } });
const Sale = mongoose.model('Sale', SaleSchema);

let authorizedBidders = { "BID-001": "Sajo Joseph", "BID-002": "Puttady Trader", "BID-003": "Spice King" };
let salesHistory = [];
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, videoUrl: "" };
let auctionCatalogue = [];
let currentLotIndex = 0;

// 📥 FIXED REPORT ROUTE
app.get('/download-report', async (req, res) => {
    const allSales = await Sale.find().sort({ date: -1 });
    let csv = "Lot,Buyer,Rate,Weight,Total\n";
    allSales.forEach(s => csv += `${s.lot},${s.buyer},${s.rate},${s.weight || 0},${(s.rate * (s.weight || 0)).toFixed(2)}\n`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
});

io.on('connection', (socket) => {
    socket.emit('updateBid', { ...auctionState, history: salesHistory });

    // 💬 CHAT LOGIC
    socket.on('sendChat', (data) => {
        const sender = authorizedBidders[data.userId] || "Admin";
        io.emit('receiveChat', { user: sender, msg: data.msg });
    });

    // 🔍 SEARCH LOGIC
    socket.on('searchLot', (lotNum) => {
        const found = auctionCatalogue.find(item => item.lotNumber === lotNum);
        socket.emit('searchResult', found || { error: "Lot not found" });
    });

    socket.on('uploadCatalogue', (data) => {
        if (data.password === "spices_admin_2026") {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            startLot(0);
        }
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
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { ...auctionState, currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: item.weight };
    io.emit('updateBid', { ...auctionState, history: salesHistory });
}

setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const newSale = { lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid, weight: auctionState.weight };
                salesHistory.unshift(newSale);
                await new Sale(newSale).save();
            }
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex);
            }, 3000);
        }
        io.emit('updateBid', { ...auctionState, history: salesHistory });
    }
}, 1000);

http.listen(process.env.PORT || 10000);
