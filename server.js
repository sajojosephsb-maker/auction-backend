const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let pendingBuyers = [];
let approvedBuyers = {};
let auctionState = { currentLot: "None", highestBid: 0, timeLeft: 0 };

// ... Paste your socket.on('adminAction') and other logic here ...

http.listen(process.env.PORT || 10000, () => {
    console.log('Server is live and stable.');
});
