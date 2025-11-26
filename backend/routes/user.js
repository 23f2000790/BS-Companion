import express from "express";
import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// @route   GET api/user/dashboard-stats
// @desc    Get aggregated stats for the dashboard (Streak, Weakest Topic, Last Quiz)
// @access  Private
router.get("/dashboard-stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all quiz results for the user, sorted by newest first
    const results = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    // --- Calculate Streak ---
    let streak = 0;
    if (results.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const uniqueDays = new Set();
      
      // Check if there's a quiz today
      const lastQuizDate = new Date(results[0].createdAt);
      lastQuizDate.setHours(0, 0, 0, 0);
      
      if (lastQuizDate.getTime() === today.getTime()) {
        streak = 1;
        uniqueDays.add(today.getTime());
      }

      // Iterate backwards to find consecutive days
      const dates = results.map(r => {
        const d = new Date(r.createdAt);
        d.setHours(0,0,0,0);
        return d.getTime();
      });
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a); // Newest first

      if (uniqueDates.length > 0) {
        const latestDate = uniqueDates[0];
        const oneDay = 24 * 60 * 60 * 1000;
        
        // If latest quiz was before yesterday, streak is 0
        if (today.getTime() - latestDate > oneDay) {
          streak = 0;
        } else {
            // Streak is alive
            streak = 1;
            let currentDate = latestDate;
            
            for (let i = 1; i < uniqueDates.length; i++) {
                if (currentDate - uniqueDates[i] === oneDay) {
                    streak++;
                    currentDate = uniqueDates[i];
                } else {
                    break;
                }
            }
        }
      }
    }

    // --- Calculate Focus Area (Weakest Topic) ---
    const topicStats = {};
    
    results.forEach(result => {
      result.questions.forEach(q => {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { 
            correct: 0, 
            total: 0,
            subject: result.subject // Track which subject this topic belongs to
          };
        }
        topicStats[q.topic].total++;
        if (q.status === "correct") {
          topicStats[q.topic].correct++;
        }
      });
    });

    let weakestTopic = null;
    let minAccuracy = 101;

    Object.entries(topicStats).forEach(([topic, stats]) => {
      if (stats.total >= 5) { // Minimum threshold to be significant
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy < minAccuracy) {
          minAccuracy = accuracy;
          weakestTopic = {
            topic,
            subject: stats.subject,
            accuracy: Math.round(accuracy)
          };
        }
      }
    });
    
    // Fallback if no topic has enough data
    if (!weakestTopic && Object.keys(topicStats).length > 0) {
         // Just pick the one with lowest accuracy regardless of count
         Object.entries(topicStats).forEach(([topic, stats]) => {
            const accuracy = (stats.correct / stats.total) * 100;
            if (accuracy < minAccuracy) {
              minAccuracy = accuracy;
              weakestTopic = {
                topic,
                subject: stats.subject,
                accuracy: Math.round(accuracy)
              };
            }
         });
    }

    // --- Get Last Quiz for Quick Resume ---
    const lastQuiz = results.length > 0 ? {
      subject: results[0].subject,
      exam: results[0].exam,
      term: results[0].term,
      topic: results[0].questions[0]?.topic || null
    } : null;

    res.json({
      streak,
      focusArea: weakestTopic,
      lastQuiz
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/update-profile
// @desc    Update user profile information
// @access  Private
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { name, city, currentLevel } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !city || !currentLevel) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['Foundational', 'Diploma'].includes(currentLevel)) {
      return res.status(400).json({ message: 'Invalid current level' });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, city, currentLevel },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/update-ai-usage
// @desc    Update AI analysis usage stats
// @access  Private
router.put('/update-ai-usage', verifyToken, async (req, res) => {
  try {
    const { count, lastResetDate } = req.body;
    const userId = req.user.id;

    const update = {};
    if (count !== undefined) update.aiAnalysisCount = count;
    if (lastResetDate) update.aiAnalysisResetDate = lastResetDate;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating AI usage:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
