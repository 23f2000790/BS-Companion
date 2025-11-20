import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QuizResult from "../models/QuizResult.js";

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/analyze", async (req, res) => {
  try {
    const { 
      resultId, 
      score, 
      totalQuestions, 
      topicPerformance, 
      questions,
      timeTaken // e.g., "1m 31s"
    } = req.body;

    if (!resultId) {
      return res.status(400).json({ message: "resultId is required" });
    }

    // Construct the behavioral analysis prompt
    const systemPrompt = `You are a Senior Technical Mentor and Quiz Performance Analyst. Your role is to provide deep, actionable insights that go beyond surface-level advice.

CRITICAL ANALYSIS GUIDELINES:
1. **Behavioral Pattern Recognition**: Analyze speed vs. accuracy. If timeTaken is low (<2min for 10 questions) AND score is low (<50%), the primary issue is likely RUSHING, not lack of knowledge. Emphasize "slow down and read carefully" over "study more."

2. **Specific Concept Gap Identification**: For each wrong answer, compare userAnswer to correctAnswer and identify the EXACT misconception (e.g., "confused async/await with promises", "mistook greedy for lazy regex"). Don't give generic advice like "study topic X" - pinpoint the sub-concept.

3. **Question Context Analysis**: Use the actual questionText to understand what logic the user failed to apply. Reference specific code patterns they missed.

4. **Actionable Study Plan**: Create a timeline with specific tasks and Google search terms, not vague "review chapter 5" suggestions.

OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "summary": {
    "title": "One-line assessment (e.g., 'Strong Foundation, Need Pattern Recognition')",
    "short_description": "2-3 sentence overall performance summary",
    "behavioral_insight": "Primary behavioral pattern identified (e.g., 'You are rushing through questions' or 'Solid pace, focus on weak concepts')"
  },
  "weak_areas": [
    {
      "topic": "Broader topic name",
      "sub_concept": "Specific theory/pattern missed (e.g., 'Closure scope in nested functions')",
      "correction": "Explanation of the right logic with reference to the question context"
    }
  ],
  "study_plan": [
    {
      "day": "Day 1",
      "tasks": ["Specific task 1", "Specific task 2"],
      "search_terms": ["exact Google search query 1", "exact query 2"]
    }
  ]
}`;

    // Build detailed question data for AI analysis
    const questionDetails = questions.map((q, idx) => ({
      number: idx + 1,
      topic: q.topic,
      questionText: q.questionText || "N/A", // Actual question content
      userAnswer: q.userAnswer || "Not answered",
      correctAnswer: q.correctAnswer || "N/A",
      status: q.status
    }));

    const userData = `
QUIZ PERFORMANCE DATA:
- Score: ${score}/${totalQuestions} (${((score / totalQuestions) * 100).toFixed(1)}%)
- Time Taken: ${timeTaken}
- Topic Performance: ${JSON.stringify(topicPerformance, null, 2)}

DETAILED QUESTIONS (with context):
${JSON.stringify(questionDetails, null, 2)}

ANALYSIS TASK:
1. Determine if the user is rushing (low time + low score = rushing)
2. For each incorrect answer, identify the SPECIFIC sub-concept gap by comparing their answer to the correct one
3. Reference actual question text to explain what they missed
4. Create a 3-5 day study plan with concrete Google search terms
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                title: { type: "string" },
                short_description: { type: "string" },
                behavioral_insight: { type: "string" }
              },
              required: ["title", "short_description", "behavioral_insight"]
            },
            weak_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  sub_concept: { type: "string" },
                  correction: { type: "string" }
                },
                required: ["topic", "sub_concept", "correction"]
              }
            },
            study_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  tasks: {
                    type: "array",
                    items: { type: "string" }
                  },
                  search_terms: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["day", "tasks", "search_terms"]
              }
            }
          },
          required: ["summary", "weak_areas", "study_plan"]
        }
      }
    });
    
    const result = await model.generateContent(`${systemPrompt}\n\n${userData}`);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const analysisJson = JSON.parse(text);

    // Save the AI analysis to the quiz result (store as JSON string)
    await QuizResult.findByIdAndUpdate(
      resultId,
      { aiAnalysis: JSON.stringify(analysisJson) },
      { new: true }
    );

    res.json({ analysis: analysisJson });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    res.status(500).json({ 
      message: "Failed to generate AI analysis", 
      error: error.message 
    });
  }
});

export default router;
