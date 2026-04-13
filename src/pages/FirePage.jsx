import { useState, useEffect, useRef } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import { MOTIVATION_QUOTES, MISS_QUOTES } from '../data/constants'

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`
const AI_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}

export default function FirePage() {
  const { profile } = useAuth()
  const { getTodayCommonScore, getMissedCommonToday, commonHabits, getStreak, commonLogs, getRate } = useHabits()
  const { done, total, pct } = getTodayCommonScore()
  const missed = getMissedCommonToday()
  const canvasRef = useRef(null)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [aiMsg, setAiMsg] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [streakAlerts, setStreakAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [habitRec, setHabitRec] = useState('')
  const [recLoading, setRecLoading] = useState(false)
  const [showRec, setShowRec] = useState(false)

  const maxStreak = Math.max(0, ...commonHabits.map(h => getStreak(h.id, commonLogs)))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    const particles = []
    function spawnParticle() {
      particles.push({
        x: W/2 + (Math.random()-0.5)*80, y: H - 20,
        vx: (Math.random()-0.5)*1.5, vy: -(Math.random()*2.5+1.5),
        life: 1, decay: Math.random()*0.012+0.008, size: Math.random()*18+8,
      })
    }
    let raf
    function draw() {
      ctx.clearRect(0,0,W,H)
      for (let i=0;i<3;i++) spawnParticle()
      for (let i=particles.length-1;i>=0;i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.life -= p.decay
        if (p.life<=0) { particles.splice(i,1); continue }
        const alpha = p.life
        const r = p.life>0.6?255:p.life>0.3?255:200
        const g = p.life>0.6?Math.round(p.life*200):p.life>0.3?80:40
        const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*p.life)
        grad.addColorStop(0,`rgba(${r},${g},0,${alpha})`)
        grad.addColorStop(0.4,`rgba(${r},${Math.max(0,g-40)},0,${alpha*.6})`)
        grad.addColorStop(1,'rgba(0,0,0,0)')
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2)
        ctx.fillStyle = grad; ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i+1) % MOTIVATION_QUOTES.length), 8000)
    return () => clearInterval(t)
  }, [])

  async function getAIFire() {
    setAiLoading(true); setAiMsg('')
    const missedLabels = missed.map(h=>h.label).join(', ') || 'None'
    try {
      const res = await fetch(AI_URL, {
        method: 'POST', headers: AI_HEADERS,
        body: JSON.stringify({ type: 'fire', displayName: profile?.display_name, pct, maxStreak, missedLabels })
      })
      const data = await res.json()
      setAiMsg(data.text || '')
    } catch { setAiMsg('') }
    setAiLoading(false)
  }

  async function getStreakAlerts() {
    setAlertsLoading(true)
    const alerts = []
    const riskyHabits = commonHabits.filter(h => {
      const streak = getStreak(h.id, commonLogs)
      return streak >= 3
    })
    for (const h of riskyHabits.slice(0, 3)) {
      const streak = getStreak(h.id, commonLogs)
      const todayDone = !!commonLogs[`${h.id}:${new Date().toISOString().split('T')[0]}`]
      try {
        const res = await fetch(AI_URL, {
          method: 'POST', headers: AI_HEADERS,
          body: JSON.stringify({ type: 'streak_alert', displayName: profile?.display_name, habitName: h.label, streakDays: streak, todayDone })
        })
        const data = await res.json()
        alerts.push({ habit: h, streak, todayDone, msg: data.text })
      } catch { alerts.push({ habit: h, streak, todayDone, msg: null }) }
    }
    setStreakAlerts(alerts)
    setAlertsLoading(false)
  }

  async function getHabitRec() {
    setRecLoading(true); setShowRec(true); setHabitRec('')
    const currentHabits = commonHabits.map(h => h.label).join(', ')
    const rates = commonHabits.map(h => ({ label: h.label, rate: getRate(h.id, commonLogs, 7) }))
    const strong = rates.filter(h => h.rate >= 70).map(h => h.label).join(', ') || 'None'
    const weak = rates.filter(h => h.rate < 40).map(h => h.label).join(', ') || 'None'
    try {
      const res = await fetch(AI_URL, {
        method: 'POST', headers: AI_HEADERS,
        body: JSON.stringify({ type: 'habit_recommendation', displayName: profile?.display_name, currentHabits, weakAreas: weak, strongAreas: strong })
      })
      const data = await res.json()
      setHabitRec(data.text || '')
    } catch { setHabitRec('') }
    setRecLoading(false)
  }

  const q = MOTIVATION_QUOTES[quoteIdx]

  return (
    <div className="fade-in" style={{ minHeight:'calc(100dvh - 160px)', display:'flex', flexDirection:'column' }}>
      <div className="bc" style={{ fontSize:28, fontWeight:900, letterSpacing:1, color:'#ff5000', marginBottom:2 }}>FIRE ZONE 🔥</div>
      <div className="bc" style={{ fontSize:10, letterSpacing:3, color:'#444', marginBottom:16 }}>STAY LIT. NEVER QUIT.</div>

      {/* Fire canvas */}
      <div style={{ position:'relative', height:200, marginBottom:16, borderRadius:16, overflow:'hidden', background:'#050505', border:'1px solid #1a1a1a' }}>
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%' }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', gap:32 }}>
          <div style={{ textAlign:'center' }}>
            <div className="bc" style={{ fontSize:48, fontWeight:900, color:'#ff5000', textShadow:'0 0 30px rgba(255,80,0,0.8)', lineHeight:1 }}>{pct}%</div>
            <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#ff8c00', marginTop:4 }}>TODAY</div>
          </div>
          <div style={{ width:1, height:60, background:'rgba(255,80,0,0.3)' }}/>
          <div style={{ textAlign:'center' }}>
            <div className="bc" style={{ fontSize:48, fontWeight:900, color:'#ff8c00', textShadow:'0 0 20px rgba(255,140,0,0.6)', lineHeight:1 }}>{maxStreak}</div>
            <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#ff8c00', marginTop:4 }}>STREAK</div>
          </div>
        </div>
      </div>

      {/* Rotating quote */}
      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderLeft:'4px solid #ff5000', borderRadius:14, padding:'16px', marginBottom:14 }}>
        <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#ff5000', marginBottom:8 }}>FUEL FOR THE SOUL</div>
        <div key={quoteIdx} className="fade-in" style={{ fontSize:15, color:'#ccc', lineHeight:1.7, fontStyle:'italic' }}>"{q.quote}"</div>
        <div className="bc" style={{ fontSize:11, color:'#555', marginTop:8, letterSpacing:1 }}>— {q.author.toUpperCase()}</div>
      </div>

      {/* Missed today */}
      {missed.length > 0 && (
        <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'14px 16px', marginBottom:14 }}>
          <div className="bc" style={{ fontSize:12, letterSpacing:2, color:'#ef4444', marginBottom:10 }}>⚔️ UNFINISHED BATTLES</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {missed.map(h => (
              <div key={h.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:22 }}>{h.icon}</span>
                <div style={{ flex:1 }}>
                  <div className="bc" style={{ fontSize:15, fontWeight:800, color:'#ef4444' }}>{h.label}</div>
                  <div style={{ fontSize:11, color:'#666', fontStyle:'italic' }}>{MISS_QUOTES[Math.floor(Math.random()*MISS_QUOTES.length)].quote}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Fire message */}
      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
        <button onClick={getAIFire} style={{ width:'100%', background:'transparent', border:'none', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <span style={{ fontSize:26 }}>🔥</span>
          <div style={{ flex:1, textAlign:'left' }}>
            <div className="bc" style={{ fontSize:15, fontWeight:900, letterSpacing:1, color:'#ff5000' }}>GET FIRED UP</div>
            <div style={{ fontSize:12, color:'#555' }}>AI-powered battle speech just for you</div>
          </div>
          <span className="bc" style={{ fontSize:20, color:'#ff5000' }}>→</span>
        </button>
        {(aiLoading || aiMsg) && (
          <div style={{ borderTop:'1px solid #1a1a1a', padding:'14px 16px', background:'rgba(255,80,0,0.03)' }}>
            {aiLoading ? (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="spinner"/><span style={{ fontSize:13, color:'#555' }}>Loading battle speech...</span></div>
            ) : (
              <div className="fade-in" style={{ fontSize:14, color:'#d4d4d8', lineHeight:1.8 }}>{aiMsg}</div>
            )}
          </div>
        )}
      </div>

      {/* Streak Alerts */}
      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
        <button onClick={getStreakAlerts} style={{ width:'100%', background:'transparent', border:'none', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <span style={{ fontSize:26 }}>⚡</span>
          <div style={{ flex:1, textAlign:'left' }}>
            <div className="bc" style={{ fontSize:15, fontWeight:900, letterSpacing:1, color:'#ff8c00' }}>STREAK ALERTS</div>
            <div style={{ fontSize:12, color:'#555' }}>AI checks which streaks are at risk</div>
          </div>
          <span className="bc" style={{ fontSize:20, color:'#ff8c00' }}>→</span>
        </button>
        {(alertsLoading || streakAlerts.length > 0) && (
          <div style={{ borderTop:'1px solid #1a1a1a', padding:'14px 16px', background:'rgba(255,140,0,0.02)' }}>
            {alertsLoading ? (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="spinner"/><span style={{ fontSize:13, color:'#555' }}>Checking your streaks...</span></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {streakAlerts.map((a, i) => (
                  <div key={i} style={{ background: a.todayDone ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border:`1px solid ${a.todayDone ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:18 }}>{a.habit.icon}</span>
                      <span className="bc" style={{ fontSize:13, fontWeight:800 }}>{a.habit.label}</span>
                      <span style={{ marginLeft:'auto', fontSize:12, color:'#ff8c00', fontWeight:700 }}>🔥 {a.streak}d</span>
                    </div>
                    {a.msg && <div style={{ fontSize:12, color:'#aaa', lineHeight:1.6 }}>{a.msg}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Habit Recommendations */}
      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
        <button onClick={getHabitRec} style={{ width:'100%', background:'transparent', border:'none', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <span style={{ fontSize:26 }}>🎯</span>
          <div style={{ flex:1, textAlign:'left' }}>
            <div className="bc" style={{ fontSize:15, fontWeight:900, letterSpacing:1, color:'#ffd700' }}>HABIT RECOMMENDATIONS</div>
            <div style={{ fontSize:12, color:'#555' }}>AI suggests new habits based on your data</div>
          </div>
          <span style={{ color:'#444', fontSize:12 }}>{showRec ? '▲' : '▼'}</span>
        </button>
        {showRec && (
          <div style={{ borderTop:'1px solid #1a1a1a', padding:'14px 16px', background:'rgba(255,215,0,0.02)' }}>
            {recLoading ? (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="spinner"/><span style={{ fontSize:13, color:'#555' }}>Analysing your stack...</span></div>
            ) : (
              <div className="fade-in" style={{ fontSize:13, color:'#d4d4d8', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{habitRec}</div>
            )}
          </div>
        )}
      </div>

      {/* Wisdom Vault */}
      <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#444', marginBottom:12 }}>WISDOM VAULT</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {MOTIVATION_QUOTES.map((q,i)=>(
          <div key={i} style={{ background:'#0f0f0f', border:'1px solid #1a1a1a', borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:13, color:'#888', lineHeight:1.6, fontStyle:'italic' }}>"{q.quote}"</div>
            <div className="bc" style={{ fontSize:10, color:'#555', marginTop:6, letterSpacing:1 }}>— {q.author.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 