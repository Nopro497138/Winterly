// web/pages/index.js
import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';

const UPGRADES_SHOP = [
  { id: 'cursor', name: 'Magic Elf', baseCost: 15, cps: 0.1, icon: '🧝', desc: 'A helpful elf clicks for you' },
  { id: 'grandma', name: 'Cookie Grandma', baseCost: 100, cps: 1, icon: '👵', desc: 'Bakes cookies the old-fashioned way' },
  { id: 'farm', name: 'Cookie Farm', baseCost: 1100, cps: 8, icon: '🏡', desc: 'Grows cookie ingredients' },
  { id: 'mine', name: 'Sugar Mine', baseCost: 12000, cps: 47, icon: '⛏️', desc: 'Extracts pure sugar crystals' },
  { id: 'factory', name: 'Cookie Factory', baseCost: 130000, cps: 260, icon: '🏭', desc: 'Industrial cookie production' },
  { id: 'bank', name: 'Cookie Bank', baseCost: 1400000, cps: 1400, icon: '🏦', desc: 'Invests cookies for profit' },
  { id: 'temple', name: 'Cookie Temple', baseCost: 20000000, cps: 7800, icon: '⛩️', desc: 'Blessed by cookie gods' },
  { id: 'wizard', name: 'Wizard Tower', baseCost: 330000000, cps: 44000, icon: '🧙', desc: 'Conjures cookies from thin air' },
  { id: 'shipment', name: 'Santa\'s Workshop', baseCost: 5100000000, cps: 260000, icon: '🎅', desc: 'Santa himself helps out!' },
  { id: 'portal', name: 'Cookie Portal', baseCost: 75000000000, cps: 1600000, icon: '🌀', desc: 'Imports cookies from other dimensions' }
];

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [cookies, setCookies] = useState(0);
  const [totalCookies, setTotalCookies] = useState(0);
  const [cps, setCps] = useState(0);
  const [upgrades, setUpgrades] = useState({});
  const [showLogin, setShowLogin] = useState(false);
  const [clickPower, setClickPower] = useState(1);
  const [autoSaveTime, setAutoSaveTime] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const uid = localStorage.getItem('wc_userId');
    if (uid) {
      setUserId(uid);
      loadGame(uid);
    }
  }, []);

  const loadGame = async (uid) => {
    try {
      const res = await fetch(`/api/game/load?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (!data.error) {
        setCookies(data.cookies || 0);
        setTotalCookies(data.totalCookies || 0);
        setCps(data.cps || 0);
        setUpgrades(data.upgrades || {});
        setClickPower(data.clickPower || 1);
      }
    } catch (e) {
      console.error('Load failed:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (cps > 0) {
        setCookies(prev => prev + cps / 10);
        setTotalCookies(prev => prev + cps / 10);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [cps]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      saveGame();
      setAutoSaveTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, [userId, cookies, cps, upgrades, clickPower]);

  const createParticle = (x, y) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, value: `+${clickPower}` }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const clickSanta = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCookies(prev => prev + clickPower);
    setTotalCookies(prev => prev + clickPower);
    createParticle(x, y);
  };

  const buyUpgrade = (upgrade) => {
    const owned = upgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, owned));
    
    if (cookies >= cost) {
      setCookies(cookies - cost);
      setCps(cps + upgrade.cps);
      setUpgrades({ ...upgrades, [upgrade.id]: owned + 1 });
    }
  };

  const saveGame = async () => {
    if (!userId) return;
    try {
      await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          cookies: Math.floor(cookies), 
          totalCookies: Math.floor(totalCookies),
          cps, 
          upgrades,
          clickPower 
        })
      });
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Winter Cookie - Christmas Clicker Game</title>
        <meta name="description" content="Click Santa and build your cookie empire!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0033 0%, #0d1b2a 50%, #1b263b 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Snowflakes Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `fall ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${10 + Math.random() * 20}px`,
                opacity: 0.6
              }}
            >
              ❄
            </div>
          ))}
        </div>

        <style jsx>{`
          @keyframes fall {
            to { transform: translateY(100vh); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes fadeUp {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-100px); }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
          {/* Header */}
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            marginBottom: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '48px' }}>🎄</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>Winter Cookie</h1>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>Christmas Clicker Adventure</p>
              </div>
            </div>
            
            {userId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>Signed in as</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{userId.slice(0, 20)}...</div>
                </div>
                <button 
                  onClick={() => {
                    saveGame();
                    localStorage.removeItem('wc_userId');
                    setUserId(null);
                    setCookies(0);
                    setCps(0);
                    setUpgrades({});
                  }}
                  style={{
                    background: 'rgba(231,76,60,0.2)',
                    border: '1px solid rgba(231,76,60,0.4)',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '12px 30px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
                }}
              >
                🎅 Sign In / Register
              </button>
            )}
          </header>

          {/* Main Game Area */}
          <div style={{ display: 'flex', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Left - Clicker Area */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '5px' }}>
                    🍪 {formatNumber(cookies)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.7 }}>cookies</div>
                  <div style={{ fontSize: '18px', color: '#4ecdc4', marginTop: '10px' }}>
                    ⚡ {formatNumber(cps)} per second
                  </div>
                </div>

                <div
                  onClick={clickSanta}
                  style={{
                    width: '400px',
                    height: '400px',
                    margin: '0 auto',
                    cursor: 'pointer',
                    position: 'relative',
                    animation: 'float 3s ease-in-out infinite',
                    transition: 'transform 0.1s'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    fontSize: '350px',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                    userSelect: 'none'
                  }}>
                    🎅
                  </div>

                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      style={{
                        position: 'absolute',
                        left: particle.x,
                        top: particle.y,
                        color: '#ffd700',
                        fontWeight: 'bold',
                        fontSize: '24px',
                        pointerEvents: 'none',
                        animation: 'fadeUp 1s ease-out forwards',
                        textShadow: '0 0 10px rgba(255,215,0,0.8)'
                      }}
                    >
                      {particle.value}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.6 }}>
                  💪 Click Power: {clickPower} per click
                </div>
              </div>

              {/* Stats */}
              <div style={{
                marginTop: '20px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ margin: '0 0 15px 0' }}>📊 Your Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Total Cookies</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatNumber(totalCookies)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>Buildings Owned</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      {Object.values(upgrades).reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Shop */}
            <div style={{ width: '450px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                maxHeight: '800px',
                overflowY: 'auto'
              }}>
                <h2 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🏪 Cookie Shop
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {UPGRADES_SHOP.map(upgrade => {
                    const owned = upgrades[upgrade.id] || 0;
                    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, owned));
                    const canAfford = cookies >= cost;

                    return (
                      <div
                        key={upgrade.id}
                        onClick={() => canAfford && buyUpgrade(upgrade)}
                        style={{
                          background: canAfford ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.03)',
                          border: `2px solid ${canAfford ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '15px',
                          padding: '15px',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          opacity: canAfford ? 1 : 0.5,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}
                        onMouseEnter={(e) => canAfford && (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <div style={{ fontSize: '48px' }}>{upgrade.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {upgrade.name}
                            {owned > 0 && <span style={{ color: '#4ecdc4', marginLeft: '8px' }}>×{owned}</span>}
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '3px' }}>
                            {upgrade.desc}
                          </div>
                          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: '#ffd700' }}>
                              🍪 {formatNumber(cost)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#4ecdc4' }}>
                              +{upgrade.cps}/s
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showLogin && (
          <LoginModal 
            onClose={() => setShowLogin(false)} 
            onSuccess={(id) => {
              localStorage.setItem('wc_userId', id);
              setUserId(id);
              setShowLogin(false);
              loadGame(id);
            }} 
          />
        )}
      </div>
    </>
  );
}

function LoginModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  const registerEmail = async () => {
    if (!email || !pw) return alert('Please enter email and password');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });
      const data = await res.json();
      if (data.ok) {
        alert('✅ Verification code sent to your email! Use /verify CODE in Discord to link your account.');
        onSuccess(email);
      } else {
        alert('❌ Error: ' + (data.error || 'Registration failed'));
      }
    } catch (e) {
      alert('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0033 0%, #0d1b2a 100%)',
        padding: '40px',
        borderRadius: '20px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, fontSize: '28px' }}>🎅 Join Winter Cookie</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            ✖
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="📧 Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '16px',
              marginBottom: '15px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="🔒 Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && registerEmail()}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={registerEmail}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳ Creating Account...' : '🎄 Register & Get Verification Code'}
        </button>

        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(52,152,219,0.1)', borderRadius: '10px', fontSize: '14px', lineHeight: 1.6 }}>
          <strong>📋 How to link your Discord:</strong>
          <ol style={{ margin: '10px 0 0 20px', padding: 0 }}>
            <li>Register with your email</li>
            <li>Check your email for a 6-digit code</li>
            <li>Use <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>/verify CODE</code> in Discord</li>
            <li>Start playing!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
