socket.on('adminAction', (data) => {
    if (data.password === "spices_admin_2026") {
        if (data.action === 'RESET_ALL') {
            // Clear everything
            salesHistory = [];
            winCounts = {};
            auctionState = { currentLot: "IDLE", highestBid: 0, highestBidder: "No Bids", timeLeft: 0, isEnded: true, weight: 0 };
            io.emit('updateBid', { ...auctionState, history: [] });
        } else {
            // Default "Next Lot" logic (force timer to 0)
            auctionState.timeLeft = 0;
        }
    }
});
