// web/pages/index.js
import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'; // optional: create CSS module or inline styles

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [cookies, setCookies] = useState(0);
  const [cps, setCps] = useState(0);
  const [upgrades, setUpgrades] = useState([]);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem('wc_userId');
    if (uid) {
      setUserId(uid);
      fetch(`/api/game/load?userId=${encodeURIComponent(uid)}`).then(r=>r.json()).then(d=>{
        if (!d.error) {
          setCookies(d.cookies || 0);
          setCps(d.cps || 0);
          setUpgrades(d.upgrades || []);
        }
      });
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (cps > 0) setCookies(c => Math.round((c + cps) * 100)/100);
    }, 1000);
    return () => clearInterval(t);
  }, [cps]);

  function clickCookie() {
    setCookies(prev => prev + 1);
  }

  function buy(cost, addCps, name) {
    if (cookies >= cost) {
      setCookies(cookies - cost);
      setCps(cps + addCps);
      setUpgrades(u => [...u, name]);
    } else {
      // small shake animation could be added
    }
  }

  async function save() {
    if (!userId) return alert('Please sign in first');
    await fetch('/api/game/save', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId, cookies, cps, upgrades })
    });
    alert('Saved!');
  }

  return (
    <div style={{minHeight:'100vh', padding:24, background:'#071033', color:'#fff', fontFamily:'Inter,Arial'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontSize:28}}>❄️ Winter Cookie — Christmas Clicker</h1>
        <div>
          {userId ? <span style={{opacity:0.9}}>Signed in: <strong>{userId}</strong></span> : <button onClick={()=>setShowLogin(true)}>Sign in</button>}
        </div>
      </div>

      <main style={{display:'flex', gap:20, marginTop:28}}>
        <div style={{flex:1, textAlign:'center'}}>
          <div
            onClick={clickCookie}
            style={{
              margin:'0 auto',
              width:340, height:340, borderRadius:20,
              background: 'radial-gradient(circle at 30% 20%, #fff 0%, #ffe9d6 40%, #f2c57e 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 20px 40px rgba(0,0,0,0.6)',
              cursor:'pointer',
              transition:'transform .08s',
            }}
            onMouseDown={e=> e.currentTarget.style.transform='scale(.98)'}
            onMouseUp={e=> e.currentTarget.style.transform='scale(1)'}
          >
            <img src="/assets/winter_cookie.png" alt="cookie" style={{width:260, height:260}} />
          </div>

          <div style={{marginTop:14}}>
            <h2 style={{fontSize:24}}>{Math.floor(cookies)} Cookies</h2>
            <p style={{opacity:0.9}}>{cps} cookies / sec</p>

            <div style={{display:'flex', gap:10, justifyContent:'center', marginTop:12}}>
              <button onClick={()=>buy(50,1,'Sugar Frosting')}>Buy Sugar Frosting (50)</button>
              <button onClick={()=>buy(200,5,'Candy Cane Machine')}>Buy Candy Cane (200)</button>
            </div>

            <div style={{marginTop:10}}>
              <button onClick={save}>Save</button>
            </div>
          </div>
        </div>

        <aside style={{width:320}}>
          <div style={{padding:12, borderRadius:10, background:'rgba(255,255,255,0.03)'}}>
            <h3>Upgrades</h3>
            <ul>
              {upgrades.map((u,i)=><li key={i}>{u}</li>)}
            </ul>
          </div>

          <div style={{marginTop:12, padding:12, borderRadius:10, background:'rgba(255,255,255,0.02)'}}>
            <h4>How to link</h4>
            <ol style={{fontSize:14, lineHeight:1.4}}>
              <li>Register with Email → get code via email → use <code>/verify CODE</code> in Discord bot.</li>
              <li>Or enter your Discord User ID on the site and click connect (bot will link if configured).</li>
            </ol>
          </div>
        </aside>
      </main>

      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onSuccess={(id)=>{ localStorage.setItem('wc_userId', id); setUserId(id); setShowLogin(false); }} />}
    </div>
  );
}

function LoginModal({onClose, onSuccess}) {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [discordId, setDiscordId] = useState('');

  async function registerEmail() {
    if (!email || !pw) return alert('email + password needed');
    const res = await fetch('/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pw }) });
    const data = await res.json();
    if (data.ok) {
      alert('Verification code sent to email. Use /verify CODE in Discord.');
      onSuccess(email);
    } else {
      alert('Error: ' + JSON.stringify(data));
    }
  }

  async function connectDiscordId() {
    const sessionUser = prompt('Enter your registered email or userId (for demo):');
    if (!sessionUser) return;
    const res = await fetch('/api/discord/connect-request', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ emailOrSessionUserId: sessionUser, discordId })
    });
    const d = await res.json();
    if (d.ok) {
      alert('Connection requested — if bot verified you, you are linked.');
      onSuccess(sessionUser);
    } else {
      alert('Error: ' + JSON.stringify(d));
    }
  }

  return (
    <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.6)'}}>
      <div style={{width:560, background:'#071033', padding:20, borderRadius:12, color:'#fff'}}>
        <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
          <h2>Sign up / Connect — Winter Cookie</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div style={{marginTop:12}}>
          <button onClick={()=>setMode('email')} style={{marginRight:8}}>Email</button>
          <button onClick={()=>setMode('discord')}>Discord ID</button>
        </div>

        {mode === 'email' ? (
          <div style={{marginTop:12}}>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
            <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
            <div><button onClick={registerEmail}>Register & Send Verification</button></div>
          </div>
        ) : (
          <div style={{marginTop:12}}>
            <input placeholder="Discord User ID" value={discordId} onChange={e=>setDiscordId(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
            <div><button onClick={connectDiscordId}>Request link via Bot</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

