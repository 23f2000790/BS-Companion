import mongoose from "mongoose";

const answeredQuestionSchema = new mongoose.Schema(
  {
    // Storing the original question's ID for reference
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // The answer provided by the user (can be a string, number, or array for multiple choice)
    userAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // The status of the user's answer
    status: {
      type: String,
      enum: ["correct", "incorrect", "partially_correct", "not_attempted"],
      required: true,
    },
    // Marks obtained for this specific question
    marks: {
      type: Number,
      required: true,
      default: 0,
    },
    // Storing the topic for easier analysis later
    topic: {
      type: String,
      required: true,
    },
  },
  { _id: false }
); // We don't need a separate _id for each answered question in the array

const QuizResultSchema = new mongoose.Schema(
  {
    // Link to the user who took the quiz
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The subject of the quiz
    subject: {
      type: String,
      required: true,
    },
    // The term, if specified for the quiz
    term: {
      type: String,
      default: null,
    },
    // The exam type (e.g., 'quiz1', 'quiz2', 'ET')
    exam: {
      type: String,
      default: null,
    },
    // Detailed breakdown of each question in the quiz
    questions: [answeredQuestionSchema],
    // The exact time the quiz was started
    startTime: {
      type: Date,
      required: true,
    },
    // The exact time the quiz was finished
    endTime: {
      type: Date,
      required: true,
    },
    // Total time taken in seconds
    timeTaken: {
      type: Number, // Stored in seconds
      required: true,
    },
    // Final score for the entire quiz
    score: {
      type: Number,
      required: true,
    },
    // Total questions in the quiz
    totalQuestions: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
  }
);

export default mongoose.model("QuizResult", QuizResultSchema);
