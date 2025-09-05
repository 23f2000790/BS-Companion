import express from "express";
import Subject from "../models/Subjects.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { subject, exam, limit = 10 } = req.query;
    const totalLimit = Number(limit);

    if (!subject || !exam) {
      return res.status(400).json({ message: "Missing subject or exam" });
    }

    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) return res.status(404).json({ message: "Subject not found" });

    const questions = subj.papers[exam] || [];

    // Group by topic
    const grouped = {};
    questions.forEach((q) => {
      if (!grouped[q.topic]) grouped[q.topic] = [];
      grouped[q.topic].push(q);
    });

    const topics = Object.values(grouped);
    const perTopic = Math.floor(totalLimit / topics.length);
    let selected = [];

    topics.forEach((topicQuestions) => {
      const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
      selected.push(...shuffled.slice(0, perTopic));
    });

    // Fill remaining if division not exact
    const remaining = totalLimit - selected.length;
    if (remaining > 0) {
      const all = questions.sort(() => 0.5 - Math.random());
      selected.push(...all.slice(0, remaining));
    }

    const finalShuffled = selected.sort(() => 0.5 - Math.random());
    res.json(finalShuffled);
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
