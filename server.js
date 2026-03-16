const User = mongoose.model('User', new mongoose.Schema({
    userId: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: String, // Added for a better user experience
    status: { type: String, default: 'active' }
}));

socket.on('attemptLogin', async ({ loginId, password }) => {
    const user = await User.findOne({ 
        $or: [{ userId: loginId }, { phone: loginId }], 
        password: password 
    });
    if (user && user.status === 'active') {
        socket.emit('loginResponse', { 
            success: true, 
            target: routes[user.role],
            user: { name: user.name || user.userId, role: user.role } 
        });
    }
});
