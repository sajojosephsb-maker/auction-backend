io.on('connection', (socket) => {
    // Send current state and the full history
    socket.emit('updateBid', { ...auctionState, history: salesHistory });

    // 🏆 PERSONAL WIN HISTORY LOGIC
    socket.on('getMyWins', (userId) => {
        const bidderName = authorizedBidders[userId];
        const myWins = salesHistory.filter(s => s.buyer === bidderName);
        socket.emit('myWinsResult', myWins);
    });

    // ... (rest of your existing chat, search, and bid logic)
});
