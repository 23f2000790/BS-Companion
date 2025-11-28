import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import StudyGuide from "../models/StudyGuide.js";
import Subject from "../models/Subjects.js";
import { verifyToken } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/study-guides/generate - Generate a new study guide
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { subject, exam } = req.body;
    const userId = req.user.id;

    // Validation
    if (!subject || !exam) {
      return res
        .status(400)
        .json({ message: "Subject and exam are required" });
    }

    if (!["quiz1", "quiz2", "ET"].includes(exam)) {
      return res
        .status(400)
        .json({ message: "Invalid exam type. Must be quiz1, quiz2, or ET" });
    }

    // ⚡ OPTIMIZATION: Check if study guide already exists for this subject-exam combination
    const existingGuide = await StudyGuide.findOne({ subject, exam });

    if (existingGuide) {
      // Guide exists! Clone it for the new user instead of calling AI
      logger(`📚 Reusing existing study guide for ${subject} - ${exam}`);

      // Check if this user already has this exact guide
      const userAlreadyHas = await StudyGuide.findOne({
        userId,
        subject,
        exam,
      });

      if (userAlreadyHas) {
        // User already has this guide, just return it
        return res.json({
          message: "You already have this study guide",
          studyGuide: {
            _id: userAlreadyHas._id,
            subject: userAlreadyHas.subject,
            exam: userAlreadyHas.exam,
            topics: userAlreadyHas.topics,
            questionsCount: userAlreadyHas.questionsUsed.length,
            content: userAlreadyHas.aiResponse,
            createdAt: userAlreadyHas.createdAt,
          },
          cached: true,
        });
      }

      // Create a copy for this user
      const clonedGuide = new StudyGuide({
        userId, // New user's ID
        subject: existingGuide.subject,
        exam: existingGuide.exam,
        topics: existingGuide.topics,
        questionsUsed: existingGuide.questionsUsed,
        aiResponse: existingGuide.aiResponse, // Reuse the same AI-generated content
      });

      await clonedGuide.save();

      return res.json({
        message: "Study guide generated successfully",
        studyGuide: {
          _id: clonedGuide._id,
          subject: clonedGuide.subject,
          exam: clonedGuide.exam,
          topics: clonedGuide.topics,
          questionsCount: clonedGuide.questionsUsed.length,
          content: clonedGuide.aiResponse,
          createdAt: clonedGuide.createdAt,
        },
        cached: true, // Indicates this was from cache
      });
    }

    // No existing guide found - proceed with AI generation
    logger(`🤖 Generating new study guide for ${subject} - ${exam}`);

    // 1. Fetch subject from database
    const subj = await Subject.findOne({ subjectName: subject });
    if (!subj) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const papers =
      typeof subj.papers?.toObject === "function"
        ? subj.papers.toObject()
        : subj.papers;

    // 2. Get questions for the specific exam
    const allQuestions = papers?.[exam] || [];

    if (!allQuestions.length) {
      return res.status(404).json({
        message: `No questions found for ${subject} - ${exam}`,
      });
    }

    // 3. Filter and Select Questions
    const ALLOWED_TERMS = ["Sept 2024", "Jan 2025", "May 2025", "Sept 2025"];

    // Filter by allowed terms
    const filteredQuestions = allQuestions.filter((q) =>
      ALLOWED_TERMS.includes(q.term)
    );

    if (!filteredQuestions.length) {
      return res.status(404).json({
        message: `No questions found for ${subject} - ${exam} with allowed terms`,
      });
    }

    // Group by topic
    const questionsByTopic = {};
    filteredQuestions.forEach((q) => {
      const topic = q.topic || "General";
      if (!questionsByTopic[topic]) {
        questionsByTopic[topic] = [];
      }
      questionsByTopic[topic].push(q);
    });

    const topicKeys = Object.keys(questionsByTopic);

    // Shuffle questions within each topic
    topicKeys.forEach((topic) => {
      questionsByTopic[topic].sort(() => 0.5 - Math.random());
    });

    // Select balanced questions (Round Robin)
    const TOTAL_QUESTIONS_NEEDED = 30;
    const selectedQuestions = [];
    let topicIndex = 0;
    let emptyTopics = new Set();

    while (
      selectedQuestions.length < TOTAL_QUESTIONS_NEEDED &&
      emptyTopics.size < topicKeys.length
    ) {
      const currentTopic = topicKeys[topicIndex];

      if (!emptyTopics.has(currentTopic)) {
        const question = questionsByTopic[currentTopic].pop();
        if (question) {
          selectedQuestions.push(question);
        } else {
          emptyTopics.add(currentTopic);
        }
      }

      topicIndex = (topicIndex + 1) % topicKeys.length;
    }

    // 4. Extract unique topics
    const topics = [
      ...new Set(selectedQuestions.map((q) => q.topic).filter(Boolean)),
    ];

    const questionCount = selectedQuestions.length;

    // 5. Prepare data for AI
    const questionsForAI = selectedQuestions.map((q, idx) => ({
      number: idx + 1,
      topic: q.topic || "General",
      question: q.question || "N/A",
      questionType: q.questionType || "single",
    }));

    // 6. Create AI prompt
    const systemPrompt = `You are an expert educational assistant specializing in creating comprehensive, visually engaging study guides for college students.

**Context:**
- Subject: ${subject}
- Exam: ${exam}
- Topics Covered: ${topics.join(", ")}
- Total Questions Analyzed: ${questionCount}

**Your Task:**
Generate a detailed, well-structured study guide based *specifically* on the patterns found in the provided questions. Your goal is to implement the famous saying - 80% of the marks come from 20% of the topics. Teach everything important in detail. 

**CRITICAL FORMATTING RULES:**
1. **Technical Terms:** ALWAYS use inline code format (backticks) for technical terms, function names, keywords, and specific libraries.
   - Example: Do not write "Flask"; write \`Flask\`.
   - Example: Do not write "render_template"; write \`render_template()\`.
   - This is crucial for the frontend styling.
2. **Tables:** You MUST include at least one Markdown table per major topic to compare concepts (e.g., "Method vs Purpose", "Syntax vs Output").
3. **No Outer Wrapper:** Do NOT wrap the entire response in a \`\`\`markdown block. Just return the raw Markdown content.

**Structure:**

1. **Overview & Exam Strategy:**
   - Analyze the distribution of the provided questions.
   - Tell the student which specific areas appeared most frequently (e.g., "There is a heavy focus on \`Jinja2\` filters...").
   - Provide preparation tips based on this specific data.

2. **Topic Breakdown:**
   For each topic (${topics.join(", ")}):
   - **Key Concepts:** Definitions using \`highlighted\` terms.
   - **Comparison Table:** A table comparing related concepts within this topic.
   - **Code/Syntax Watch:** If the topic involves coding, provide a small code snippet (using \`\`\` language) demonstrating common patterns seen in the questions.
   - **Common Pitfalls:** Specific mistakes related to the questions provided.

3. **Quick Review Checklist:**
   - A bulleted list of 5-7 high-yield facts using \`technical\` term highlighting.

**Tone:** Encouraging, precise, and data-driven.

at the end of the guide, add a motivating yet humorous one-liner`;

    const userData = `
QUESTIONS ANALYZED:
${JSON.stringify(questionsForAI, null, 2)}
    `;

    // 7. Generate AI response
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(
      `${systemPrompt}\n\n${userData}`
    );
    const response = await result.response;
    const aiContent = response.text();

    // 8. Save to database
    const studyGuide = new StudyGuide({
      userId,
      subject,
      exam,
      topics,
      questionsUsed: questionsForAI,
      aiResponse: aiContent,
    });

    await studyGuide.save();

    // 9. Return response
    res.json({
      message: "Study guide generated successfully",
      studyGuide: {
        _id: studyGuide._id,
        subject: studyGuide.subject,
        exam: studyGuide.exam,
        topics: studyGuide.topics,
        questionsCount: questionCount,
        content: aiContent,
        createdAt: studyGuide.createdAt,
      },
      cached: false, // Indicates this is fresh AI generation
    });
  } catch (error) {
    console.error("Error generating study guide:", error);
    res.status(500).json({
      message: "Failed to generate study guide",
      error: error.message,
    });
  }
});

