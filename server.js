let auctionCatalogue = []; // Stores the full list of uploaded lots

let auctionState = {
    currentLot: "LOT-100",
    highestBid: 0,
    highestBidder: "No Bids",
    timeLeft: 0,
    isEnded: true,
    status: "CLOSED",
    details: {} // This will now store your specific Cardamom specs
};

io.on('connection', (socket) => {
    // Listener to receive the full catalogue from Admin
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.lots;
            console.log(`${auctionCatalogue.length} Lots Uploaded`);
        }
    });

    // Start Lot now pulls data from the catalogue
    socket.on('startLotByIndex', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            const lot = auctionCatalogue[data.index];
            auctionState = {
                currentLot: lot.lotNumber,
                highestBid: lot.auctionStartPrice,
                highestBidder: "No Bids",
                timeLeft: 60,
                isEnded: false,
                status: "LIVE",
                details: lot // All your specs (Moisture, Litre Weight, etc.)
            };
            io.emit('updateBid', auctionState);
        }
    });
});
