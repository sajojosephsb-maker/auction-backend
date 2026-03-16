socket.on('attemptLogin', async ({ loginId, password }) => {
    // Finds user by ID (Admin/Trader/Co) or Phone (Planter)
    const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });

    if (user && user.status === 'active') {
        let destination = "buyer.html"; // Default
        if (user.role === 'admin')   destination = 'index.html';
        if (user.role === 'company') destination = 'company-dashboard.html';
        if (user.role === 'planter') destination = 'planter-portal.html';
        if (user.role === 'quality') destination = 'colour-check.html';

        socket.emit('loginResponse', { success: true, target: destination });
    } else {
        socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
    }
});
