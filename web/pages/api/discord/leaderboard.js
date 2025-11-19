// web/pages/api/discord/leaderboard.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const users = db.getUsers();
  
  // Filter users who have Discord linked and have cookies
  const linkedUsers = users
    .filter(u => u.discordId && u.cookies > 0)
    .map(u => ({
      discordId: u.discordId,
      cookies: u.cookies || 0,
      cps: u.cps || 0,
      totalCookies: u.totalCookies || 0
    }))
    .sort((a, b) => b.cookies - a.cookies)
    .slice(0, 50); // Top 50

  return res.json({
    leaderboard: linkedUsers,
    total: linkedUsers.length
  });
}
