const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: { 
        origin: "https://sajojosephsb-maker.github.io",
        methods: ["GET", "POST"]
    }
});

// Track the state and the last 5 bids
let auctionState = {
    currentLot: "LOT-102 (Green Cardamom)",
    highestBid: 1450,
    highestBidder: "None",
    bidHistory: [] 
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('placeBid', (data) => {
        if (data.amount > auctionState.highestBid) {
            const bidderName = "Buyer_" + Math.floor(Math.random() * 900 + 100);
            
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = bidderName;

            // Add to history and keep only the last 5
            auctionState.bidHistory.unshift({
                amount: data.amount,
                bidder: bidderName,
                time: new Date().toLocaleTimeString()
            });
            if (auctionState.bidHistory.length > 5) auctionState.bidHistory.pop();
            
            io.emit('updateBid', auctionState);
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
