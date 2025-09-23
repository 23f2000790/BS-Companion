import express from "express";
import QuizResult from "../models/QuizResult.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// @route   POST api/results
// @desc    Save a completed quiz result
// @access  Private
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      userId,
      subject,
      term,
      exam,
      questions,
      startTime,
      endTime,
      timeTaken,
      score,
      totalQuestions,
    } = req.body;

    // Validate that essential data is present
    if (
      !userId ||
      !subject ||
      !questions ||
      !startTime ||
      !endTime ||
      timeTaken === undefined ||
      score === undefined ||
      totalQuestions === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields for quiz result." });
    }

    const newResult = new QuizResult({
      userId,
      subject,
      term,
      exam,
      questions,
      startTime,
      endTime,
      timeTaken,
      score,
      totalQuestions,
    });

    const savedResult = await newResult.save();
    // Respond with the newly created result
    res.status(201).json(savedResult);
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ message: "Server error while saving quiz result." });
  }
});

export default router;
