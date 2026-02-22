import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

const useSendGrid = process.env.MAIL_SERVICE !== "local";
const senderEmail = process.env.SENDER_EMAIL || "noreply@solvex.com";
const senderName = "Solve-The-X";

// Initialize SendGrid if needed
if (useSendGrid && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create SMTP transporter if needed
const smtpTransporter = !useSendGrid
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  await sgMail.send({
    to,
    from: {
      email: senderEmail,
      name: senderName,
    },
    subject,
    text,
    html,
  });
}

/**
 * Send email via SMTP
 */
async function sendViaSMTP(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  if (!smtpTransporter) {
    throw new Error("SMTP transporter not configured");
  }

  await smtpTransporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send verification code email
 */
export async function sendVerificationEmail(to: string, code: string) {
  const subject = "Verify your account";
  const text = `Your verification code is: ${code}`;
  const html = `<p>Your verification code is: <b>${code}</b></p>`;

  if (useSendGrid) {
    return sendViaSendGrid(to, subject, text, html);
  }
  return sendViaSMTP(to, subject, text, html);
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  content: string
) {
  const html = `<p>${content}</p>`;

  if (useSendGrid) {
    return sendViaSendGrid(to, subject, content, html);
  }
  return sendViaSMTP(to, subject, content, html);
}
