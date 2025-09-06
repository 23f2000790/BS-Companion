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

      // If topic is provided → return only those topic questions from that exam
      if (topic) {
        questions = questions
          .filter((q) => (q.topic || "") === topic)
          .sort(() => 0.5 - Math.random())
          .slice(0, totalLimit);
      } else {
        // 🔹 Group questions by topic for equal weightage
        const topicMap = {};
        questions.forEach((q) => {
          const qTopic = q.topic || "Others";
          if (!topicMap[qTopic]) topicMap[qTopic] = [];
          topicMap[qTopic].push(q);
        });

        const topics = Object.keys(topicMap);
        const topicCount = topics.length;

        if (topicCount === 0) {
          return res.json([]); // No topics found
        }

        let selectedQuestions = [];

        // Step 1: Pick at least 1 question from each topic (if available)
        topics.forEach((t) => {
          const take = Math.min(1, topicMap[t].length);
          selectedQuestions.push(
            ...topicMap[t].sort(() => 0.5 - Math.random()).slice(0, take)
          );
        });

        let remaining = totalLimit - selectedQuestions.length;

        if (remaining > 0) {
          // Step 2: Distribute remaining equally among topics
          let perTopic = Math.floor(remaining / topicCount);
          let extra = remaining % topicCount;

          topics.forEach((t) => {
            if (remaining <= 0) return;

            const alreadyTaken = selectedQuestions.filter(
              (q) => q.topic === t
            ).length;
            const available = topicMap[t].length - alreadyTaken;

            let take = Math.min(perTopic, available);

            // Give "extra" to first few topics if available
            if (extra > 0 && available > take) {
              take += 1;
              extra -= 1;
            }

            if (take > 0) {
              selectedQuestions.push(
                ...topicMap[t]
                  .filter((q) => !selectedQuestions.includes(q))
                  .sort(() => 0.5 - Math.random())
                  .slice(0, take)
              );
              remaining -= take;
            }
          });

          // Step 3: If still remaining, take from other available topics
          if (remaining > 0) {
            topics.forEach((t) => {
              if (remaining === 0) return;

              const alreadyTaken = selectedQuestions.filter(
                (q) => q.topic === t
              ).length;
              const available = topicMap[t].length - alreadyTaken;

              if (available > 0) {
                const take = Math.min(available, remaining);
                selectedQuestions.push(
                  ...topicMap[t]
                    .filter((q) => !selectedQuestions.includes(q))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, take)
                );
                remaining -= take;
              }
            });
          }
        }

        // Shuffle selected questions for randomness
        questions = selectedQuestions.sort(() => 0.5 - Math.random());
      }
    }
    // ✅ If no exam but topic is provided → fetch across ALL exams (proportional limit distribution)
    else if (topic) {
      const topicQuestionsByExam = {};
      let totalQuestions = 0;

      // Collect topic questions per exam
      Object.entries(papers || {}).forEach(([examName, qs]) => {
        if (Array.isArray(qs)) {
          const filtered = qs.filter((q) => (q.topic || "") === topic);
          if (filtered.length > 0) {
            topicQuestionsByExam[examName] = filtered;
            totalQuestions += filtered.length;
          }
        }
      });

      // If no questions found for the topic → return empty
      if (totalQuestions === 0) {
        return res.json([]);
      }

      let selectedQuestions = [];
      let remaining = totalLimit;

      // Step 1: Calculate proportional allocation per exam
      const examNames = Object.keys(topicQuestionsByExam);
      examNames.forEach((examName, index) => {
        if (remaining <= 0) return;

        const examQs = topicQuestionsByExam[examName];
        const proportion = Math.floor(
          (examQs.length / totalQuestions) * totalLimit
        );

        const take = Math.min(proportion, examQs.length, remaining);

        selectedQuestions.push(
          ...examQs.sort(() => 0.5 - Math.random()).slice(0, take)
        );
        remaining -= take;
      });

      // Step 2: If still remaining (rounding issues), fill from leftover exams
      if (remaining > 0) {
        examNames.forEach((examName) => {
          if (remaining === 0) return;

          const examQs = topicQuestionsByExam[examName].filter(
            (q) => !selectedQuestions.includes(q)
          );

          if (examQs.length > 0) {
            const take = Math.min(remaining, examQs.length);
            selectedQuestions.push(
              ...examQs.sort(() => 0.5 - Math.random()).slice(0, take)
            );
            remaining -= take;
          }
        });
      }

      // Final selected topic questions
      questions = selectedQuestions.sort(() => 0.5 - Math.random());
    }
    // ✅ If neither exam nor topic is provided → send 400
    else {
      return res
        .status(400)
        .json({ message: "Please provide either exam or topic" });
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
