// ... (Inside your placeBid socket listener in server.js)
socket.on('placeBid', (data) => {
    // 1. Calculate the cost of the potential new win
    const potentialTotal = data.amount * auctionState.specs.totalWeight;
    
    // 2. Default Credit Limit: ₹10,00,000 (10 Lakhs)
    const creditLimit = 1000000;
    const currentSpent = data.currentSpent || 0;

    // Check if the buyer is over their limit
    if (currentSpent + potentialTotal > creditLimit) {
        socket.emit('error', 'Credit Limit Exceeded! Please contact the admin to increase your limit.');
        return;
    }

    // If limit is okay, proceed with the bid
    if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
        auctionState.highestBid = data.amount;
        auctionState.highestBidder = data.bidderName;
        auctionState.timeLeft = 60; // Reset timer
        // ... broadcast updates as before
        io.emit('updateBid', auctionState);
    }
});
