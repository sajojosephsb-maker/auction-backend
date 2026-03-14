// ... (keep previous imports)

const spiceCatalog = [
    { 
        name: "LOT-102: Green Cardamom (Premium)", 
        startPrice: 1450,
        specs: {
            quantity: "15 Bags (750 kg)",
            moisture: "10.5%",
            size: "8mm+",
            color: "Deep Green",
            shape: "Bold/Oval",
            literWeight: "420g/L"
        }
    },
    { 
        name: "LOT-103: Black Pepper (TGSEB)", 
        startPrice: 650,
        specs: {
            quantity: "20 Bags (1000 kg)",
            moisture: "11.0%",
            size: "4.75mm",
            color: "Black",
            shape: "Round",
            literWeight: "550g/L"
        }
    }
];

let catalogIndex = 0;

let auctionState = {
    currentLot: spiceCatalog[0].name,
    highestBid: spiceCatalog[0].startPrice,
    highestBidder: "No Bids",
    bidHistory: [],
    timeLeft: 60,
    isEnded: false,
    specs: spiceCatalog[0].specs // Add this line
};

// ... (keep timer and connection logic)

    socket.on('adminNextLot', () => {
        catalogIndex = (catalogIndex + 1) % spiceCatalog.length;
        const nextItem = spiceCatalog[catalogIndex];

        auctionState = {
            currentLot: nextItem.name,
            highestBid: nextItem.startPrice,
            highestBidder: "No Bids",
            bidHistory: [],
            timeLeft: 60,
            isEnded: false,
            specs: nextItem.specs // Update this line
        };

        io.emit('updateBid', auctionState);
        // ...
    });
