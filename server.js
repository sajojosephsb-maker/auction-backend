const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// All variables and logic must be defined before the listeners
let auctionState = { /* your state */ };

io.on('connection', (socket) => {
    console.log('User connected');

    // Place ALL your socket.on('placeBid'), socket.on('adminAction'), etc. HERE
    socket.on('placeBid', (data) => {
        // bidding logic...
    });
});

// Final line to bind the port for Render
http.listen(process.env.PORT || 10000, () => {
    console.log('Server is live');
});
