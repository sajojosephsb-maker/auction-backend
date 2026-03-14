// Inside io.on('connection', (socket) => { ...
socket.on('sendPrivateMessage', (data) => {
    if (data.password === ADMIN_PASSWORD) {
        // Broadcast to all, but client-side logic will filter it
        io.emit('privateAlert', {
            target: data.targetName,
            message: data.message
        });
        console.log(`Private message sent to ${data.targetName}`);
    }
});
