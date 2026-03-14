io.on('connection', (socket) => {
    console.log('A buyer connected');

    // ALL socket.on logic MUST go here
    socket.on('placeBid', (data) => { ... });
    socket.on('adminAction', (data) => { ... });
});
