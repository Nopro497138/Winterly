// web/pages/api/register.js
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../../lib/db.js';
import { sendVerificationEmail } from '../../lib/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email & password required' });

  const existing = db.findUserByEmail(email);
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const code = Math.floor(100000 + Math.random()*900000).toString(); // 6-digit

  const user = {
    id,
    email,
    password: hashed,
    verified: false,
    verificationCode: code,
    cookies: 0,
    cps: 0,
    upgrades: []
  };

  db.addUser(user);

  try {
    await sendVerificationEmail(email, code);
    return res.status(200).json({ ok: true, message: 'Verification code sent to email.' });
  } catch (err) {
    console.error('Mail send failed', err);
    // For local dev fallback: return code (only in dev)
    const fallback = process.env.NODE_ENV === 'development' ? { code } : {};
    return res.status(200).json({ ok: true, warn: 'Mail failed (check SMTP).', ...fallback });
  }
}
