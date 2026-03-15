// server/utils/email.js

/*
  WHAT THIS FILE DOES:
  Handles all email sending via Nodemailer.
  Only one job: send emails. Nothing else.
*/

import nodemailer from 'nodemailer';
import config from '../config/index.js';

// Create a reusable transporter (the "email sender")
const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false, // false = STARTTLS (port 587), true = SSL (port 465)
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

// Send an OTP email
// Called by AuthService whenever an OTP needs to be sent
export const sendOtpEmail = async (toEmail, otp, purpose = 'verification') => {
  const subjects = {
    verification: 'Verify your Digital Wallet account',
    reset: 'Reset your Digital Wallet password',
    '2fa': 'Your Digital Wallet login OTP',
  };

  const labels = {
    verification: 'activate your account',
    reset: 'reset your password',
    '2fa': 'complete your login',
  };

  await transporter.sendMail({
    from: config.emailFrom,
    to: toEmail,
    subject: subjects[purpose] || 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #4F46E5;">Digital Wallet</h2>
        <p>Use the OTP below to ${labels[purpose] || 'continue'}:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                    color: #4F46E5; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6B7280;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6B7280; font-size: 12px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};