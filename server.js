// Add this to your auction-end logic in server.js
if (auctionState.timeLeft === 0) {
    const qty = auctionState.specs.totalWeight || 600;
    const bidVal = auctionState.highestBid * qty;
    const comm = bidVal * 0.01;
    const gst = (bidVal + comm) * 0.05;

    const transaction = {
        date: new Date(), // Critical for Daily/Weekly/Monthly filtering
        lot: auctionState.currentLot,
        bidder: auctionState.highestBidder,
        rate: auctionState.highestBid,
        weight: qty,
        commission: comm,
        gst: gst,
        total: bidVal + comm + gst
    };

    allTransactions.push(transaction); // Save to the reporting engine
    io.emit('auctionEnded', auctionState);
}
