import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  photoURL: String,
  googleId: { type: String, unique: true, sparse: true },
  avatar: String,
  gender: String,
  state: String,
  city: String,
  bloodGroup: String,
  currentLevel: String,
  subjects: [String],
  onboardingCompleted: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
