import express from "express";
import { Resend } from "resend";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", verifyToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    const userId = req.user.id;

    // Fetch user details
    const user = await User.findById(userId);
    const userEmail = user ? user.email : "Unknown";
    const userName = user ? user.name : "Anonymous";

    if (!feedback) {
      return res.status(400).json({ message: "Feedback cannot be empty" });
    }

    // Send Email via Resend API
    // Note: 'onboarding@resend.dev' is a magic sender that works for testing.
    // It can ONLY send emails to the email address you signed up with (YOU).
    await resend.emails.send({
      from: "BS Companion <onboarding@resend.dev>",
      to: process.env.MY_EMAIL, // This MUST be the email you used to sign up for Resend
      replyTo: userEmail,
      subject: `📢 Feedback from ${userName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h3>New User Feedback</h3>
          <p><strong>User:</strong> ${userName} (${userEmail})</p>
          <p><strong>ID:</strong> ${userId}</p>
          <hr />
          <p style="font-size: 16px; background: #f9f9f9; padding: 15px;">
            ${feedback}
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "Feedback sent successfully!" });

  } catch (error) {
    console.error("Resend Error:", error);
    res.status(500).json({ message: "Failed to send feedback" });
  }
});

export default router;