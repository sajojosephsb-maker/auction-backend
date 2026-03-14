// Modify the adminAction listener in your server.js
socket.on('adminAction', (data) => {
    if (data.password === ADMIN_PASSWORD && data.action === 'approve_buyer') {
        const buyer = pendingBuyers.find(b => b.username === data.targetUser);
        if (buyer) {
            // Assign the custom limit or default to 10 Lakhs
            const assignedLimit = data.limit || 1000000; 
            
            approvedBuyers[buyer.username] = {
                approved: true,
                limit: assignedLimit,
                spent: 0
            };

            pendingBuyers = pendingBuyers.filter(b => b.username !== data.targetUser);
            
            // Inform the specific buyer of their limit
            io.to(buyer.id).emit('buyerApproved', {
                username: buyer.username,
                limit: assignedLimit
            });
            
            io.emit('newRegistrationRequest', pendingBuyers);
        }
    }
});
