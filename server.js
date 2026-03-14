const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// 1. Define your Catalog and State
const spiceCatalog = [ /* ... your lots ... */ ];
let auctionState = { /* ... current state ... */ };

// 2. Wrap all socket logic INSIDE the connection handler
io.on('connection', (socket) => {
    console.log('A buyer connected');

    socket.on('placeBid', (data) => {
        // ... (Credit limit & Bidding logic)
    });

    socket.on('adminAction', (data) => {
        // ... (Password & Next Lot logic)
    });
});

// 3. Start the server
http.listen(process.env.PORT || 10000, () => {
    console.log('Server running on port 10000');
});
