require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get("/health", (req, res) => res.send("OK"));

// Database connection with auto-retry and detailed logging
async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Graceful shutdown (important for Render restarts)
process.on("SIGINT", async () => {
  console.log("🔻 Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔻 Render is stopping the service...");
  await mongoose.disconnect();
  process.exit(0);
});

// Port binding (Render requires process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
