import express from "express";
import nodemailer from "nodemailer";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// 1. The "Postman" Configuration
// This MUST be YOUR account (or a dedicated app account)
// This account effectively "delivers" the message.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your App's Email
    pass: process.env.EMAIL_PASS, // Your App's 16-char Password
  },
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    const userId = req.user.id;

    // Fetch who is sending the feedback
    const user = await User.findById(userId);
    const userEmail = user ? user.email : "Unknown";
    const userName = user ? user.name : "Anonymous";

    if (!feedback) {
      return res.status(400).json({ message: "Feedback cannot be empty" });
    }

    // 2. Configure the Email Structure
    const mailOptions = {
      from: `"BS Companion App" <${process.env.EMAIL_USER}>`, // Sender: Your App
      to: process.env.MY_EMAIL, // Receiver: YOU
      replyTo: userEmail,       // <--- THE MAGIC TRICK: Replies go to the User!
      subject: `Feedback from ${userName}`,
      html: `
        <div style="border: 1px solid #ccc; padding: 20px; font-family: sans-serif;">
          <h2>User Feedback</h2>
          <p><strong>From:</strong> ${userName} (<a href="mailto:${userEmail}">${userEmail}</a>)</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <hr />
          <h3>Message:</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${feedback}
          </p>
        </div>
      `,
    };

    // 3. Send it
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Feedback sent!" });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send feedback" });
  }
});

export default router;