const express = require("express");
const next = require("next");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: "./config.env" });

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// ── Routes ────────────────────────────────────────────────
const authRoutes = require("./Api/routes/auth");
const userRoutes = require("./Api/routes/users");
const postRoutes = require("./Api/routes/posts");
const commentRoutes = require("./Api/routes/comments");
const storyRoutes = require("./Api/routes/stories");
const conversationRoutes = require("./Api/routes/conversations");
const messageRoutes = require("./Api/routes/messages");

// ── DB connect ────────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri || uri === "DATABASE_URL") {
    console.log(
      "⚠  MONGODB_URL not set — skipping database connection.\n" +
      "   Update config.env with your MongoDB URI to enable full backend."
    );
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Don't crash — frontend still works without DB
  }
};

// ── Boot ──────────────────────────────────────────────────
app.prepare().then(async () => {
  const server = express();

  await connectDB();

  // Middleware
  server.use(express.json({ limit: "50mb" }));
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser());

  // Static uploads
  server.use("/uploads", express.static(path.join(__dirname, "Api/uploads")));

  // ── Old MongoDB API routes removed ───────────────────
  // Next.js pages/api/ handles all API calls via Supabase.
  // Express only handles static files and the health check.


  // Health check
  server.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // Hand everything else to Next.js
  server.all("*", (req, res) => handle(req, res));

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`\n🎵 MusicDapp running → http://localhost:${PORT}`);
    console.log(`   Mode: ${dev ? "development" : "production"}`);
    console.log(`   API:  http://localhost:${PORT}/api/health\n`);
  });
});
