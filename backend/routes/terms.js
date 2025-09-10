// backend/routes/terms.js
import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { subject, exam, topic } = req.query;
    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    let allQuestions = [];

    const papers =
      typeof subj.papers?.toObject === "function"
        ? subj.papers.toObject()
        : subj.papers;

    let exams = [];
    if (papers.quiz1.length > 0) {
      exams.push("quiz1");
    }
    if (papers.quiz2.length > 0) {
      exams.push("quiz2");
    }
    if (papers.ET.length > 0) {
      exams.push("ET");
    }

    // Step 1: Gather base questions depending on exam
    if (exam && papers?.[exam]) {
      if (Array.isArray(papers[exam])) {
        allQuestions = papers[exam];
      }
    } else {
      Object.values(papers || {}).forEach((paper) => {
        if (Array.isArray(paper)) {
          allQuestions.push(...paper);
        }
      });
    }

    // Step 2: Apply topic filter if provided
    if (topic) {
      allQuestions = allQuestions.filter((q) => q.topic === topic);
    }

    // Step 3: Extract unique terms
    const terms = [...new Set(allQuestions.map((q) => q.term).filter(Boolean))];

    res.json({ terms, exams });
  } catch (err) {
    console.error("❌ Error fetching terms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
