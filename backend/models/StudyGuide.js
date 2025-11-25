import mongoose from "mongoose";

const StudyGuideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  subject: {
    type: String,
    required: true,
  },
  exam: {
    type: String,
    required: true,
    enum: ["quiz1", "quiz2", "ET"],
  },
  topics: {
    type: [String],
    default: [],
  },
  questionsUsed: {
    type: [Object], // Store simplified question objects
    default: [],
  },
  aiResponse: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
StudyGuideSchema.index({ userId: 1, createdAt: -1 });
StudyGuideSchema.index({ userId: 1, subject: 1, exam: 1 });

export default mongoose.model("StudyGuide", StudyGuideSchema);
