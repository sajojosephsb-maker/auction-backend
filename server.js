// Inside the setInterval timer when auctionState.timeLeft === 0
if (auctionState.highestBidder !== "No Bids") {
    const lotTotal = auctionState.highestBid * auctionState.weight;
    
    // Update spending for ranking
    currentSpending[auctionState.highestBidder] = (currentSpending[auctionState.highestBidder] || 0) + lotTotal;

    // Generate Top 5 Ranking
    const ranking = Object.entries(currentSpending)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    io.emit('updateRanking', ranking);
}
