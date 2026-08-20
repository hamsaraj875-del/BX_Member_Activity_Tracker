/**
 * index.js — BX Analytics Dashboard Express Server
 * 
 * Serves the frontend static files AND provides the REST API.
 * Start with:  npm start   (or  npm run dev  for auto-reload)
 */

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const membersRouter = require("./routes/members");
const eventsRouter = require("./routes/events");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bx_analytics";

// ── Middleware ────────────────────────────────────────────────────────────────
// Allow requests from any origin (required for deployment on separate domains)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/members", membersRouter);
app.use("/api/events", eventsRouter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    status: "ok",
    server: "BX Analytics API",
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// ── Serve Frontend Static Files ───────────────────────────────────────────────
// The frontend files live one level up (in bx-analytics-dashboard/)
const FRONTEND_DIR = path.resolve(__dirname, "..");
app.use(express.static(FRONTEND_DIR, {
  // Don't serve the server/ folder itself
  index: "index.html",
}));

// Catch-all: serve index.html for any non-API route (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// ── MongoDB Connection + Start ────────────────────────────────────────────────
async function startServer() {
  // Start server first so health check always responds
  app.listen(PORT, () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🚀 BX Analytics Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   API:    http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  });

  try {
    console.log("🔗 Connecting to MongoDB:", MONGO_URI.replace(/\/\/.*@/, "//<credentials>@"));
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ MongoDB connected successfully");
    console.log("   Run 'npm run seed' once to populate the database.");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("\n💡 Fix: Update MONGODB_URI in server/.env");
    console.error("   → For Atlas: copy the connection string from your cluster's Connect page");
    console.error("   → Replace <cluster> in the URI with your actual cluster hostname");
    console.error("   → Also run: npm run seed   (after fixing the URI)\n");
    // Don't exit — let the server run in degraded mode
    // The frontend will fall back to local seed data automatically
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
