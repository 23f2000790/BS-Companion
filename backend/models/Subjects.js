import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  term: { type: String },
  topic: { type: String },

  // Options are optional (for numerical/fill-in questions)
  options: {
    type: Object,
    of: String,
    default: null, // For numerical questions
  },

  // Accepts string, array, or number depending on question type
  correctOption: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  // Helps identify question type: "single", "multiple", or "numerical"
  questionType: {
    type: String,
    enum: ["single", "multiple", "numerical"],
    default: "single",
  },
});

const PaperSchema = new mongoose.Schema({
  quiz1: [QuestionSchema],
  quiz2: [QuestionSchema],
  ET: [QuestionSchema],
});

const SubjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  papers: {
    type: PaperSchema,
    default: {},
  },
});

export default mongoose.model("Subject", SubjectSchema);
