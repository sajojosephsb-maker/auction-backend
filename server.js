// Inside your io.on('connection')
socket.on('startLotByIndex', (data) => {
    if (data.password === ADMIN_PASSWORD) {
        const lot = auctionCatalogue[data.index];
        auctionState = {
            ...auctionState,
            currentLot: lot.lotNumber,
            highestBid: lot.auctionStartPrice,
            // Add images and specs for the mobile app
            imageUrl: lot.imageUrl || "default-cardamom.jpg",
            specs: {
                color: lot.colour,
                size: lot.size,
                moisture: lot.moisture
            }
        };
        io.emit('updateBid', auctionState);
    }
});
