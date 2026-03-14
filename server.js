// Add this inside your io.on('connection') block
socket.on('getAIRecommendation', () => {
    if (allTransactions.length === 0) {
        socket.emit('aiSuggestion', { price: 1000, note: "Initial Market Price" });
        return;
    }

    // Get last 10 transactions
    const recent = allTransactions.slice(-10);
    const sum = recent.reduce((acc, curr) => acc + parseFloat(curr.rate), 0);
    const average = sum / recent.length;

    // Suggest 5% below average to start competitive bidding
    const suggestedStart = Math.floor(average * 0.95);
    
    socket.emit('aiSuggestion', { 
        price: suggestedStart, 
        note: `Based on last ${recent.length} lots (Avg: ₹${average.toFixed(0)})` 
    });
});
