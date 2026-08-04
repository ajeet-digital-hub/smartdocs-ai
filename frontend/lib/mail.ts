import sgMail from "@sendgrid/mail";

const SENDER_EMAIL = process.env.EMAIL_FROM || "Fromsrofficial1974@gmail.com";
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "Replysrofficial1974@gmail.com";
const SENDER_NAME = process.env.EMAIL_SENDER_NAME || "SmartDocs AI";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY is not set. Emails will not be sent.");
}

export const sendPasswordResetEmail = async (to: string, token: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Cannot send email: SENDGRID_API_KEY is not configured.");
    // In a real app, you might want to throw an error or handle this differently
    return;
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

  const msg = {
    to,
    from: { email: SENDER_EMAIL, name: SENDER_NAME },
    replyTo: REPLY_TO_EMAIL,
    subject: "Reset Your SmartDocs AI Password",
    html: `
      <p>You are receiving this email because a password reset request was made for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  };

  await sgMail.send(msg);
};

