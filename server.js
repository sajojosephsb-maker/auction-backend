// Add to your State Management
let biddingOpen = false; 

io.on('connection', (socket) => {
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;
        
        if (data.action === 'OPEN_BIDS') {
            biddingOpen = true;
            io.emit('statusUpdate', { message: "Bidding is now OPEN!" });
        } else if (data.action === 'CLOSE_BIDS') {
            biddingOpen = false;
            io.emit('statusUpdate', { message: "Bidding is CLOSED." });
        }
    });

    socket.on('placeBid', (data) => {
        // The lock check
        if (!biddingOpen) {
            return socket.emit('error', "Bidding is currently locked by Admin.");
        }
        
        if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
            auctionState.highestBid = data.amount;
            auctionState.highestBidder = data.bidderName;
            io.emit('updateBid', auctionState);
        }
    });
});
