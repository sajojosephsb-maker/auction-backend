// Add these to your global variables in server.js
let pendingBuyers = [];
let approvedBuyers = {}; // Stores { username: password }

io.on('connection', (socket) => {
    // Handling Registration
    socket.on('registerBuyer', (data) => {
        // Check if buyer already exists
        if (approvedBuyers[data.username]) {
            return socket.emit('error', 'Username already registered.');
        }
        
        pendingBuyers.push({
            id: socket.id,
            username: data.username,
            company: data.company,
            gst: data.gst
        });
        
        // Notify Admin of a new request
        io.emit('newRegistrationRequest', pendingBuyers);
        socket.emit('status', 'Registration pending admin approval...');
    });

    // Admin Approval Logic
    socket.on('adminAction', (data) => {
        if (data.password === ADMIN_PASSWORD && data.action === 'approve_buyer') {
            const buyer = pendingBuyers.find(b => b.username === data.targetUser);
            if (buyer) {
                approvedBuyers[buyer.username] = true;
                pendingBuyers = pendingBuyers.filter(b => b.username !== data.targetUser);
                io.emit('buyerApproved', buyer.username);
                io.emit('newRegistrationRequest', pendingBuyers); // Update admin list
            }
        }
    });
});
