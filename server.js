// Add 'role' to your UserSchema
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    role: { type: String }, // 'trader' or 'company'
    status: { type: String, default: 'active' }
});
const User = mongoose.model('User', UserSchema);

io.on('connection', (socket) => {
    // Admin: Create any account (Trader or Company)
    socket.on('createAccount', async (data) => {
        try {
            await new User({ 
                userId: data.userId, 
                password: data.password, 
                role: data.role 
            }).save();
            const allUsers = await User.find({});
            io.emit('userListUpdate', allUsers);
            socket.emit('status', { success: true, msg: `${data.role} Created!` });
        } catch (e) {
            socket.emit('status', { success: false, msg: "ID already exists." });
        }
    });

    // Login logic that redirects based on role
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        if (user && user.status === 'active') {
            const target = user.role === 'admin' ? 'index.html' : 
                           user.role === 'company' ? 'company-dashboard.html' : 'buyer.html';
            socket.emit('loginResponse', { success: true, userId: user.userId, target });
        } else {
            socket.emit('loginResponse', { success: false, message: "Access Denied" });
        }
    });
});
