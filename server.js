// Add this near your other auctionState variables
let sessionPriceHistory = []; 

io.on('connection', (socket) => {
    // Send history to new users so they see the full chart
    socket.emit('updateHistory', sessionPriceHistory);

    // ... inside the timer completion logic (when auctionState.timeLeft === 0)
    if (!auctionState.isEnded) {
        auctionState.isEnded = true;
        
        // Save the result to our session history
        sessionPriceHistory.push({
            label: auctionState.currentLot.split(":")[0], // e.g., "LOT-102"
            price: auctionState.highestBid
        });

        io.emit('auctionEnded', auctionState);
        io.emit('updateHistory', sessionPriceHistory); // Broadcast the new data point
    }
});
