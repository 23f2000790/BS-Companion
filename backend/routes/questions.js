// backend/routes/questions.js
import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

// ✅ Get questions
router.get("/", async (req, res) => {
  try {
    const { subject, exam, topic, limit = 10 } = req.query;
    const totalLimit = Number(limit);

    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    // find subject doc
    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    // flatten papers
    const papers =
      typeof subj.papers?.toObject === "function"
        ? subj.papers.toObject()
        : subj.papers;

    let questions = [];

    if (exam) {
      questions = papers?.[exam] || [];
      if (topic) {
        questions = questions.filter((q) => (q.topic || "") === topic);
      }
    } else if (topic) {
      // topic across all exams
      Object.values(papers || {}).forEach((qs) => {
        if (Array.isArray(qs)) {
          questions.push(...qs.filter((q) => (q.topic || "") === topic));
        }
      });
    } else {
      return res
        .status(400)
        .json({ message: "Please provide either exam or topic" });
    }

    if (!questions.length) {
      return res.json([]); // return empty array if none
    }

    // 🔹 normalise question objects
    const normalized = questions.map((q) => {
      const plain = typeof q.toObject === "function" ? q.toObject() : { ...q };

      // build options object robustly
      let optionsObj = {};

      // case 1: already object
      if (
        plain.options &&
        typeof plain.options === "object" &&
        !Array.isArray(plain.options)
      ) {
        optionsObj = plain.options;
      }
      // case 2: array of options
      else if (Array.isArray(plain.options)) {
        optionsObj = Object.fromEntries(
          plain.options.map((value, i) => [String.fromCharCode(65 + i), value])
        );
      }
      // case 3: separate A,B,C… keys
      else {
        Object.keys(plain).forEach((k) => {
          if (/^[A-Z]$/.test(k)) {
            optionsObj[k] = plain[k];
          }
        });
      }

      // normalise correctOption type
      let correct = plain.correctOption;
      if (plain.questionType === "multiple" && !Array.isArray(correct)) {
        correct = [plain.correctOption];
      } else if (
        (plain.questionType === "single" ||
          plain.questionType === "numerical") &&
        Array.isArray(correct)
      ) {
        correct = correct[0];
      }

      return {
        ...plain,
        options: optionsObj,
        correctOption: correct,
      };
    });

    // shuffle & limit
    const shuffled = [...normalized].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, totalLimit);

    res.json(selected);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
