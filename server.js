const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 

let auctionState = {
    currentLot: "IDLE",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    weight: 600
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        
        if (data.action === 'EXPORT_DATA') {
            socket.emit('downloadExcel', allTransactions);
        } else if (data.action === 'ACCEPT') {
            auctionState.timeLeft = 0;
        }
        // ... (Include other actions like START, RERUN, WITHDRAW, etc.)
        io.emit('updateBid', auctionState);
    });

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            if (auctionState.highestBidder !== "No Bids") {
                const base = auctionState.highestBid * auctionState.weight;
                allTransactions.push({
                    Date: new Date().toLocaleDateString(),
                    Lot: auctionState.currentLot,
                    Buyer: auctionState.highestBidder,
                    Rate: auctionState.highestBid,
                    Total: (base * 1.01 * 1.05).toFixed(2)
                });
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Master Engine Live'); });
