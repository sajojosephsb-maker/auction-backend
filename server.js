// 1. ADD USER SCHEMA
const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: 'trader' }
});
const User = mongoose.model('User', UserSchema);

// 2. ADD TRADER MANAGEMENT LOGIC
io.on('connection', (socket) => {
    // ... existing upload logic ...

    // Admin creates a new trader
    socket.on('createTrader', async (data) => {
        if (data.adminPassword === "1234") {
            try {
                const newUser = new User({ userId: data.traderId, password: data.traderPassword });
                await newUser.save();
                console.log(`👤 New Trader Created: ${data.traderId}`);
                socket.emit('traderCreated', { success: true, id: data.traderId });
                
                // Refresh the list for admin
                const traders = await User.find({ role: 'trader' });
                io.emit('traderListUpdate', traders);
            } catch (err) {
                socket.emit('traderCreated', { success: false, message: "ID already exists" });
            }
        }
    });

    // Send initial trader list to admin
    socket.on('getTraders', async () => {
        const traders = await User.find({ role: 'trader' });
        socket.emit('traderListUpdate', traders);
    });
});
