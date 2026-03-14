// Add these to your existing server.js variables
let auctionCatalogue = []; 
let finalReport = [];

io.on('connection', (socket) => {
    // 1. Bulk Upload Catalogue
    socket.on('uploadCatalogue', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            auctionCatalogue = data.list; // Array of lot objects from CSV
            io.emit('catalogueUpdated', { count: auctionCatalogue.length });
        }
    });

    // 2. Collect Final Data for Report
    socket.on('auctionEnded', (state) => {
        if (state.highestBidder !== "No Bids") {
            const base = state.highestBid * state.weight;
            const comm = base * 0.01;
            const gst = (base + comm) * 0.05;
            
            finalReport.push({
                Lot: state.currentLot,
                Buyer: state.highestBidder,
                Rate: state.highestBid,
                Weight: state.weight,
                BasePrice: base.toFixed(2),
                Commission: comm.toFixed(2),
                GST: gst.toFixed(2),
                GrandTotal: (base + comm + gst).toFixed(2),
                Time: new Date().toLocaleTimeString()
            });
        }
    });

    // 3. Request Final Report
    socket.on('requestFullReport', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            socket.emit('downloadFullCSV', finalReport);
        }
    });
});
