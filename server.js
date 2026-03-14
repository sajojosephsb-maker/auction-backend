<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Spice Auction - Spices Board</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 20px; background-color: #f0f4f0; }
        .container { max-width: 600px; margin: 0 auto; }
        .auction-board { border: 3px solid #2e7d32; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px; }
        h1 { color: #2e7d32; font-size: 3.5em; margin: 10px 0; font-weight: bold; }
        .history-panel { background: white; border-radius: 10px; padding: 15px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .history-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 0.9em; }
        .history-item:last-child { border-bottom: none; }
        input { padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; width: 150px; outline: none; }
        button { padding: 12px 25px; font-size: 16px; background-color: #2e7d32; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
        button:hover { background-color: #1b5e20; }
        .label { color: #666; text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px; }
    </style>
</head>
<body>

    <div class="container">
        <h2 style="color: #333;">Live Spices e-Auction</h2>
        
        <div class="auction-board">
            <div class="label">Currently Bidding On</div>
            <h3 id="lot-name">LOT-102 (Green Cardamom)</h3>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <div class="label">Current High Bid</div>
            <h1 id="current-bid">₹1450</h1>
            <p>Highest Bidder: <strong id="bidder-id">None</strong></p>
        </div>

        <div style="margin-bottom: 30px;">
            <input type="number" id="bid-input" placeholder="Enter Amount">
            <button onclick="placeBid()">Place Bid</button>
        </div>

        <div class="history-panel">
            <div class="label" style="margin-bottom: 10px;">Recent Bid History</div>
            <div id="history-list">
                <p style="color: #999; font-style: italic;">No bids yet...</p>
            </div>
        </div>
    </div>

    <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
    <script>
        const socket = io('https://spice-auction-server.onrender.com'); 
        let currentBid = 0;

        socket.on('updateBid', (data) => {
            currentBid = data.highestBid;
            document.getElementById('current-bid').innerText = '₹' + data.highestBid;
            document.getElementById('bidder-id').innerText = data.highestBidder;

            // Update History List
            const historyDiv = document.getElementById('history-list');
            if (data.bidHistory.length > 0) {
                historyDiv.innerHTML = data.bidHistory.map(bid => `
                    <div class="history-item">
                        <span><strong>₹${bid.amount}</strong> by ${bid.bidder}</span>
                        <span style="color: #888;">${bid.time}</span>
                    </div>
                `).join('');
            }
        });

        function placeBid() {
            const inputField = document.getElementById('bid-input');
            const newBid = parseInt(inputField.value);

            if (newBid > currentBid) {
                socket.emit('placeBid', { amount: newBid });
                inputField.value = '';
            } else {
                alert("Your bid must be higher than ₹" + currentBid);
            }
        }
    </script>
</body>
</html>
