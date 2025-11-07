// web/pages/api/game/load.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'missing userId' });
  const user = db.findUserById(userId) || db.findUserByEmail(userId);
  if (!user) return res.status(404).json({ error: 'not found' });
  const { cookies = 0, cps = 0, upgrades = [] } = user;
  return res.json({ cookies, cps, upgrades, verified: !!user.verified });
}
