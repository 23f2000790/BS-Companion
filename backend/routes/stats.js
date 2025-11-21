import express from "express";
import mongoose from "mongoose";
import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get Subject Proficiency for Radar Chart
router.get("/skills", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate to calculate average score per subject
    const stats = await QuizResult.aggregate([
      { $match: { userId: userId } }, // Filter by user
      {
        $group: {
          _id: "$subject",
          totalScore: { $sum: "$score" },
          totalQuestions: { $sum: "$totalQuestions" },
          quizzesTaken: { $sum: 1 },
        },
      },
      {
        $project: {
          subject: "$_id",
          _id: 0,
          // Calculate percentage: (totalScore / totalQuestions) * 100
          // Note: This assumes 'score' is the number of correct answers. 
          // If 'score' is already percentage, adjust accordingly. 
          // Based on QuizResult model, 'score' seems to be points/correct answers.
          // Let's assume 1 mark per question for simplicity or use totalQuestions as max score.
          proficiency: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $multiply: [{ $divide: ["$totalScore", "$totalQuestions"] }, 100] },
            ],
          },
          fullMark: { $literal: 100 }, // For Radar Chart scaling
        },
      },
      { $sort: { proficiency: -1 } }, // Optional: sort by strongest subjects
      { $limit: 6 } // Limit to top 6 to keep chart clean (or remove if you want all)
    ]);

    // Format for Recharts: [{ subject: 'Math', A: 85, fullMark: 100 }, ...]
    // We'll use 'A' as the key for the value to match standard Recharts examples, or just 'proficiency'
    const formattedStats = stats.map(s => ({
      subject: s.subject,
      proficiency: Math.round(s.proficiency),
      fullMark: 100
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error("Error fetching skill stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
