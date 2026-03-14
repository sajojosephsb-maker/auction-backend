let currentLotIndex = 0; // Track which lot we are on

socket.on('adminAction', async (data) => {
    if (data.password !== ADMIN_PASSWORD) return;

    if (data.action === 'ACCEPT_AND_NEXT') {
        // 1. End current lot immediately
        auctionState.timeLeft = 0;
        auctionState.isEnded = true;
        
        // 2. Move to next lot after a 3-second delay (to show result)
        setTimeout(() => {
            currentLotIndex++;
            if (currentLotIndex < auctionCatalogue.length) {
                const nextLot = auctionCatalogue[currentLotIndex];
                auctionState = {
                    currentLot: nextLot.lotNumber,
                    highestBid: nextLot.startPrice,
                    highestBidder: "No Bids",
                    timeLeft: 60,
                    isEnded: false,
                    weight: nextLot.weight
                };
                io.emit('updateBid', auctionState);
                io.emit('statusUpdate', { message: `Moving to Lot ${nextLot.lotNumber}` });
            } else {
                io.emit('statusUpdate', { message: "Auction Catalogue Finished!" });
            }
        }, 3000); 
    }
});
