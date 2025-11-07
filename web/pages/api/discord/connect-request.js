// web/pages/api/discord/connect-request.js
// This POST will be called by the website when user chooses "Discord User ID" method.
// It will call the bot webhook endpoint (bot receives and links if member exists).
import fetch from 'node-fetch';
import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { emailOrSessionUserId, discordId } = req.body;
  if (!discordId || !emailOrSessionUserId) return res.status(400).json({ error: 'missing' });

  // find user
  const user = db.findUserById(emailOrSessionUserId) || db.findUserByEmail(emailOrSessionUserId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  // Call bot's internal webhook (bot hosted elsewhere) or process locally if bot exposes endpoint.
  const botEndpoint = `${process.env.BASE_URL}/api/discord/complete-verify`; // if bot and web share endpoint; else point to bot host
  // For demo: we call our own complete-verify with secret — in production you might expose a bot endpoint.
  const r = await fetch(botEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-webhook-secret': process.env.WEBHOOK_SECRET },
    body: JSON.stringify({ code: 'connect-'+discordId, discordId })
  });
  const data = await r.json();
  if (!data.ok) return res.status(500).json({ error: 'bot failed', detail: data });

  // mark user as linked
  db.updateUser(user.id, { discordId, verified: true });
  return res.json({ ok: true });
}
