// web/pages/api/game/save.js
const db = require('../../../lib/db');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { userId, cookies, cps, upgrades } = req.body;
  if (!userId) return res.status(400).json({ error: 'missing userId' });
  const user = db.findUserById(userId) || db.findUserByEmail(userId);
  if (!user) return res.status(404).json({ error: 'not found' });
  db.updateUser(user.id, { cookies, cps, upgrades });
  return res.json({ ok: true });
};
