import express from "express";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
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
      timeTaken 
    } = req.body;

    if (!resultId) {
      return res.status(400).json({ message: "resultId is required" });
    }

    // 1. Construct a richer prompt requesting Media & Graph Data
    const systemPrompt = `You are a Senior Technical Mentor. Your goal is to fix the user's specific knowledge gaps using multimedia resources and data visualization.

    INPUT CONTEXT:
    - Analyze the user's wrong answers to find the root cause (e.g., "Understanding Syntax" vs "Applying Logic").
    - Determine if they are rushing based on timeTaken.

    OUTPUT REQUIREMENTS (JSON ONLY):
    1. **summary**: High-level behavioral insight.
    2. **youtube_resources**: Provide 3 highly specific YouTube search queries based on their WEAKEST areas. Do NOT provide direct URLs (they break). Provide the search terms.
    3. **skill_radar_data**: Estimate the user's proficiency (0-100) in these 5 cognitive areas based on their answers: "Syntax Knowledge", "Debugging Logic", "System Architecture", "Security Best Practices", "Performance Optimization".
    4. **weak_areas**: Specific concept gaps with corrections.
    5. **follow_up_question**: Generate ONE new multiple-choice question targeting their biggest mistake to test immediate learning.`;

    // 2. Structure the User Data
    const questionDetails = questions.map((q, idx) => ({
      number: idx + 1,
      topic: q.topic,
      questionText: q.questionText || "N/A",
      userAnswer: q.userAnswer || "Not answered",
      correctAnswer: q.correctAnswer || "N/A",
      status: q.status
    }));

    const userData = `
    PERFORMANCE: Score: ${score}/${totalQuestions}, Time: ${timeTaken}
    TOPICS: ${JSON.stringify(topicPerformance)}
    QUESTIONS: ${JSON.stringify(questionDetails)}
    `;

    // 3. Define Strict Schema for Frontend Consumption
    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        summary: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            behavioral_insight: { type: SchemaType.STRING },
            archetype: { type: SchemaType.STRING, description: "Fun developer persona, e.g., 'The Cowboy Coder' or 'The Precision Engineer'" }
          },
          required: ["title", "behavioral_insight", "archetype"]
        },
        youtube_resources: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              video_title_idea: { type: SchemaType.STRING, description: "Suggested title of a video to look for" },
              search_query: { type: SchemaType.STRING, description: "Exact search query for YouTube API or URL" },
              reason: { type: SchemaType.STRING, description: "Why watch this?" }
            },
            required: ["topic", "search_query", "reason"]
          }
        },
        skill_radar_data: {
          type: SchemaType.ARRAY,
          description: "Data for a frontend Radar Chart",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              subject: { type: SchemaType.STRING, description: "e.g., Syntax, Logic, Security" },
              score: { type: SchemaType.NUMBER, description: "0 to 100" },
              fullMark: { type: SchemaType.NUMBER, description: "Always 100" }
            },
            required: ["subject", "score", "fullMark"]
          }
        },
        weak_areas: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              correction: { type: SchemaType.STRING }
            },
            required: ["topic", "correction"]
          }
        },
        follow_up_question: {
            type: SchemaType.OBJECT,
            description: "A generated practice question based on weak areas",
            properties: {
                question: { type: SchemaType.STRING },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                correct_answer: { type: SchemaType.STRING },
                explanation: { type: SchemaType.STRING }
            }
        }
      },
      required: ["summary", "youtube_resources", "skill_radar_data", "weak_areas", "follow_up_question"]
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    
    const result = await model.generateContent(`${systemPrompt}\n\n${userData}`);
    const response = await result.response;
    const text = response.text();
    const analysisJson = JSON.parse(text);

    // Save and Return
    await QuizResult.findByIdAndUpdate(
      resultId,
      { aiAnalysis: JSON.stringify(analysisJson) },
      { new: true }
    );

    res.json({ analysis: analysisJson });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    res.status(500).json({ message: "Failed to generate AI analysis", error: error.message });
  }
});

export default router;