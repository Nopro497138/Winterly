// web/pages/api/discord/stats.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { discordId } = req.query;
  if (!discordId) {
    return res.status(400).json({ error: 'Missing discordId' });
  }

  const users = db.getUsers();
  const user = users.find(u => u.discordId === discordId);

  if (!user) {
    return res.json({ found: false });
  }

  return res.json({
    found: true,
    cookies: user.cookies || 0,
    cps: user.cps || 0,
    upgrades: user.upgrades || {},
    totalCookies: user.totalCookies || 0,
    verified: user.verified || false
  });
}
