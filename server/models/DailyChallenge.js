import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true, trim: true },
    source: { type: String, default: "n8n" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
