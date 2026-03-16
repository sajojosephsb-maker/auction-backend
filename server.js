function createCompany() {
    const id = document.getElementById('cId').value;
    const pass = document.getElementById('cPass').value;
    // Sending role as 'company' so the server knows where to redirect them
    socket.emit('createAccount', { userId: id, password: pass, role: 'company' });
}
