import { useNavigate } from 'react-router-dom'

export default function PricingPage() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#f5f5f5', fontFamily: "'Barlow', sans-serif", padding: '0 20px 60px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600&display=swap'); .bc{font-family:'Barlow Condensed',sans-serif;} @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,80,0,.4)}50%{box-shadow:0 0 50px rgba(255,80,0,.8);}}`}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ padding: '60px 0 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
          <div className="bc" style={{ fontSize: 36, fontWeight: 900, color: '#ff5000', letterSpacing: -1, marginBottom: 8 }}>PRICING</div>
          <div style={{ fontSize: 15, color: '#666' }}>Simple. Honest. Built for grinders.</div>
        </div>

        {/* Early Bird Banner */}
        <div style={{ background: 'linear-gradient(135deg,#2a0800,#150400)', border: '2px solid #ff5000', borderRadius: 20, padding: '28px 24px', marginBottom: 20, textAlign: 'center', animation: 'glow 3s infinite', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#ff5000', color: '#0a0a0a', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 1 }} className="bc">LIVE NOW</div>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎁</div>
          <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: '#ff5000', letterSpacing: -0.5, marginBottom: 6 }}>EARLY BIRD — 100% FREE</div>
          <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, marginBottom: 20 }}>
            We're launching to the world. <strong style={{ color: '#f5f5f5' }}>Every feature. Forever free.</strong><br />
            No credit card. No catch. Just get to work.
          </div>
          <div style={{ background: '#0a0a0a', border: '1px solid #ff5000', borderRadius: 12, padding: '14px 20px', display: 'inline-block', marginBottom: 20 }}>
            <div className="bc" style={{ fontSize: 12, color: '#555', letterSpacing: 3, marginBottom: 4 }}>USE CODE AT SIGNUP</div>
            <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: '#ffd700', letterSpacing: 2 }}>GIFT2EVERY1</div>
          </div>
          <div>
            <button onClick={() => nav('/auth?mode=signup')} className="bc" style={{ background: '#ff5000', border: 'none', color: '#0a0a0a', padding: '14px 36px', borderRadius: 12, fontSize: 18, fontWeight: 900, letterSpacing: 2, cursor: 'pointer' }}>
              JOIN FREE NOW →
            </button>
          </div>
        </div>

        {/* What's included */}
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
          <div className="bc" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>EVERYTHING INCLUDED</div>
          {[
            '✓  Unlimited common + personal habits',
            '✓  Crew leaderboard (up to 50 members)',
            '✓  AI Coach powered by Claude',
            '✓  30-day AI predictions & analytics',
            '✓  Calendar history grid (3 months)',
            '✓  Muslim mode — Namaz + Quran tracking',
            '✓  Fire zone with motivation engine',
            '✓  PWA — install on iPhone & Android',
            '✓  Privacy-first — habit details always private',
          ].map((f, i) => (
            <div key={i} style={{ padding: '9px 0', borderBottom: i < 8 ? '1px solid #1a1a1a' : 'none', fontSize: 14, color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#22c55e', fontWeight: 700 }}></span>{f}
            </div>
          ))}
        </div>

        {/* Future plans teaser */}
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '20px', marginBottom: 20, opacity: 0.7 }}>
          <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 12 }}>COMING SOON — PRO PLAN</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: '#555' }}>PRO</div>
            <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: '#555' }}>₹199/mo</div>
          </div>
          {['Private group leaderboards', 'Custom habit templates', '12-month history & exports', 'Advanced AI weekly reports', 'Priority support'].map((f, i) => (
            <div key={i} style={{ fontSize: 13, color: '#444', padding: '6px 0', borderBottom: i < 4 ? '1px solid #141414' : 'none' }}>◆ {f}</div>
          ))}
          <div style={{ marginTop: 14, background: '#141414', borderRadius: 10, padding: '10px 14px', textAlign: 'center', fontSize: 12, color: '#555' }}>
            Early users lock in free forever. Pro features will be optional upgrades.
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => nav('/')} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer' }}>← Back to Home</button>
        </div>
      </div>
    </div>
  )
}
