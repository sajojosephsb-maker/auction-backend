// ... inside the auction end logic in server.js
if (auctionState.highestBidder !== "No Bids") {
    const saleData = { ...auctionState, buyer: auctionState.highestBidder, rate: auctionState.highestBid };
    salesHistory.unshift(saleData); 
    await new Sale(saleData).save();

    // TRIGGER SMS LOGIC
    if (saleData.mobile) {
        console.log(`Sending SMS to ${saleData.mobile}: Lot ${saleData.lotNumber} sold at ₹${saleData.rate}/kg.`);
        // To make this live, you would call an API like:
        // fetch(`https://api.sms-service.com/send?to=${saleData.mobile}&msg=Your Lot ${saleData.lotNumber} sold at Rs.${saleData.rate}`);
    }
}
