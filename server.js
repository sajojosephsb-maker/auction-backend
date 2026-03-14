// ... (keep your existing spiceCatalog and auctionState)

io.on('connection', (socket) => {
    // ... (keep previous listeners)

    // NEW: Search Listener
    socket.on('searchLots', (query) => {
        const filtered = spiceCatalog.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.specs.size.toLowerCase().includes(query.toLowerCase()) ||
            item.specs.color.toLowerCase().includes(query.toLowerCase())
        );
        socket.emit('searchResults', filtered);
    });
});

// ...
