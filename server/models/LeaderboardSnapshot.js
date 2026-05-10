import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    testsCount: { type: Number, required: true, min: 1 },
    rank: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true },
    entries: { type: [leaderboardEntrySchema], default: [] },
    totalRankedUsers: { type: Number, default: 0 },
    source: { type: String, default: "n8n" },
  },
  { timestamps: true }
);

export const LeaderboardSnapshot = mongoose.model(
  "LeaderboardSnapshot",
  leaderboardSnapshotSchema
);
