// Add to your global variables
let sessionHistory = [];

// Function to generate the final report
const generateEODSummary = () => {
    const totalKg = sessionHistory.reduce((sum, lot) => sum + lot.weight, 0);
    const totalRevenue = sessionHistory.reduce((sum, lot) => sum + (lot.price * lot.weight), 0);
    const avgPrice = totalRevenue / totalKg;

    return {
        totalLots: sessionHistory.length,
        totalVolume: totalKg.toFixed(2) + " Kg",
        totalRevenue: "₹" + totalRevenue.toLocaleString('en-IN'),
        averagePrice: "₹" + avgPrice.toFixed(2)
    };
};
