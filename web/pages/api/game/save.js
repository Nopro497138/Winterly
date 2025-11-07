// web/pages/api/game/save.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { userId, cookies, cps, upgrades } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'missing userId' });
  const user = db.findUserById(userId) || db.findUserByEmail(userId);
  if (!user) return res.status(404).json({ error: 'not found' });
  db.updateUser(user.id, { cookies: Number(cookies || 0), cps: Number(cps || 0), upgrades: Array.isArray(upgrades) ? upgrades : [] });
  return res.json({ ok: true });
}
