// backend/routes/topics.js
import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { subject } = req.query;
    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    let allQuestions = [];

    // ✅ Safely collect questions from each exam
    Object.values(subj.papers || {}).forEach((paper) => {
      if (Array.isArray(paper)) {
        allQuestions.push(...paper);
      }
    });

    // ✅ Extract unique topics
    const topics = [
      ...new Set(allQuestions.map((q) => q.topic).filter(Boolean)),
    ];

    res.json(topics);
  } catch (err) {
    console.error("❌ Error fetching topics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
