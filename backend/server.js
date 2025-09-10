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
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/topics", topicsRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/terms", termsRouter);

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";
const MONGO_URI = process.env.MONGO_URI;

// -------------------- Register --------------------
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

// -------------------- Login --------------------
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

// -------------------- Google Auth --------------------
app.post("/auth/google", async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;

    let user = await User.findOne({ email });
    let isNew = false;

    // Create user if not exists
    if (!user) {
      user = new User({ name, email, photoURL });
      await user.save();
      isNew = true;
    }

    // Create JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user, isNew });
  } catch (error) {
    console.error("Error in Google Auth:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Fetch User --------------------
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

// -------------------- User Onboarding --------------------
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

    // Update user details
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

// -------------------- MongoDB connection --------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
