const GST_RATE = 0.05;         // 5% GST
const COMMISSION_RATE = 0.01;  // 1% Buyer Commission

function generateFinancialReport() {
    let grandTotalQty = 0;
    let grandTotalValue = 0;

    const tableData = lotHistory.map(item => {
        const qty = 600; // Standard weight in Kg
        const bidValue = item.price * qty;
        
        const commission = bidValue * COMMISSION_RATE;
        const taxableValue = bidValue + commission;
        const gstAmount = taxableValue * GST_RATE;
        const netPayable = taxableValue + gstAmount;

        grandTotalQty += qty;
        grandTotalValue += netPayable;

        return {
            lot: item.lot,
            bidder: item.bidder,
            qty: qty,
            rate: item.price,
            commission: commission.toFixed(2),
            gst: gstAmount.toFixed(2),
            total: netPayable.toFixed(2)
        };
    });

    return { tableData, grandTotalQty, grandTotalValue };
}
