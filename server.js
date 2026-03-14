// ... (inside the placeBid socket listener in server.js)
socket.on('placeBid', (data) => {
    // 1. Calculate value of the CURRENT lot being bid on
    const currentLotValue = data.amount * auctionState.specs.totalWeight;
    
    // 2. Add the value of all lots ALREADY won today
    const sessionTotalSpent = data.currentSpent || 0;
    const grandTotal = sessionTotalSpent + currentLotValue;

    // 3. Financial Safety: 10 Lakh Session Limit
    const creditLimit = 1000000; 

    if (grandTotal > creditLimit) {
        socket.emit('error', `Bidding Blocked! This bid would bring your session total to ₹${grandTotal.toLocaleString('en-IN')}, exceeding your ₹10L limit.`);
        return;
    }

    // Accept bid if within limit
    if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
        auctionState.highestBid = data.amount;
        auctionState.highestBidder = data.bidderName;
        auctionState.timeLeft = 60;
        io.emit('updateBid', auctionState);
    }
});
