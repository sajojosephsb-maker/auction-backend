const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: { type: String, sparse: true }, // Added for Planters
    password: { type: String },
    role: { type: String }, // 'trader', 'company', or 'planter'
    status: { type: String, default: 'active' }
});

// Update login logic to handle Phone or ID
socket.on('attemptLogin', async ({ loginId, password }) => {
    // Check both userId and phone fields
    const user = await User.findOne({ 
        $or: [{ userId: loginId }, { phone: loginId }], 
        password: password 
    });
    
    if (user && user.status === 'active') {
        let target = "buyer.html";
        if (user.role === 'company') target = 'company-dashboard.html';
        if (user.role === 'planter') target = 'planter-portal.html';
        
        socket.emit('loginResponse', { success: true, userId: user.userId, target });
    } else {
        socket.emit('loginResponse', { success: false, message: "Invalid Credentials" });
    }
});
