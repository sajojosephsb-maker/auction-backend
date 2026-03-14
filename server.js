socket.on('registerUser', async (data) => {
    const newId = "BID-" + Math.floor(100 + Math.random() * 900);
    const newUser = new User({ userId: newId, name: data.name, isApproved: false });
    await newUser.save();
    // Notify Admin that a new user needs approval
    io.emit('receiveChat', { user: "SYSTEM", msg: `New Registration: ${data.name} (${newId}). Needs Admin Approval!` });
    socket.emit('registrationSuccess', { id: newId, name: data.name });
});

// Admin command to approve a user
socket.on('approveUser', async (data) => {
    if (data.password === "spices_admin_2026") {
        await User.findOneAndUpdate({ userId: data.targetId }, { isApproved: true });
        const u = await User.findOne({ userId: data.targetId });
        authorizedBidders[u.userId] = u.name; // Add to active list
        io.emit('receiveChat', { user: "SYSTEM", msg: `User ${u.name} has been APPROVED to bid.` });
    }
});
