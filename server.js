// Add this to your global variables in server.js
let sessionLeaderboard = {}; 

io.on('connection', (socket) => {
    // Send current rankings to new connections
    socket.emit('updateLeaderboard', Object.entries(sessionLeaderboard));

    // Update whenever a lot ends
    socket.on('auctionEnded', (data) => {
        const winner = data.highestBidder;
        const totalValue = data.highestBid * data.specs.totalWeight;

        // Add value to the winner's session total
        if (sessionLeaderboard[winner]) {
            sessionLeaderboard[winner] += totalValue;
        } else {
            sessionLeaderboard[winner] = totalValue;
        }

        // Sort and broadcast the top 5 buyers
        const sortedLeaderboard = Object.entries(sessionLeaderboard)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        io.emit('updateLeaderboard', sortedLeaderboard);
    });
});
