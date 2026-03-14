const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("Cloud DB Connected")).catch(err => console.log(err));

const SaleSchema = new mongoose.Schema({
    lot: String, buyer: String, rate: Number, weight: Number, total: String, date: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SaleSchema);

const ADMIN_PASSWORD = "spices_admin_2026";
let auctionCatalogue = [];
let currentLotIndex = 0;
let auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };

// --- SEARCH ENGINE ROUTE ---
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const results = await Sale.aggregate([
            {
                $search: {
                    index: "default",
                    text: { query: query, path: ["lot", "buyer"], fuzzy: {} }
                }
            }
        ]);
        res.json(results);
    } catch (e) { res.json([]); }
});

// --- AUCTION LOGIC ---
io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);
    socket.on('adminAction', (data) => {
        if (data.password === ADMIN_PASSWORD) auctionState.timeLeft = 0;
    });
    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.list;
            currentLotIndex = 0;
            startLot(0);
        }
    });
});

function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { currentLot: item.lotNumber, highestBid: item.startPrice, highestBidder: "No Bids", timeLeft: 60, isEnded: false, weight: item.weight };
    io.emit('updateBid', auctionState);
}

setInterval(async () => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                await new Sale({ lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid, weight: auctionState.weight, total: (auctionState.highestBid * auctionState.weight).toFixed(2) }).save();
            }
            setTimeout(() => {
                currentLotIndex++;
                if (currentLotIndex < auctionCatalogue.length) startLot(currentLotIndex);
            }, 3000);
        }
        io.emit('updateBid', auctionState);
    }
}, 1000);

http.listen(process.env.PORT || 10000);
