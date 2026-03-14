const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Allow connections from your GitHub Pages site
const io = new Server(server, {
    cors: { 
        origin: "https://sajojosephsb-maker.github.io",
        methods: ["GET", "POST"]
    }
});

let auctionState = {
    currentLot: "LOT-102 (Green Cardamom)",
    highestBid: 1450,
    highestBidder: "None"
};

io.on('connection', (socket) => {
    console.log('A buyer connected:', socket.id);
    
    // Send current state to the new user
    socket.emit('updateBid', auctionState);

    // Listen for new bids
    socket.on('placeBid', (data) => {
        if (data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = "Buyer_" + Math.floor(Math.random() * 1000); // Mock user ID
            
            // Broadcast the new highest bid to EVERYONE instantly
            io.emit('updateBid', auctionState);
        }
    });
});

// Use the port Render assigns, or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
