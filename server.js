// ... inside your spiceCatalog array
{ 
    name: "LOT-102: Green Cardamom (Premium)", 
    startPrice: 1450,
    specs: {
        bags: 10,
        totalWeight: 500, // in Kgs
        moisture: "10.5%",
        size: "8mm+",
        // ... (keep other specs)
    }
}

// ... inside your placeBid socket listener
socket.on('placeBid', (data) => {
    if (!auctionState.isEnded && data.amount > auctionState.highestBid) {
        auctionState.highestBid = data.amount;
        // Calculate the total value immediately
        auctionState.totalValue = auctionState.highestBid * auctionState.specs.totalWeight;
        
        // ... (keep the rest of your broadcast logic)
    }
});
