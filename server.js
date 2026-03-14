let activeSessions = {}; // Stores { socketId: { name: "User", loginTime: Date } }

io.on('connection', (socket) => {
    socket.on('loginAttempt', (data) => {
        const user = authorizedBidders.find(u => u.id === data.id && u.pass === data.pass);
        if (user) {
            // Record the active session
            activeSessions[socket.id] = {
                name: user.name,
                id: user.id,
                loginTime: new Date().toLocaleTimeString()
            };
            socket.emit('loginResponse', { success: true, name: user.name });
            io.emit('updateActiveUsers', Object.values(activeSessions));
        }
    });

    socket.on('disconnect', () => {
        delete activeSessions[socket.id];
        io.emit('updateActiveUsers', Object.values(activeSessions));
    });
});
