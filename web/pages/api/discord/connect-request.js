// web/pages/api/discord/connect-request.js
import db from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { emailOrSessionUserId, discordId } = req.body || {};
  if (!emailOrSessionUserId || !discordId) return res.status(400).json({ error: 'missing fields' });

  const user = db.findUserById(emailOrSessionUserId) || db.findUserByEmail(emailOrSessionUserId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  // If you have a separate bot webhook URL, call it here to ask the bot to verify membership.
  // Provide BOT_WEBHOOK_URL env var = https://your-bot-host/discord/link (or similar)
  const botWebhook = process.env.BOT_WEBHOOK_URL;
  if (botWebhook) {
    try {
      const resp = await fetch(botWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': process.env.WEBHOOK_SECRET },
        body: JSON.stringify({ discordId, userId: user.id })
      });
      const data = await resp.json().catch(()=>null);
      if (!resp.ok) return res.status(502).json({ error: 'bot webhook failed', detail: data });
      // assume bot confirmed
      db.updateUser(user.id, { discordId, verified: true });
      return res.json({ ok: true, message: 'requested bot to link; marked verified.' });
    } catch (e) {
      console.error('bot webhook error', e);
      return res.status(502).json({ error: 'bot call error' });
    }
  }

  // Fallback: mark user as linked locally (not secure) — prefer using botWebhook above
  db.updateUser(user.id, { discordId, verified: true });
  return res.json({ ok: true, message: 'linked (no bot webhook configured)' });
}
