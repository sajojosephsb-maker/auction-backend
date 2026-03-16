function logout() {
    localStorage.removeItem('traderId'); // Clear the session
    window.location.href = "login.html"; // Send back to login
}
