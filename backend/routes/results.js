import express from "express";
import QuizResult from "../models/QuizResult.js";
import Subject from "../models/Subjects.js";
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

// @route   GET api/results/:id
// @desc    Get a single quiz result by ID with original questions
// @access  Private
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: "Quiz result not found" });
    }

    // Verify user owns this result
    if (result.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Fetch the subject to get full question details
    const subjectDoc = await Subject.findOne({ subjectName: result.subject });
    
    let enrichedQuestions = result.questions;

    if (subjectDoc) {
      // Create a map of all questions in the subject for O(1) lookup
      // Flatten all papers (quiz1, quiz2, ET) into one array
      const allQuestions = [];
      const papers = subjectDoc.papers ? (typeof subjectDoc.papers.toObject === 'function' ? subjectDoc.papers.toObject() : subjectDoc.papers) : {};
      
      Object.values(papers).forEach(paperQuestions => {
        if (Array.isArray(paperQuestions)) {
          allQuestions.push(...paperQuestions);
        }
      });

      const questionMap = new Map(allQuestions.map(q => [q._id.toString(), q]));

      // Enrich the result questions with original details
      enrichedQuestions = result.questions.map(q => {
        let lookupKey = q.questionId ? q.questionId.toString() : "";
        
        // Sanitize malformed ObjectIds (e.g. "new ObjectId('...')")
        if (lookupKey.startsWith("new ObjectId('")) {
            lookupKey = lookupKey.replace("new ObjectId('", "").replace("')", "");
        }

        const originalQ = questionMap.get(lookupKey);
        if (originalQ) {
          return {
            ...q.toObject(),
            question: originalQ.question,
            options: originalQ.options,
            correctOption: originalQ.correctOption,
            context: originalQ.context,
            image: originalQ.image,
            explanation: originalQ.explanation
          };
        }
        return q.toObject();
      });
    }

    // Return result with parsed AI analysis if present
    const response = {
      ...result.toObject(),
      questions: enrichedQuestions,
      aiAnalysis: result.aiAnalysis ? JSON.parse(result.aiAnalysis) : null
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching quiz result:", err);
    res.status(500).json({ message: "Server error while fetching quiz result." });
  }
});

// @route   GET api/results/user/:userId
// @desc    Get quiz history for a user
// @access  Private
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, limit = 20, skip = 0 } = req.query;

    // Verify user is requesting their own history
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const query = { userId };
    if (subject) query.subject = subject;

    const results = await QuizResult.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('subject exam term score totalQuestions timeTaken createdAt aiAnalysis');

    // Add hasAiAnalysis flag
    const formattedResults = results.map(r => ({
      _id: r._id,
      subject: r.subject,
      exam: r.exam,
      term: r.term,
      score: r.score,
      totalQuestions: r.totalQuestions,
      timeTaken: r.timeTaken,
      createdAt: r.createdAt,
      hasAiAnalysis: !!r.aiAnalysis
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching quiz history:", err);
    res.status(500).json({ message: "Server error while fetching quiz history." });
  }
});

export default router;
