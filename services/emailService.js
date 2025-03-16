// services/emailService.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { EMAIL_USER, EMAIL_PASSWORD, BASE_URL } = process.env;

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send verification email to user
 * @param {string} to - Recipient email
 * @param {string} verificationToken - Token for verification
 * @returns {Promise} - Nodemailer send mail promise
 */
export const sendVerificationEmail = async (to, verificationToken) => {
  // Create verification URL
  const verificationUrl = `${BASE_URL}/api/auth/verify/${verificationToken}`;

  // Setup email options
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: "Email Verification",
    html: `
      <h1>Welcome to our service!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  // Send email
  return transporter.sendMail(mailOptions);
};

/**
 * Resend verification email to user
 * @param {string} to - Recipient email
 * @param {string} verificationToken - Token for verification
 * @returns {Promise} - Nodemailer send mail promise
 */
export const resendVerificationEmail = async (to, verificationToken) => {
  return sendVerificationEmail(to, verificationToken);
};
