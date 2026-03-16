// New User Schema with Roles
const UserSchema = new mongoose.Schema({ 
    userId: String, 
    name: String, 
    role: { type: String, enum: ['admin', 'company', 'trader', 'planter', 'lab', 'viewer'], default: 'viewer' },
    isApproved: { type: Boolean, default: false } 
});
const User = mongoose.model('User', UserSchema);

// Role-Based Login Logic
socket.on('login', async (data) => {
    const user = await User.findOne({ userId: data.userId, isApproved: true });
    if (user) {
        socket.emit('loginSuccess', { role: user.role, name: user.name });
    } else {
        socket.emit('loginError', "Account not found or pending approval.");
    }
});
