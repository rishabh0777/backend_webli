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
  try {
    const { name, email, company, subject, message } = req.body;

    // ✅ Step 1: Validate body
    if (!name || !email || !company || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // ✅ Step 2: Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIEVER_EMAIL) {
      return res
        .status(500)
        .json({ success: false, message: "Email credentials not configured properly" });
    }

    // ✅ Step 3: Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Step 4: Email options
    const mailOptions = {
      from: `"${name} via Webli" <${process.env.EMAIL_USER}>`,
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

    // ✅ Step 5: Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
});

export default app;
