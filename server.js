// Schema for Sales/Auction History
const SalesSchema = new mongoose.Schema({
    auctionId: String,
    lotNumber: String,
    planterId: String,
    traderId: String,
    companyId: String,
    finalPrice: Number,
    weight: Number,
    totalValue: Number,
    timestamp: { type: Date, default: Date.now }
});
const Sale = mongoose.model('Sale', SalesSchema);

// Admin: Generate Multi-Dimension Reports
socket.on('getAdminReports', async (filter) => {
    let query = {};
    const now = new Date();
    
    // Time Filters
    if(filter.time === 'daily') query.timestamp = { $gte: new Date().setHours(0,0,0,0) };
    if(filter.time === 'weekly') query.timestamp = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    if(filter.time === 'monthly') query.timestamp = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    
    // Dimension Filters (Trader/Planter/Company/Auction)
    if(filter.traderId) query.traderId = filter.traderId;
    if(filter.planterId) query.planterId = filter.planterId;
    if(filter.companyId) query.companyId = filter.companyId;

    const data = await Sale.find(query).sort({ timestamp: -1 });
    socket.emit('reportDataUpdate', data);
});
