// Add this to your global variables
let lotHistory = [];

// Inside your timer/sold logic in server.js:
if (auctionState.timeLeft === 0) {
    auctionState.isEnded = true;
    
    const completedLot = {
        lot: auctionState.currentLot,
        price: auctionState.highestBid,
        bidder: auctionState.highestBidder
    };

    lotHistory.unshift(completedLot); // Add to the start of the list
    if (lotHistory.length > 5) lotHistory.pop(); // Keep only last 5

    io.emit('updateLotHistory', lotHistory);
    io.emit('auctionEnded', auctionState);
}
