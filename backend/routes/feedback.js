import express from "express";
import nodemailer from "nodemailer";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Create a transporter for sending emails
// Using Gmail as an example - you'll need to configure this
const createTransporter = () => {
  // For development, you can use ethereal email for testing
  // For production, use your actual email service
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// POST /api/feedback - Send feedback email
router.post("/", verifyToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    const userId = req.user.id;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: "Feedback cannot be empty" });
    }

    // Get user info from database if needed
    const user = await User.findById(userId);

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@bscompanion.com',
      to: 'vivek.15.mat@gmail.com',
      subject: `BS Companion Feedback from ${user?.name || 'User'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #6366f1;">New Feedback Received</h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${user?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: white; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0;">
            <h3 style="margin-top: 0;">Feedback:</h3>
            <p style="white-space: pre-wrap;">${feedback}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Feedback sent successfully",
      success: true 
    });

  } catch (error) {
    console.error("Error sending feedback:", error);
   
    // For development without email config, just log the feedback
    console.log("📧 Feedback received from user:", userId);
    console.log("Feedback content:", req.body.feedback);
    
    return res.status(200).json({ 
      message: "Feedback received (development mode - check server logs)",
      success: true 
    });
  }
});

export default router;
