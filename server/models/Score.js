import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wpm: { type: Number, required: true, min: 0 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    difficulty: { type: String, default: "medium" },
    mode: { type: String, default: "normal" },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Score = mongoose.model("Score", scoreSchema);
