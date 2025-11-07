// web/lib/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationEmail(to, code) {
  const from = process.env.FROM_EMAIL || 'Winter Game <no-reply@localhost>';
  return transporter.sendMail({
    from,
    to,
    subject: 'Your Winter Cookie Game verification code ❄️',
    html: `<div style="font-family:Arial;color:#0b3d91;">
      <h2>Winter Cookie Game — verification</h2>
      <p>Your verification code: <strong style="font-size:20px">${code}</strong></p>
      <p>Send this code to the Discord bot using <code>/verify ${code}</code> to link your account.</p>
      <p>If you didn't request this, ignore this email.</p>
    </div>`
  });
}

module.exports = { sendVerificationEmail };
