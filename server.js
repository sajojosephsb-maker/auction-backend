socket.on('privateAlert', (data) => {
    if (window.myName === data.target) {
        // Create a prominent overlay that they must click to dismiss
        const overlay = document.createElement('div');
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:yellow; display:flex; align-items:center; justify-content:center; z-index:9999; font-size:24px; padding:20px; text-align:center;";
        overlay.innerHTML = `<div><p>ADMIN MESSAGE:</p><p>${data.message}</p><button onclick="this.parentElement.parentElement.remove()" style="padding:10px 20px; font-size:18px;">ACKNOWLEDGE</button></div>`;
        document.body.appendChild(overlay);
    }
});
