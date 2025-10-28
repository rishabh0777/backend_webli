import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";

const app = express();

app.use(
  cors({
    origin: [
      "https://studious-halibut-gv96g4vvwqjc6x7-3000.app.github.dev",
      "https://webli.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "First req received" });
});

app.post("/send", async (req, res) => {
  const { name, email, company, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !company || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check environment variables
  if (!process.env.BREVO_USER || !process.env.BREVO_API_KEY || !process.env.RECIEVER_EMAIL) {
    return res.status(500).json({
      success: false,
      message: "Email credentials not configured properly",
    });
  }

  try {
    // Configure Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.BREVO_USER, // example: 9a32af001@smtp-brevo.com
        pass: process.env.BREVO_API_KEY, // your SMTP key from Brevo
      },
    });

    // Email template
    const mailOptions = {
      from: `"${name} via Webli" <${process.env.BREVO_USER}>`,
      to: process.env.RECIEVER_EMAIL,
      replyTo: email,
      subject: `Webli Message from ${name} (${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2a2a2a;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #ddd;" />
          <p style="margin-top: 20px;"><strong>Message:</strong></p>
          <div style="background: #fff; padding: 15px; border-left: 4px solid #1a73e8; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "✅ Email sent successfully via Brevo." });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ success: false, message: "Email sending failed." });
  }
});


export default app;




