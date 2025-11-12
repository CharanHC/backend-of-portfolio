import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ In-memory email logs
const emailLogs = [];

// ✅ CORS (Allow every frontend)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => res.send("✅ Backend running successfully!"));

// ✅ Send email + auto reply + logging
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,  // <-- Brevo Login
    pass: process.env.BREVO_PASS,  // <-- Brevo SMTP Password
  },
});


    // ✅ Send mail to YOU
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.BREVO_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `📩 New message from ${name}`,
      html: `
        <h3>New Contact Form Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // ✅ Auto reply to sender
    await transporter.sendMail({
      from: `"Charan Portfolio" <${process.env.BREVO_USER}>`,
      to: email,
      subject: "✅ Thank you for contacting me!",
      html: `
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for reaching out. I received your message and will get back soon.</p>
        <br>
        <p>- Charan H C 🚀</p>
      `,
    });

    // ✅ save log
    emailLogs.push({
      name,
      email,
      message,
      date: new Date().toISOString(),
    });

    res.json({ success: true, message: "Mail sent & reply delivered ✅" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/logs", (req, res) => {
  res.json({ count: emailLogs.length, logs: [...emailLogs].reverse() });
});

app.delete("/api/logs", (req, res) => {
  emailLogs.length = 0;
  res.json({ success: true, message: "Logs cleared" });
});

app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
