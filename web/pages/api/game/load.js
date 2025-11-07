// web/pages/api/game/load.js
const db = require('../../../lib/db');

module.exports = (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'missing userId' });
  const user = db.findUserById(userId) || db.findUserByEmail(userId);
  if (!user) return res.status(404).json({ error: 'not found' });
  return res.json({ cookies: user.cookies || 0, cps: user.cps || 0, upgrades: user.upgrades || [] });
};
