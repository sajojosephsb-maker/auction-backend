// Add this near the top of server.js
let authorizedBidders = { 
    "BID-001": "Sajo Joseph", 
    "BID-002": "Puttady Trader",
    "BID-003": "Spice King"
};

// Add this route BEFORE http.listen
app.get('/download-report', async (req, res) => {
    try {
        const allSales = await Sale.find().sort({ date: -1 });
        let csv = "Lot,Buyer,Rate,Weight,Total\n";
        allSales.forEach(s => {
            csv += `${s.lot},${s.buyer},${s.rate},${s.weight || 0},${((s.rate || 0) * (s.weight || 0)).toFixed(2)}\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=auction_report.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).send("Error generating report");
    }
});
