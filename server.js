// Replace the User Schema to include Phone Numbers
const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: { type: String, unique: true }, // Added for better login
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: String,
    status: { type: String, default: 'active' }
}));

// Better Login Logic with Phone Support
socket.on('attemptLogin', async ({ loginId, password }) => {
    try {
        const user = await User.findOne({ 
            $or: [{ userId: loginId }, { phone: loginId }], 
            password: password 
        });

        if (user && user.status === 'active') {
            const routes = {
                admin: 'index.html',
                trader: 'buyer.html',
                company: 'company-dashboard.html',
                quality: 'colour-check.html',
                planter: 'planter-portal.html'
            };
            socket.emit('loginResponse', { 
                success: true, 
                target: routes[user.role] || 'login.html',
                userData: { name: user.name, role: user.role } 
            });
        } else {
            socket.emit('loginResponse', { success: false, message: "Incorrect Credentials" });
        }
    } catch (err) {
        socket.emit('loginResponse', { success: false, message: "Server Busy. Try again." });
    }
});
