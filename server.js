// Add this inside your timer (timeLeft === 0) block in server.js
if (auctionState.timeLeft === 0 && auctionState.highestBidder !== "No Bids") {
    const qty = auctionState.specs.totalWeight;
    const bidVal = auctionState.highestBid * qty;
    const netPayable = (bidVal + (bidVal * 0.01)) * 1.05;

    const alertMessage = `🚀 Lot Won! 
Lot: ${auctionState.currentLot}
Rate: ₹${auctionState.highestBid}
Net Payable: ₹${netPayable.toLocaleString('en-IN')}
Please check your Ledger for details.`;

    // Trigger the notification event
    io.emit('sendNotification', {
        target: auctionState.highestBidder,
        message: alertMessage
    });
}
