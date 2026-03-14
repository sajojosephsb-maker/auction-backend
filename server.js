const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// List of upcoming items
const spiceCatalog = [
    { name: "LOT-102: Green Cardamom (Premium)", startPrice: 1450 },
    { name: "LOT-103: Black Pepper (Malabar)", startPrice: 650 },
    { name: "LOT-104: Clove (Whole)", startPrice: 900 }
];

let catalogIndex = 0;

let auctionState = {
    currentLot: spiceCatalog[0].name,
    highestBid: spiceCatalog[0].startPrice,
    highestBidder: "No Bids",
    bidHistory: [],
    timeLeft: 60,
    isEnded: false
};

let timerInterval = null;

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (auctionState.timeLeft > 0) {
            auctionState.timeLeft--;
            io.emit('timerUpdate', auctionState.timeLeft);
        } else if (!auctionState.isEnded) {
            auctionState.isEnded = true;
            io.emit('auctionEnded', auctionState);
            clearInterval(timerInterval);
        }
    }, 1000);
}

startTimer();

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    // ADMIN ACTION: Reset for next item
    socket.on('adminNextLot', () => {
        catalogIndex = (catalogIndex + 1) % spiceCatalog.length; // Loop back to start
        const nextItem = spiceCatalog[catalogIndex];

        auctionState = {
            currentLot: nextItem.name,
            highestBid: nextItem.startPrice,
            highestBidder: "No Bids",
            bidHistory: [],
            timeLeft: 60,
            isEnded: false
        };

        io.emit('updateBid', auctionState);
        io.emit('timerUpdate', auctionState.timeLeft);
        startTimer();
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = "Buyer_" + Math.floor(Math.random() * 900);
            auctionState.timeLeft = 60; // Anti-sniping reset
            auctionState.bidHistory.unshift({
                amount: data.amount,
                bidder: auctionState.highestBidder,
                time: new Date().toLocaleTimeString()
            });
            if (auctionState.bidHistory.length > 5) auctionState.bidHistory.pop();
            io.emit('updateBid', auctionState);
        }
    });
});

server.listen(process.env.PORT || 10000);
