let winCounts = {}; // Track wins per bidder

// Inside your Timer Logic, when timeLeft === 0 and highestBidder exists:
if (auctionState.highestBidder !== "No Bids") {
    winCounts[auctionState.highestBidder] = (winCounts[auctionState.highestBidder] || 0) + 1;
    
    // Create leaderboard array
    const leaderboard = Object.keys(winCounts).map(name => ({
        name: name,
        lots: winCounts[name]
    })).sort((a, b) => b.lots - a.lots);

    // Send to everyone
    io.emit('updateBid', { ...auctionState, leaderboard });
}
