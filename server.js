const ADMIN_PASSWORD = "spices_admin_2026"; // Change this to your secret password

io.on('connection', (socket) => {
    // ... existing logic ...

    socket.on('adminAction', (data) => {
        if (data.password === ADMIN_PASSWORD) {
            if (data.action === 'next') {
                moveToNextLot(); // Your existing function to change lots
            } else if (data.action === 'reset') {
                resetCurrentAuction();
            }
        } else {
            socket.emit('error', 'Invalid Admin Password!');
        }
    });
});
