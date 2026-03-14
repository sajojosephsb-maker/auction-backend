const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
const GST_RATE = 0.05;
let lotHistory = [];
let approvedBuyers = {}; 

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

// Financial PDF Generation logic
function generateFinancialReport() {
    let sessionTotalQty = 0;
    let sessionTotalValue = 0;

    const tableData = lotHistory.map(item => {
        const qty = 600; // Standard weight
        const totalValue = item.price * qty;
        const tax = totalValue * GST_RATE;
        
        sessionTotalQty += qty;
        sessionTotalValue += (totalValue + tax);

        return {
            lot: item.lot,
            bidder: item.bidder,
            qty: qty,
            rate: item.price,
            gst: tax,
            total: totalValue + tax
        };
    });
    return { tableData, sessionTotalQty, sessionTotalValue };
}

setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            lotHistory.unshift({ lot: auctionState.currentLot, price: auctionState.highestBid, bidder: auctionState.highestBidder });
            io.emit('updateLotHistory', lotHistory);
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('Server Stable'); });
