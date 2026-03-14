// ... (keep previous imports and setup)

io.on('connection', (socket) => {
    socket.emit('updateBid', auctionState);

    socket.on('adminNextLot', () => {
        // ... (keep previous nextLot logic)
    });

    socket.on('placeBid', (data) => {
        // Accept the bidderName sent from the frontend
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName || "Anonymous"; // Use the real name
            auctionState.timeLeft = 60; 

            auctionState.bidHistory.unshift({
                amount: data.amount,
                bidder: auctionState.highestBidder,
                time: new Date().toLocaleTimeString()
            });
            if (auctionState.bidHistory.length > 5) auctionState.bidHistory.pop();
            
            io.emit('updateBid', auctionState);
            io.emit('timerUpdate', auctionState.timeLeft);
        }
    });
});

// ... (keep server.listen)
