// backend/routes/topics.js
import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { subject, exam } = req.query;
    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    let allQuestions = [];

    // make sure we’re working with plain object, not Mongoose doc
    const papers =
      typeof subj.papers?.toObject === "function"
        ? subj.papers.toObject()
        : subj.papers;

    // ✅ If exam is provided, use only that exam’s questions
    if (exam && papers?.[exam]) {
      if (Array.isArray(papers[exam])) {
        allQuestions = papers[exam];
      }
    } else {
      // ✅ Otherwise gather all questions from all papers
      Object.values(papers || {}).forEach((paper) => {
        if (Array.isArray(paper)) {
          allQuestions.push(...paper);
        }
      });
    }

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
