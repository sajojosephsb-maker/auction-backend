// ... inside your placeBid socket listener
socket.on('placeBid', (data) => {
    // ... (keep your credit limit logic)

    if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
        auctionState.highestBid = data.amount;
        auctionState.highestBidder = data.bidderName;

        // NEW: Set time limit to 10 seconds for rapid-fire bidding
        auctionState.timeLeft = 10; 
        
        io.emit('updateBid', auctionState);
        io.emit('timerUpdate', auctionState.timeLeft);
    }
});
