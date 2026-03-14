socket.on('requestInvoice', (data) => {
    if (data.password === ADMIN_PASSWORD) {
        const transaction = allTransactions.find(t => t.lot === data.lotId);
        if (transaction) {
            socket.emit('printInvoice', transaction);
        }
    }
});
