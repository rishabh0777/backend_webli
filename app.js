import { configDotenv } from "dotenv";
configDotenv();
import cors from 'cors';
import express from "express";
import nodemailer from 'nodemailer'

const app = express()

app.use(cors())

// app.use(cors({
//   origin: 'https://glorious-space-sniffle-q5r6w755g4qf4gg7-5173.app.github.dev',
//   credentials: true
// }));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));

app.get('/', async(req, res)=>{
  try{
    res.status(200).json({ success: true, message: 'First req recieved' })
  }catch(err){
    res.status(500).json({ success: false, message: err });
  }
})

app.post('/send', async (req,res)=>{
  const {name, email, company, subject, message} = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

 const mailOptions = {
  from: `"${name} via Webli" <${process.env.EMAIL_USER}>`,
  to: `${process.env.RECIEVER_EMAIL}`,
  replyTo: email,
  subject: `Webli Message from ${name} (${email})`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2a2a2a;">New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company || "N/A"}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr style="border: none; border-top: 1px solid #ddd;" />
      <p style="margin-top: 20px;"><strong>Message:</strong></p>
      <div style="background: #fff; padding: 15px; border-left: 4px solid #1a73e8; border-radius: 5px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `
};

try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
 

})


export default app;