app.get('/search', async (req, res) => {
    const query = req.query.q;
    const results = await Sale.aggregate([
        {
            $search: {
                index: "default",
                text: {
                    query: query,
                    path: ["lot", "buyer"] // This searches both Lot Number and Buyer Name
                }
            }
        }
    ]);
    res.json(results);
});
