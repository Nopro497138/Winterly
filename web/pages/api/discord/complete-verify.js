// web/pages/api/discord/complete-verify.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-webhook-secret'] || req.body?.secret;
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'bad secret' });
  }

  const { code, discordId } = req.body || {};
  if (!code || !discordId) return res.status(400).json({ error: 'missing code or discordId' });

  // find user with this verification code
  const users = db.getUsers();
  const user = users.find(u => u.verificationCode === code);
  if (!user) return res.status(404).json({ error: 'code not found' });

  db.updateUser(user.id, { verified: true, discordId, verificationCode: null });
  return res.json({ ok: true, message: 'linked' });
}
