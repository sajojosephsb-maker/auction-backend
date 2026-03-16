socket.on('attemptLogin', async ({ loginId, password }) => {
    // Finds user by ID or Phone
    const user = await User.findOne({ 
        $or: [{ userId: loginId }, { phone: loginId }], 
        password: password 
    });

    if (user && user.status === 'active') {
        let target = ""; 
        // Define the redirect page for every role
        if (user.role === 'admin')   target = 'index.html';
        if (user.role === 'company') target = 'company-dashboard.html';
        if (user.role === 'quality') target = 'colour-check.html';
        if (user.role === 'trader')  target = 'buyer.html';
        if (user.role === 'planter') target = 'planter-portal.html';

        if (target) {
            socket.emit('loginResponse', { success: true, target: target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Role setup incomplete" });
        }
    } else {
        socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
    }
});
