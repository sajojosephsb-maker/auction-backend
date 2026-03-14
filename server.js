// ... (inside your timer interval when timeLeft === 0)
} else if (!auctionState.isEnded) {
    auctionState.isEnded = true;
    
    // Create a 'win' object to send to the dashboard
    const winRecord = {
        lot: auctionState.currentLot,
        price: auctionState.highestBid,
        winner: auctionState.highestBidder,
        specs: auctionState.specs,
        date: new Date().toLocaleDateString()
    };
    
    io.emit('auctionEnded', winRecord);
    clearInterval(timerInterval);
}
