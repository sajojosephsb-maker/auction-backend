// Add this to your session data
let sessionTransactions = [];

// Inside your timer/auctionEnded logic:
if (auctionState.timeLeft === 0) {
    const totalValue = auctionState.highestBid * auctionState.specs.totalWeight;
    const commission = totalValue * 0.01; // Standard 1% Spice Board Commission

    const invoiceData = {
        lot: auctionState.currentLot,
        bidder: auctionState.highestBidder,
        price: auctionState.highestBid,
        weight: auctionState.specs.totalWeight,
        totalValue: totalValue,
        commission: commission,
        grandTotal: totalValue + commission
    };

    sessionTransactions.push(invoiceData);
    io.emit('newTransaction', invoiceData);
}
