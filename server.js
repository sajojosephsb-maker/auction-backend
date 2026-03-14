let lotIndex = 0;
let autoNextTimeout = null;

// Function to trigger the next lot
const startNextLot = () => {
    if (lotIndex < spiceCatalog.length - 1) {
        lotIndex++;
        auctionState = {
            ...spiceCatalog[lotIndex],
            highestBid: spiceCatalog[lotIndex].startPrice,
            highestBidder: "No Bids",
            timeLeft: 60,
            isEnded: false
        };
        io.emit('updateBid', auctionState);
        console.log(`Started: ${auctionState.currentLot}`);
    } else {
        io.emit('error', 'All lots for this session have been completed.');
    }
};

// Modified Timer Loop
setInterval(() => {
    if (auctionState.timeLeft > 0 && !auctionState.isEnded) {
        auctionState.timeLeft--;
        io.emit('timerUpdate', auctionState.timeLeft);
        
        if (auctionState.timeLeft === 0) {
            auctionState.isEnded = true;
            io.emit('auctionEnded', auctionState);

            // AUTO-NEXT LOGIC: Start next lot in 30 seconds
            console.log("Lot sold. Auto-next in 30s...");
            autoNextTimeout = setTimeout(startNextLot, 30000); 
        }
    }
}, 1000);

// Update Admin Action to clear timeout if you manual-click
socket.on('adminAction', (data) => {
    if (data.password === ADMIN_PASSWORD && data.action === 'next') {
        clearTimeout(autoNextTimeout);
        startNextLot();
    }
});
