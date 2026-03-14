const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
const GST_RATE = 0.05;
const COMMISSION_RATE = 0.01;

let lotHistory = [];
let approvedBuyers = {}; 
let buyerLedgers = {}; // Tracks { "DealerName": [ {lot, amount, date} ] }

let auctionState = {
    currentLot: "LOT-101: Bold Green Cardamom",
    highestBid: 1200,
    highestBidder: "No Bids",
    timeLeft: 60,
    isEnded: false,
    specs: { totalWeight: 600 }
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);
    socket.emit('updateLotHistory', lotHistory);

    socket.on('placeBid', (data) => {
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            if (auctionState.timeLeft < 10) auctionState.timeLeft = 10;
            io.emit('updateBid', auctionState);
        }
    });
});

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            const finalBid = auctionState.highestBid;
            const winner = auctionState.highestBidder;
            
            // Calculate Final Financials
            const bidValue = finalBid * auctionState.specs.totalWeight;
            const totalWithTax = (bidValue + (bidValue * COMMISSION_RATE)) * (1 + GST_RATE);

            // Update Ledger
            if (winner !== "No Bids") {
                if (!buyerLedgers[winner]) buyerLedgers[winner] = [];
                buyerLedgers[winner].push({
                    lot: auctionState.currentLot,
                    total: totalWithTax.toFixed(2),
                    date: new Date().toLocaleDateString()
                });
            }

            lotHistory.unshift({ lot: auctionState.currentLot, price: finalBid, bidder: winner });
            io.emit('updateLotHistory', lotHistory);
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Server Fixed & Live'); });
