// Replace lines 26-31 in server.js
if (user && user.status === 'active') {
    let target = ""; 
    if (user.role === 'admin')   target = 'index.html';
    if (user.role === 'company') target = 'company-dashboard.html';
    if (user.role === 'quality') target = 'colour-check.html';
    if (user.role === 'trader')  target = 'buyer.html'; // Trader specific page

    if (target) {
        socket.emit('loginResponse', { success: true, target: target });
    } else {
        socket.emit('loginResponse', { success: false, message: "Role not recognized" });
    }
}
