import express from 'express';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/leaderboard
// Fetch top users based on total score (sum of max score per unique quiz)
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;

    // 1. Match Stage: Filter by subject if provided
    const matchStage = {};
    if (subject && subject !== 'All') {
      matchStage.subject = subject;
    }

    const pipeline = [
      // Step 1: Filter relevant results
      { $match: matchStage },

      // Step 2: Group by User AND Unique Quiz (Subject + Term + Exam)
      // This finds the MAX score a user achieved for a specific quiz
      {
        $group: {
          _id: {
            userId: "$userId",
            subject: "$subject",
            term: "$term",
            exam: "$exam"
          },
          maxScoreForQuiz: { $max: "$score" }
        }
      },

      // Step 3: Group by User to calculate Total Score
      // Sum up the max scores from the previous step
      {
        $group: {
          _id: "$_id.userId",
          totalScore: { $sum: "$maxScoreForQuiz" },
          quizzesTaken: { $sum: 1 } // Count unique quizzes taken
        }
      },

      // Step 4: Lookup User details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },

      // Step 5: Unwind user info (since lookup returns an array)
      { $unwind: "$userInfo" },

      // Step 6: Project final fields
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$userInfo.name",
          // Use a default avatar if none exists (or handle on frontend)
          avatar: "$userInfo.avatar", 
          totalScore: 1,
          quizzesTaken: 1
        }
      },

      // Step 7: Sort by Total Score descending
      { $sort: { totalScore: -1 } },

      // Step 8: Limit to top 20
      { $limit: 20 }
    ];

    const leaderboard = await QuizResult.aggregate(pipeline);

    res.json(leaderboard);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
