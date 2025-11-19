// web/pages/api/register.js
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../../lib/db.js';
import { sendVerificationEmail } from '../../lib/mailer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if user already exists
  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  
  // Generate unique ID and verification code
  const id = uuidv4();
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  // Create new user
  const user = {
    id,
    email,
    password: hashed,
    verified: false,
    verificationCode: code,
    cookies: 0,
    cps: 0,
    upgrades: {},
    totalCookies: 0,
    clickPower: 1,
    createdAt: new Date().toISOString()
  };

  db.addUser(user);

  // Send verification email
  try {
    await sendVerificationEmail(email, code);
    return res.status(200).json({
      ok: true,
      message: 'Registration successful! Check your email for the verification code.'
    });
  } catch (err) {
    console.error('Failed to send verification email:', err);
    
    // In development, return the code directly
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        ok: true,
        warn: 'Email service unavailable. Your verification code is below.',
        code: code
      });
    }
    
    // In production, still create the account but inform about email issue
    return res.status(200).json({
      ok: true,
      warn: 'Account created but email service is temporarily unavailable. Please contact support with your email address to get your verification code.'
    });
  }
}
