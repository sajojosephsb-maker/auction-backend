// Add these to your global variables in server.js
let sessionStats = {
    highestRate: 0,
    lowestRate: Infinity,
    totalWinningValue: 0,
    totalWinningKg: 0
};

// Update this inside your timer/auctionEnded logic
if (auctionState.timeLeft === 0) {
    const finalRate = auctionState.highestBid;
    const finalWeight = auctionState.specs.totalWeight;

    // Update High/Low Rates
    if (finalRate > sessionStats.highestRate) sessionStats.highestRate = finalRate;
    if (finalRate < sessionStats.lowestRate && finalRate > 0) sessionStats.lowestRate = finalRate;

    // Update for Average Calculation
    sessionStats.totalWinningValue += (finalRate * finalWeight);
    sessionStats.totalWinningKg += finalWeight;

    const auctionAverage = sessionStats.totalWinningValue / sessionStats.totalWinningKg;

    io.emit('updateGlobalStats', {
        high: sessionStats.highestRate,
        low: sessionStats.lowestRate === Infinity ? 0 : sessionStats.lowestRate,
        avg: auctionAverage.toFixed(2)
    });
}
