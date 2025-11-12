import express from "express";
import cors from "cors";
import dotenv from "dotenv";
  // ✅ Needed for Brevo API

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => res.send("✅ Backend running with BREVO API"));

// ✅ Contact endpoint (send + auto-reply)
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    // 1️⃣ SEND EMAIL TO YOU
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Portfolio Website", email: process.env.SENDER_EMAIL },
        to: [{ email: process.env.RECEIVER_EMAIL }],
        subject: `New Message from ${name}`,
        htmlContent: `
          <h3>You received a new message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    // 2️⃣ AUTO-REPLY TO USER
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Charan Portfolio", email: process.env.SENDER_EMAIL },
        to: [{ email: email }], // ✅ Sends back to user
        subject: "✅ Thanks for contacting me!",
        htmlContent: `
          <p>Hi <b>${name}</b>,</p>
          <p>Thank you for reaching out! 🚀</p>
          <p>I have received your message and will reply as soon as possible.</p>
          <br>
          <p><b>Your message was:</b></p>
          <i>${message}</i>
          <br><br>
          <p>Best Regards,</p>
          <p><b>Charan H C</b></p>
        `,
      }),
    });

    res.status(200).json({ success: true, message: "Message + Auto-reply sent ✅" });
  } catch (error) {
    console.error("❌ Brevo API error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
