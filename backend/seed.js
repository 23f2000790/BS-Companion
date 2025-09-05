import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Subject from "./models/Subjects.js";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI);

async function seedDatabase() {
  try {
    const dataDir = path.join(__dirname, "questionbank");

    // 1. Load all JSON files
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
    if (files.length === 0) {
      console.log("⚠️ No JSON files found in /questionbank");
      return mongoose.disconnect();
    }

    let allQuestions = [];
    files.forEach((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
      allQuestions = allQuestions.concat(raw);
    });

    // 2. Group by subject + exam
    const subjectsMap = {};

    allQuestions.forEach((q) => {
      const { subject, exam, correctOption, options, ...rest } = q;

      // Auto-detect question type
      let questionType = "single";
      if (Array.isArray(correctOption)) questionType = "multiple";
      if (!options || Object.keys(options).length === 0)
        questionType = "numerical";

      const formattedQuestion = {
        ...rest,
        options: options || null,
        correctOption,
        questionType,
      };

      if (!subjectsMap[subject]) {
        subjectsMap[subject] = {
          subjectName: subject,
          papers: { quiz1: [], quiz2: [], ET: [] },
        };
      }

      if (exam && subjectsMap[subject].papers[exam]) {
        subjectsMap[subject].papers[exam].push(formattedQuestion);
      } else {
        console.warn(`⚠️ Skipped question with invalid exam type: ${exam}`);
      }
    });

    // 3. Upsert subjects into DB
    for (const subject of Object.values(subjectsMap)) {
      let existing = await Subject.findOne({
        subjectName: subject.subjectName,
      });
      let newCount = 0,
        skippedCount = 0;

      if (existing) {
        const mergedPapers = { ...existing.papers };

        ["quiz1", "quiz2", "ET"].forEach((exam) => {
          const oldQuestions = mergedPapers[exam] || [];
          const newQuestions = subject.papers[exam] || [];

          // Dedup key: question + term + exam
          const seen = new Set(
            oldQuestions.map((q) => `${q.question}::${q.term || ""}::${exam}`)
          );
          const combined = [...oldQuestions];

          newQuestions.forEach((q) => {
            const key = `${q.question}::${q.term || ""}::${exam}`;
            if (!seen.has(key)) {
              combined.push(q);
              seen.add(key);
              newCount++;
            } else {
              skippedCount++;
            }
          });

          mergedPapers[exam] = combined;
        });

        existing.papers = mergedPapers;
        await existing.save();
        console.log(
          `🔄 Updated subject: ${subject.subjectName} (+${newCount} new, skipped ${skippedCount})`
        );
      } else {
        await Subject.create(subject);
        const totalNew =
          subject.papers.quiz1.length +
          subject.papers.quiz2.length +
          subject.papers.ET.length;
        console.log(
          `✅ Created new subject: ${subject.subjectName} (+${totalNew})`
        );
      }
    }

    mongoose.disconnect();
    console.log("🌱 Seeding completed!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    mongoose.disconnect();
  }
}

seedDatabase();
