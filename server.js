const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const ADMIN_PASSWORD = "spices_admin_2026";
let allTransactions = []; // This stores every single sale forever

io.on('connection', (socket) => {
    // Reporting Logic: Filter the allTransactions array
    socket.on('getReport', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        const now = new Date();
        let filtered = allTransactions;

        if (data.type === 'daily') {
            filtered = allTransactions.filter(t => new Date(t.date).toDateString() === now.toDateString());
        } else if (data.type === 'monthly') {
            filtered = allTransactions.filter(t => new Date(t.date).getMonth() === now.getMonth());
        } else if (data.type === 'trader') {
            filtered = allTransactions.filter(t => t.bidder === data.traderName);
        }

        socket.emit('reportData', { type: data.type, records: filtered });
    });

    // Auction logic... (Include your placeBid and Timer logic here)
});

http.listen(process.env.PORT || 10000, () => { console.log('Reporting Server Live'); });
