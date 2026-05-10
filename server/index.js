import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import scoreRouter from "./routes/scores.js";
import automationRouter from "./routes/automation.js";

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

app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api", scoreRouter);
app.use("/api", automationRouter);

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/typeflow";

mongoose
  .connect(process.env.MONGO_URI || mongoUri)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err);
    process.exit(1);
  });
