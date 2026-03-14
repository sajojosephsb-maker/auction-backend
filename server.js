// --- AUTHENTICATION STORAGE ---
let authorizedBidders = [
    { id: "BID001", pass: "1234", name: "John Cardamom Traders" },
    { id: "BID002", pass: "5678", name: "Spices Export Ltd" }
];

io.on('connection', (socket) => {
    // Admin creates or edits a bidder
    socket.on('adminAction', (data) => {
        if (data.password !== ADMIN_PASSWORD) return;

        if (data.action === 'CREATE_USER') {
            authorizedBidders.push({ id: data.bidId, pass: data.bidPass, name: data.bidName });
            console.log(`User ${data.bidName} Created`);
        } else if (data.action === 'EDIT_USER') {
            let user = authorizedBidders.find(u => u.id === data.bidId);
            if (user) { user.pass = data.bidPass; user.name = data.bidName; }
        }
    });

    // Login Verification
    socket.on('loginAttempt', (data) => {
        const user = authorizedBidders.find(u => u.id === data.id && u.pass === data.pass);
        if (user) {
            socket.emit('loginResponse', { success: true, name: user.name });
        } else {
            socket.emit('loginResponse', { success: false, message: "Invalid ID or Password" });
        }
    });
});
