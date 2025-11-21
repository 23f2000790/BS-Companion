import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import { verifyToken } from "./middleware/auth.js";
import questionsRoute from "./routes/questions.js";
import topicsRoute from "./routes/topics.js";
import termsRouter from "./routes/terms.js";
import resultsRouter from "./routes/results.js";
import aiRouter from "./routes/ai.js";
import userRouter from "./routes/user.js";
import feedbackRouter from "./routes/feedback.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();
const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use("/api/topics", topicsRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/terms", termsRouter);
app.use("/api/results", resultsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/stats", statsRoutes);

const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";
const MONGO_URI = process.env.MONGO_URI;

// ---------- Register ----------
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user, isNew: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Login ----------
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Google Auth ----------
app.post("/auth/google", async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;

    let user = await User.findOne({ email });
    let isNew = false;

    if (!user) {
      user = new User({ name, email, photoURL });
      await user.save();
      isNew = true;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user, isNew });
  } catch (error) {
    console.error("Error in Google Auth:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Fetch User ----------
app.get("/getuser", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user, needsOnboarding: !user.onboardingCompleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- User Onboarding ----------
app.post("/useronboarding", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      username,
      avatar,
      gender,
      state,
      city,
      bloodGroup,
      currentLevel,
      subjects,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: username,
        avatar,
        gender,
        state,
        city,
        bloodGroup,
        currentLevel,
        subjects,
        onboardingCompleted: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Onboarding completed successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in onboarding:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//  Add / Remove subjects for logged-in user

app.put("/user/update-subjects", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { add = [], remove } = req.body;
    const update = {};

    // add subjects (array)
    if (Array.isArray(add) && add.length > 0) {
      update.$addToSet = { subjects: { $each: add } }; // avoids duplicates
    }

    // remove single subject
    if (remove) {
      update.$pull = { subjects: remove };
    }

    if (!update.$addToSet && !update.$pull) {
      return res
        .status(400)
        .json({ message: "Provide 'add' array and/or 'remove' string." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Subjects updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating subjects:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- MongoDB connection ----------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
