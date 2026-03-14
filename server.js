const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// All your spiceCatalog, auctionState, and socket.on logic goes here...

http.listen(process.env.PORT || 10000, () => {
    console.log('Server running on port 10000');
});
