<div style="max-width: 400px; margin: auto; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="text-align: center; color: #333;">Auction Admin</h2>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p>Lot: <strong id="current-lot">IDLE</strong></p>
        <p>Price: <strong id="highest-bid">₹0</strong></p>
        <p>Bidder: <strong id="highest-bidder">No Bids</strong></p>
        <p>Timer: <strong id="timer" style="color: red;">0</strong>s</p>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <button onclick="quickBid(10)" style="flex:1; padding:10px;">+10</button>
        <button onclick="quickBid(50)" style="flex:1; padding:10px;">+50</button>
        <button onclick="quickBid(100)" style="flex:1; padding:10px;">+100</button>
    </div>

    <button onclick="acceptSale()" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
        ✅ ACCEPT & START NEXT LOT
    </button>
</div>

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script>
    const socket = io("https://spice-auction-server.onrender.com");
    const pass = "spices_admin_2026";

    socket.on('updateBid', (data) => {
        document.getElementById('current-lot').innerText = data.currentLot;
        document.getElementById('highest-bid').innerText = "₹" + data.highestBid;
        document.getElementById('highest-bidder').innerText = data.highestBidder;
        document.getElementById('timer').innerText = data.timeLeft;
    });

    function quickBid(amt) {
        const cur = parseInt(document.getElementById('highest-bid').innerText.replace('₹',''));
        const name = prompt("Bidder Name?");
        if(name) socket.emit('placeBid', { amount: cur + amt, bidderName: name });
    }

    function acceptSale() {
        socket.emit('adminAction', { action: 'ACCEPT_AND_NEXT', password: pass });
    }
</script>
