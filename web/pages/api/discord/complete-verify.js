// web/pages/api/discord/complete-verify.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook secret
  const secret = req.headers['x-webhook-secret'] || req.body?.secret;
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Unauthorized - Invalid secret' });
  }

  const { code, discordId, username } = req.body || {};
  
  if (!code || !discordId) {
    return res.status(400).json({ error: 'Missing code or discordId' });
  }

  // Find user with this verification code
  const users = db.getUsers();
  const user = users.find(u => u.verificationCode === code);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'Verification code not found or already used',
      ok: false 
    });
  }

  // Check if Discord ID is already linked to another account
  const existingDiscord = users.find(u => u.discordId === discordId && u.id !== user.id);
  if (existingDiscord) {
    return res.status(400).json({
      error: 'This Discord account is already linked to another user',
      ok: false
    });
  }

  // Update user: mark as verified, link Discord, remove verification code
  db.updateUser(user.id, {
    verified: true,
    discordId: discordId,
    discordUsername: username || null,
    verificationCode: null,
    verifiedAt: new Date().toISOString()
  });

  return res.json({
    ok: true,
    message: 'Account successfully linked to Discord',
    userId: user.id,
    email: user.email
  });
}
