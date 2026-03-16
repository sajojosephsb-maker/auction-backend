// Inside server.js
io.on('connection', (socket) => {
    
    // TRADER LOGIN ATTEMPT
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        
        if (!user) {
            socket.emit('loginResponse', { success: false, message: "Invalid ID or Password" });
        } else if (user.status !== 'active') {
            socket.emit('loginResponse', { success: false, message: `Account is ${user.status}. Contact Admin.` });
        } else {
            // SUCCESS
            socket.emit('loginResponse', { 
                success: true, 
                userId: user.userId, 
                targetPage: 'buyer.html' 
            });
        }
    });

    // SECURE BIDDING (Checks if user is still active before accepting bid)
    socket.on('placeBid', async (data) => {
        const user = await User.findOne({ userId: data.userId });
        if (user && user.status === 'active') {
            // ... existing bidding logic ...
            io.emit('updateBid', auctionState);
        } else {
            socket.emit('error', 'Unauthorized: Your account is not active.');
        }
    });
});
