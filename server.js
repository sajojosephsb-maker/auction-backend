// New Schema to handle the 25+ fields you requested
const LotSchema = new mongoose.Schema({
    lotNumber: String, collectionCentre: String, type: String, ownerName: String, 
    idNumber: String, receiptNumber: String, qtyWithBag: Number, qtyWithoutBag: Number,
    literWeight: Number, bags: Number, gradeType: String, grade: String,
    reservedPrice: Number, startPrice: Number, immature: Number, moisture: Number,
    mobile: String, special: String, colour: String, size: String, split: String,
    bankName: String, branch: String, accountNo: String, ifsc: String,
    buyer: { type: String, default: "No Bids" }, rate: { type: Number, default: 0 }
});

const Sale = mongoose.model('Sale', LotSchema);

// Update startLot to include ALL metadata
function startLot(index) {
    const item = auctionCatalogue[index];
    auctionState = { 
        ...auctionState, 
        ...item, // This spreads all 25+ fields into the state
        timeLeft: 60, 
        isEnded: false 
    };
    io.emit('updateBid', auctionState);
}
