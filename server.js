socket.on('recordPayment', (data) => {
    if (data.password === ADMIN_PASSWORD) {
        const { buyerName, amountPaid } = data;
        
        if (buyerLedgers[buyerName]) {
            // Find the oldest outstanding lot and mark it as 'Paid'
            // For simplicity, we can also just track a "Total Outstanding" balance
            buyerLedgers[buyerName].push({
                lot: "PAYMENT RECEIVED",
                total: -Math.abs(amountPaid), // Negative value reduces the balance
                date: new Date().toLocaleDateString()
            });
            
            io.emit('ledgerUpdated', { buyerName, ledger: buyerLedgers[buyerName] });
        }
    }
});
