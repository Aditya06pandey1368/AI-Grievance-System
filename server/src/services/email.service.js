import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create Transporter (Configure this with your Gmail or SMTP later)
// For now, it just logs to console if no credentials are set
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send failed:', error);
  }
};

export const sendSLABreachAlert = async (officerEmail, complaintId) => {
    const subject = `URGENT: SLA Breach Alert - Complaint #${complaintId}`;
    const text = `The complaint #${complaintId} has exceeded its resolution deadline. Please take immediate action.`;
    await sendEmail(officerEmail, subject, text);
};