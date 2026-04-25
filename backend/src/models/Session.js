import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    inviteCode: {
      type: String,
      default: "",
      index: true,
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },

    // Problem identifier (slug like "two-sum") for full data lookup
    problemId: {
      type: String,
      default: "",
    },

    // Code snapshots — saved periodically and on session end
    codeSnapshots: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        language: { type: String, required: true },
        code: { type: String, required: true },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    // Execution results history
    executionResults: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        language: String,
        code: String,
        output: String,
        success: Boolean,
        executedAt: { type: Date, default: Date.now },
      },
    ],

    // Session timing
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
