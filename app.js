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

console.log("Receiver Email:", process.env.RECIEVER_EMAIL);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "First req received" });
});

// ✅ Gmail Send Route
app.post("/send", async (req, res) => {
  const { name, email, company, subject, message } = req.body;

  if (!name || !email || !subject || !message || !company) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    // ✅ Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_APP_PASS, // app password (not your login password)
      },
    });

    // ✅ Email format
    const mailOptions = {
      from: `"${name} via Webli" <${process.env.GMAIL_USER}>`,
      to: process.env.RECIEVER_EMAIL, // where you want to receive messages
      replyTo: email,
      subject: `New Inquiry from ${name} - ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px; border-radius:10px;">
          <h2 style="color:#333;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#fff; padding:10px; border-left:4px solid #4caf50;">
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


export default app;




