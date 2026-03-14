// Example Calculation Logic
const calculateLotTotal = (quantity, ratePerKg) => {
    return parseFloat((quantity * ratePerKg).toFixed(2));
};

// Example for an auction report entry
const lotValue = calculateLotTotal(124.2, 736.00); // 91411.20
