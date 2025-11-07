// web/pages/api/discord/connect-request.js
const db = require('../../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { emailOrSessionUserId, discordId } = req.body;
  if (!discordId || !emailOrSessionUserId) return res.status(400).json({ error: 'missing' });

  const user = db.findUserById(emailOrSessionUserId) || db.findUserByEmail(emailOrSessionUserId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  // For demo we call our own verification endpoint — in production bot should expose a webhook or verify itself
  const botEndpoint = `${process.env.BASE_URL.replace(/\/$/, '')}/api/discord/complete-verify`;
  try {
    const r = await fetch(botEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-secret': process.env.WEBHOOK_SECRET },
      body: JSON.stringify({ code: `connect-${discordId}`, discordId })
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json({ error: 'bot failed', detail: data });
    db.updateUser(user.id, { discordId, verified: true });
    return res.json({ ok: true });
  } catch (err) {
    console.error('connect-request error', err);
    return res.status(500).json({ error: 'request failed', detail: String(err) });
  }
};
