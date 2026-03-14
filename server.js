let salesHistory = []; // Add this at the top with other variables

// Inside your setInterval where timeLeft === 0:
if (auctionState.highestBidder !== "No Bids") {
    const saleData = { lot: auctionState.currentLot, buyer: auctionState.highestBidder, rate: auctionState.highestBid };
    salesHistory.unshift(saleData); // Add new sale to the beginning
    
    // Update the io.emit to include history
    io.emit('updateBid', { ...auctionState, history: salesHistory, leaderboard: leaderboard });
}
