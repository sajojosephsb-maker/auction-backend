// Inside startLotByIndex logic
const remainingLots = auctionCatalogue.length - (data.index + 1);

if (remainingLots <= 5 && remainingLots > 0) {
    socket.emit('inventoryAlert', { 
        count: remainingLots, 
        message: `⚠️ WARNING: Only ${remainingLots} lots remaining in the catalogue!` 
    });
} else if (remainingLots === 0) {
    socket.emit('inventoryAlert', { 
        count: 0, 
        message: "🚨 FINAL LOT: Catalogue is now empty. Please upload more lots." 
    });
}
