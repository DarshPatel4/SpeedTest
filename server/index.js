import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import scoreRouter from "./routes/scores.js";
import automationRouter from "./routes/automation.js";
import { isServerSupabaseConfigured } from "./lib/supabase.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const extraOrigins = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return url.protocol === "http:" || url.protocol === "https:";
  }
  if (url.protocol === "https:" && url.hostname.endsWith(".vercel.app")) {
    return true;
  }
  const fixed = [
    "https://typespeedmaster.vercel.app",
    ...extraOrigins,
  ];
  return fixed.includes(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api", scoreRouter);
app.use("/api", automationRouter);

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    supabase: isServerSupabaseConfigured,
    mongo: mongoose.connection.readyState === 1,
    time: new Date().toISOString(),
  });
});

// Non-blocking MongoDB connection attempt if configured and valid
const mongoUri = process.env.MONGO_URI;
if (mongoUri && !mongoUri.includes("cluster0.zrh6c.mongodb.net")) {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 4000 })
    .then(() => {
      console.log("✓ MongoDB Connected");
    })
    .catch((err) => {
      console.warn("⚠️  MongoDB connection skipped / failed:", err.message);
    });
} else {
  if (isServerSupabaseConfigured) {
    console.log("✓ Supabase configured as primary database");
  } else {
    console.log("ℹ️  Running in standalone mode (configure Supabase in .env for cloud sync)");
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Typeflow server listening on http://localhost:${PORT}`);
});
