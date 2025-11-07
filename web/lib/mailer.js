// web/lib/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true only for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendVerificationEmail(to, code) {
  const from = process.env.FROM_EMAIL || 'Winter Game <no-reply@localhost>';
  const html = `
    <div style="font-family:Arial, sans-serif; color:#0b1733">
      <h2>❄️ Winter Cookie — verification</h2>
      <p>Your verification code: <strong style="font-size:20px">${code}</strong></p>
      <p>Send this code to the Discord bot via <code>/verify CODE</code> to link accounts.</p>
      <hr/>
      <small>If you didn't request this, ignore this email.</small>
    </div>
  `;
  return transporter.sendMail({ from, to, subject: 'Your Winter Cookie verification code ❄️', html });
}
