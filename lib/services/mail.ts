import { Resend } from "resend";

const senderEmail = process.env.SENDER_EMAIL || "no-reply@solvex-eui.org";
const senderName = "Solve-The-X";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = new Resend(resendApiKey);

/**
 * Send email via Resend with diagnostic logging
 */
async function sendViaResend(to: string, subject: string, text: string, html: string) {
  console.log("📧 [Resend] Attempting to send email:", {
    from: `${senderName} <${senderEmail}>`,
    to,
    subject,
  });

  try {
    const result = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    
    console.log("✅ [Resend] Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ [Resend] Email send failed:", error);
    throw error;
  }
}

/**
 * Send verification code email
 */
export async function sendVerificationEmail(to: string, code: string) {
  const subject = "Verify your account";
  const text = `Your verification code is: ${code}`;
  const html = `<p>Your verification code is: <b>${code}</b></p>`;

  console.log("📨 [Mail Service] Sending verification email with code:", code.substring(0, 2) + "****");
  return sendViaResend(to, subject, text, html);
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

  console.log("📨 [Mail Service] Sending notification email:", subject);
  return sendViaResend(to, subject, content, html);
}
