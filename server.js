import express from "express";
import cors from "cors";
import dotenv from "dotenv";


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

// Health check
app.get("/", (req, res) => res.send("✅ Backend running with BREVO API"));

// Contact endpoint
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // ✅ API key used here
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

    const result = await brevoResponse.json();
    console.log("✅ Brevo API response:", result);

    res.status(200).json({ success: true, message: "Email sent successfully ✅" });
  } catch (error) {
    console.error("❌ Brevo API error:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
