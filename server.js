// Inside your io.on('connection')
socket.on('startLotByIndex', (data) => {
    if (data.password === ADMIN_PASSWORD) {
        const lot = auctionCatalogue[data.index];
        auctionState = {
            ...auctionState,
            currentLot: lot.lotNumber,
            highestBid: lot.auctionStartPrice,const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; 
let auctionCatalogue = []; // Your uploaded lots

let auctionState = {
    currentLot: "IDLE",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    weight: 0,
    planterMobile: ""
};

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('startLotByIndex', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            const lot = auctionCatalogue[data.index];
            auctionState = {
                currentLot: lot.lotNumber,
                highestBid: lot.auctionStartPrice,
                highestBidder: "No Bids",
                timeLeft: 60,
                isEnded: false,
                weight: lot.quantity,
                planterMobile: lot.planterMobileNumber // Captured from your format
            };
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
                // TRIGGER SMS LOGIC
                console.log(`Sending SMS to ${auctionState.planterMobile}: Lot ${auctionState.currentLot} sold at ₹${auctionState.highestBid}`);
                // In production, you would call an API like Twilio or Fast2SMS here
            }
            io.emit('auctionEnded', auctionState);
        }
    }
}, 1000);

http.listen(process.env.PORT || 10000, () => { console.log('SMS Master Engine Live'); });
            // Add images and specs for the mobile app
            imageUrl: lot.imageUrl || "default-cardamom.jpg",
            specs: {
                color: lot.colour,
                size: lot.size,
                moisture: lot.moisture
            }
        };
        io.emit('updateBid', auctionState);
    }
});