// GET /api/study-guides/user - Get all study guides for logged-in user
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const studyGuides = await StudyGuide.find({ userId })
      .sort({ createdAt: -1 })
      .select("-aiResponse -questionsUsed"); // Exclude large fields for list view

    res.json({
      studyGuides: studyGuides.map((guide) => ({
        _id: guide._id,
        subject: guide.subject,
        exam: guide.exam,
        topics: guide.topics,
        createdAt: guide.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching study guides:", error);
    res.status(500).json({
      message: "Failed to fetch study guides",
      error: error.message,
    });
  }
});

// GET /api/study-guides/:id - Get specific study guide by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studyGuide = await StudyGuide.findOne({ _id: id, userId });

    if (!studyGuide) {
      return res.status(404).json({ message: "Study guide not found" });
    }

    res.json({
      studyGuide: {
        _id: studyGuide._id,
        subject: studyGuide.subject,
        exam: studyGuide.exam,
        topics: studyGuide.topics,
        questionsCount: studyGuide.questionsUsed.length,
        content: studyGuide.aiResponse,
        createdAt: studyGuide.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching study guide:", error);
    res.status(500).json({
      message: "Failed to fetch study guide",
      error: error.message,
    });
  }
});

// DELETE /api/study-guides/:id - Delete a study guide
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const studyGuide = await StudyGuide.findOneAndDelete({ _id: id, userId });

    if (!studyGuide) {
      return res.status(404).json({ message: "Study guide not found" });
    }

    res.json({ message: "Study guide deleted successfully" });
  } catch (error) {
    console.error("Error deleting study guide:", error);
    res.status(500).json({
      message: "Failed to delete study guide",
      error: error.message,
    });
  }
});

export default router;
