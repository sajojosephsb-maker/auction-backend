// Add this to your global variables
let participantCount = 0;

io.on('connection', (socket) => {
    participantCount++;
    io.emit('updateParticipantCount', participantCount);
    console.log(`Participants: ${participantCount}`);

    socket.on('disconnect', () => {
        participantCount--;
        io.emit('updateParticipantCount', participantCount);
    });
    
    // ... rest of your existing connection logic
});
