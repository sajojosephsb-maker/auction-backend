// Ensure this is in your server.js
socket.on('attemptLogin', async ({ userId, password }) => {
    const user = await User.findOne({ userId, password });
    if (user && user.status === 'active') {
        // Redirection logic based on role saved in MongoDB
        let target = user.role === 'company' ? 'company-dashboard.html' : 'buyer.html';
        socket.emit('loginResponse', { success: true, userId: user.userId, target });
    } else {
        socket.emit('loginResponse', { success: false, message: "Invalid Login" });
    }
});
