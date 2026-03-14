// ... (inside the io.on('connection') block)

socket.on('placeBid', (data) => {
    // 1. Calculate the cost of the potential new win
    const potentialTotal = data.amount * auctionState.specs.totalWeight;
    
    // 2. Check the buyer's current 'Spent' amount (passed from frontend)
    const currentSpent = data.currentSpent || 0;
    const creditLimit = 1000000; // 10 Lakh Limit

    if (currentSpent + potentialTotal > creditLimit) {
        socket.emit('error', 'Credit Limit Exceeded! Please contact the admin.');
        return;
    }

    if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
        // ... (keep existing bid logic)
    }
});
