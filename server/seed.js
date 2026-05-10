import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/typeflow";

const DEMO_USER = {
  name: "Demo User",
  email: "demo@typeflow.app",
  password: "demo123",
};

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const existing = await User.findOne({ email: DEMO_USER.email });
    if (existing) {
      console.log("Demo user already exists:", DEMO_USER.email);
      process.exit(0);
      return;
    }

    await User.create(DEMO_USER);
    console.log("Demo user created successfully");
    console.log("  Email:", DEMO_USER.email);
    console.log("  Password:", DEMO_USER.password);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
