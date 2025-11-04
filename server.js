import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configure CORS properly
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend's dev URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// ✅ Contact endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing name, email, or message" });
    }

    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_PASS,
      },
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.CONTACT_EMAIL}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `📩 New Portfolio Message from ${name}`,
      html: `
        <h3>New Message from Portfolio</h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap;">${escapeHtml(message)}</div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent from ${email}`);
    // ✅ Make sure to always return 200 JSON
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("❌ Error sending mail:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to send message",
      details: err.message,
    });
  }
});

// Simple sanitizer
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
