socket.on('updateBid', (state) => {
    if (state.qualityNote) {
        const alertDiv = document.getElementById('quality-warning');
        alertDiv.innerText = "⚠️ ATTENTION: " + state.qualityNote;
        alertDiv.style.display = "block";
        alertDiv.style.backgroundColor = "red";
        alertDiv.style.color = "white";
    } else {
        document.getElementById('quality-warning').style.display = "none";
    }
});
