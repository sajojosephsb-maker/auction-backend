const GST_RATE = 0.05;
let sessionTotalQty = 0;
let sessionTotalValue = 0;
let sessionTotalWithTax = 0;

const tableData = lotHistory.map(item => {
    const qty = item.weight || 600; // Defaulting to your standard lot weight
    const totalValue = item.price * qty;
    const tax = totalValue * GST_RATE;
    const grandTotal = totalValue + tax;

    // Running Totals
    sessionTotalQty += qty;
    sessionTotalValue += totalValue;
    sessionTotalWithTax += grandTotal;

    return {
        lot: item.lot,
        bidder: item.bidder,
        qty: qty,
        rate: item.price,
        value: totalValue,
        gst: tax,
        total: grandTotal
    };
});
