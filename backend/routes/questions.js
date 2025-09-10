import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

// ✅ Get questions
router.get("/", async (req, res) => {
  try {
    const { subject, exam, topic, term, limit = 10 } = req.query;
    const totalLimit = Number(limit);

    if (!subject) {
      return res.status(400).json({ message: "Missing subject" });
    }

    // Find subject document
    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    const papers =
      typeof subj.papers?.toObject === "function"
        ? subj.papers.toObject()
        : subj.papers;

    let questions = [];

    // ✅ If exam is provided → handle per-exam selection
    if (exam) {
      questions = papers?.[exam] || [];

      // 🔹 Apply topic + term filters if given
      if (topic) {
        questions = questions.filter((q) => (q.topic || "") === topic);
      }
      if (term) {
        questions = questions.filter((q) => (q.term || "") === term);
      }

      // 🔹 Randomize & limit
      questions = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, totalLimit);
    }
    // ✅ If no exam but topic/term is provided → fetch across ALL exams
    else if (topic || term) {
      let filteredQuestions = [];

      Object.values(papers || {}).forEach((qs) => {
        if (Array.isArray(qs)) {
          let pool = [...qs];

          if (topic) {
            pool = pool.filter((q) => (q.topic || "") === topic);
          }
          if (term) {
            pool = pool.filter((q) => (q.term || "") === term);
          }

          if (pool.length > 0) {
            filteredQuestions.push(...pool);
          }
        }
      });

      // If no questions found → return []
      if (filteredQuestions.length === 0) {
        return res.json([]);
      }

      // 🔹 Shuffle + take limit
      questions = filteredQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, totalLimit);
    }
    // ✅ If neither exam nor topic/term is provided → send 400
    else {
      return res
        .status(400)
        .json({ message: "Please provide exam, topic or term" });
    }

    if (!questions.length) {
      return res.json([]);
    }

    // 🔹 Normalize question objects before sending
    const normalized = questions.map((q) => {
      const plain = typeof q.toObject === "function" ? q.toObject() : { ...q };

      let optionsObj = {};
      if (
        plain.options &&
        typeof plain.options === "object" &&
        !Array.isArray(plain.options)
      ) {
        optionsObj = plain.options;
      } else if (Array.isArray(plain.options)) {
        optionsObj = Object.fromEntries(
          plain.options.map((value, i) => [String.fromCharCode(65 + i), value])
        );
      } else {
        Object.keys(plain).forEach((k) => {
          if (/^[A-Z]$/.test(k)) {
            optionsObj[k] = plain[k];
          }
        });
      }

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

    res.json(normalized);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
