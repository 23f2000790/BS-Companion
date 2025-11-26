import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
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
import studyGuidesRouter from "./routes/study-guides.js";

dotenv.config();
const app = express();
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Cache-Control middleware for static assets
app.use((req, res, next) => {
  // Cache images for 1 year (immutable assets)
  if (req.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache fonts, CSS, and JS for 30 days
  else if (req.url.match(/\.(woff|woff2|ttf|eot|css|js)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
  // Cache API responses - Disable caching for dynamic data
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // Enable ETag for better cache validation
  res.setHeader('ETag', 'W/"' + Date.now() + '"');
  next();
});

// Rate limiting - 500 requests per 15 minutes (adjusted for quiz usage)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to accommodate quiz sessions
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// HTTP request logger
app.use(morgan("dev"));

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use("/api/topics", topicsRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/terms", termsRouter);
app.use("/api/results", resultsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/study-guides", studyGuidesRouter);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

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

    // Lazy migration: Initialize AI usage fields for existing users if missing
    if (user.aiAnalysisCount === undefined) {
      user.aiAnalysisCount = 0;
      user.aiAnalysisResetDate = new Date();
      await user.save();
    }

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

const PORT = process.env.PORT || 5000;
// ---------- MongoDB connection ----------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
