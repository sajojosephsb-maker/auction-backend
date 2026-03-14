if (data.action === 'WITHDRAW_LOT') {
    auctionState.isEnded = true;
    auctionState.highestBidder = "WITHDRAWN";
    io.emit('updateBid', auctionState);
    io.emit('statusUpdate', { message: `Lot ${auctionState.currentLot} has been WITHDRAWN.` });
}
