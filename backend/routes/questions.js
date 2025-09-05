import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

/**
 * ✅ Get questions
 * Supports:
 *   - Exam filter
 *   - Topic filter
 *   - Both exam + topic together
 */
router.get("/", async (req, res) => {
  try {
    const { subject, exam, topic, limit = 10 } = req.query;
    const totalLimit = Number(limit);

    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    let questions = [];

    if (exam) {
      // exam-based questions
      questions = subj.papers[exam] || [];

      // optional topic filter within exam
      if (topic) {
        questions = questions.filter((q) => q.topic === topic);
      }
    } else if (topic) {
      // topic-based: search across all exams
      Object.values(subj.papers || {}).forEach((qs) => {
        if (Array.isArray(qs)) {
          questions.push(...qs.filter((q) => q.topic === topic));
        }
      });
    } else {
      return res
        .status(400)
        .json({ message: "Please provide either exam or topic" });
    }

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found" });
    }

    // Shuffle + slice
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, totalLimit);

    res.json(selected);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Get unique topics for a subject
 */
router.get("/topics", async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    const topicsSet = new Set();

    Object.values(subj.papers || {}).forEach((qs) => {
      if (Array.isArray(qs)) {
        qs.forEach((q) => {
          if (q.topic) topicsSet.add(q.topic);
        });
      }
    });

    res.json([...topicsSet]);
  } catch (err) {
    console.error("❌ Error fetching topics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
