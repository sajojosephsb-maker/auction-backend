// Quality Parameters Schema
const QualitySchema = new mongoose.Schema({
    lotNumber: String,
    planterId: String,
    moisture: Number,
    literWeight: Number,
    isArtificiallyColoured: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});
const Quality = mongoose.model('Quality', QualitySchema);

// Update Login Redirection
socket.on('attemptLogin', async ({ loginId, password }) => {
    const user = await User.findOne({ $or: [{ userId: loginId }, { phone: loginId }], password });
    if (user && user.status === 'active') {
        let target = "buyer.html";
        if (user.role === 'quality') target = 'quality-check.html'; // New Route
        if (user.role === 'planter') target = 'planter-portal.html';
        socket.emit('loginResponse', { success: true, userId: user.userId, target });
    }
});
