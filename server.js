// Upload & Confirm Logic - Simple Password for Dev
    socket.on('uploadCatalogue', async (data) => {
        if (data.password === "1234") { // Changed to 1234
            auctionCatalogue = data.list;
            console.log(`✅ Received ${auctionCatalogue.length} lots from Admin`);
            io.emit('catalogUpdate', { count: auctionCatalogue.length });
            
            // Optional: Save to MongoDB immediately on upload
            await Sale.deleteMany({}); // Clear old lots
            await Sale.insertMany(data.list);
            console.log("💾 All data saved to MongoDB Cluster0");
        } else {
            console.log("❌ Admin upload failed: Wrong Password");
        }
    });
