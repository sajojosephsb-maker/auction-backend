socket.on('attemptLogin', async ({ loginId, password }) => {
    // Search by either ID (Admin/Trader/Co) or Phone (Planter)
    const user = await User.findOne({ 
        $or: [{ userId: loginId }, { phone: loginId }], 
        password: password 
    });

    if (user && user.status === 'active') {
        let destination = "buyer.html"; // Default for Traders
        
        switch(user.role) {
            case 'admin':   destination = 'index.html'; break;
            case 'company': destination = 'company-dashboard.html'; break;
            case 'planter': destination = 'planter-portal.html'; break;
            case 'quality': destination = 'colour-check.html'; break;
        }

        socket.emit('loginResponse', { 
            success: true, 
            userId: user.userId, 
            role: user.role,
            target: destination 
        });
    } else {
        socket.emit('loginResponse', { success: false, message: "Invalid ID or Password" });
    }
});
