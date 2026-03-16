const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    status: { type: String, default: 'active' }, // active, blocked, banned
    role: { type: String, default: 'trader' }
});
const User = mongoose.model('User', UserSchema);

io.on('connection', (socket) => {
    // Fetch all traders for Admin
    socket.on('getTraders', async () => {
        const traders = await User.find({ role: 'trader' });
        socket.emit('traderListUpdate', traders);
    });

    // Create Trader
    socket.on('createTrader', async (data) => {
        try {
            await new User({ userId: data.traderId, password: data.traderPassword }).save();
            const traders = await User.find({ role: 'trader' });
            io.emit('traderListUpdate', traders);
        } catch (e) { socket.emit('error', 'ID already exists'); }
    });

    // Update Status (Block/Ban/Unblock)
    socket.on('updateTraderStatus', async ({ id, status }) => {
        await User.findOneAndUpdate({ userId: id }, { status: status });
        const traders = await User.find({ role: 'trader' });
        io.emit('traderListUpdate', traders);
    });

    // Delete Trader
    socket.on('deleteTrader', async (id) => {
        await User.findOneAndDelete({ userId: id });
        const traders = await User.find({ role: 'trader' });
        io.emit('traderListUpdate', traders);
    });

    // Login logic with status check
    socket.on('attemptLogin', async ({ userId, password }) => {
        const user = await User.findOne({ userId, password });
        if (user && user.status === 'active') {
            socket.emit('loginResponse', { success: true, userId: user.userId, targetPage: 'buyer.html' });
        } else {
            socket.emit('loginResponse', { success: false, message: user ? "Account " + user.status : "Invalid credentials" });
        }
    });
});
