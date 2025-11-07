// save.js
import db from '../../lib/db';
export default function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end();
  const { userId, cookies, cps, upgrades } = req.body;
  const user = db.findUserById(userId);
  if(!user) return res.status(404).json({error:'not found'});
  db.updateUser(user.id, { cookies, cps, upgrades });
  return res.json({ ok: true });
}
