socket.on('updateBid', (state) => {
    if (state.details) {
        document.getElementById('litre-weight-val').innerText = state.details.litreWeight + "g";
        document.getElementById('moisture-val').innerText = state.details.moisture + "%";
        document.getElementById('grade-val').innerText = state.details.grade;
        document.getElementById('size-val').innerText = state.details.size;
    }
});
