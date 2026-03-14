const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// --- PASTE YOUR spiceCatalog AND auctionState HERE ---

http.listen(process.env.PORT || 10000, () => {
    console.log('Server is running...');
});
