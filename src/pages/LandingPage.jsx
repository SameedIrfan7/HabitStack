import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import FloatingChat from '../components/FloatingChat'

const FEATURES = [
  { icon: '⚡', title: 'Daily Mission Grid', desc: 'Check off habits like missions. Every tap feels like a win. Visual streaks that make you want to keep going.' },
  { icon: '🏆', title: 'Crew Leaderboard', desc: 'Your friends see your score only. Your specific habits stay 100% private. Compete without exposure.' },
  { icon: '🔒', title: 'Private Dojo', desc: 'Add personal habits nobody sees. Side quests, spiritual practices, anything — fully yours.' },
  { icon: '🔮', title: 'AI Predictions', desc: 'See what happens in 30 days if you keep grinding — and what you risk if you stop. Real projections, real stakes.' },
  { icon: '🔥', title: 'Fire Zone', desc: 'Animated fire, rotating quotes from legends. AI battle speech before you train. Pure motivation fuel.' },
  { icon: '📊', title: 'War Report', desc: 'Weekly reviews, 30-day trends, habit breakdown. Data-driven coaching powered by AI.' },
  { icon: '📱', title: 'Install as App', desc: 'Add to iPhone or Android home screen. Works offline. No app store needed. Pure PWA.' },
  { icon: '🤖', title: 'Coach Claude', desc: 'Your personal AI coach available 24/7. Ask anything, get data-backed answers about your performance.' },
]

const STATS = [
  { val: '100%', label: 'FREE RIGHT NOW' },
  { val: '8+', label: 'DEFAULT HABITS' },
  { val: '3', label: 'MONTHS HISTORY' },
  { val: '∞', label: 'CREW SIZE' },
]

const ACTIVITIES = [
  { icon: '🏋️', label: 'LIFT HEAVY', color: '#ff5000', pct: 94 },
  { icon: '🏃', label: 'RUN / CARDIO', color: '#ff8c00', pct: 78 },
  { icon: '🏊', label: 'SWIMMING', color: '#3b82f6', pct: 65 },
  { icon: '🧘', label: 'STRETCH', color: '#8b5cf6', pct: 88 },
  { icon: '💧', label: 'HYDRATION', color: '#06b6d4', pct: 96 },
  { icon: '📚', label: 'READ 30MIN', color: '#f59e0b', pct: 52 },
  { icon: '🚴', label: 'CYCLING', color: '#22c55e', pct: 71 },
  { icon: '🥊', label: 'BOXING', color: '#ef4444', pct: 83 },
]

function MockCalendarGrid() {
  const days = Array.from({ length: 35 }, (_, i) => {
    const rand = Math.random()
    return i > 28 ? 0 : rand > 0.25 ? Math.floor(rand * 100) : 0
  })
  const colors = s => s >= 80 ? '#ff5000' : s >= 60 ? '#ff8c00' : s >= 40 ? '#ffd700' : s > 0 ? '#3a1a00' : '#111'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, padding: '8px 0' }}>
      {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ textAlign:'center', paddingBottom:4 }}><span style={{ fontSize:9, color:'#444', fontWeight:700 }}>{d}</span></div>)}
      {days.map((s, i) => (
        <div key={i} style={{
          aspectRatio:'1', borderRadius:4,
          background: s>=80?'rgba(255,80,0,0.25)':s>=60?'rgba(255,140,0,0.15)':s>0?'rgba(255,215,0,0.08)':'#111',
          border:`1px solid ${s>0?colors(s)+'40':'#1a1a1a'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {s>0 && <span style={{ fontSize:7, color:colors(s), fontWeight:700 }}>{s}%</span>}
        </div>
      ))}
    </div>
  )
}

function MockHabitRows() {
  const habits = [
    { icon:'🏋️', label:'LIFT HEAVY', done:true, pct:92 },
    { icon:'🏃', label:'RUN / CARDIO', done:true, pct:78 },
    { icon:'💧', label:'HYDRATE', done:true, pct:95 },
    { icon:'🌙', label:'SLEEP 8H', done:false, pct:55 },
    { icon:'📚', label:'READ 30MIN', done:false, pct:40 },
  ]
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {habits.map((h,i) => (
        <div key={i} style={{
          background:h.done?'rgba(255,80,0,0.06)':'#0f0f0f',
          border:`1px solid ${h.done?'#ff5000':'#1e1e1e'}`,
          borderLeft:`3px solid ${h.done?'#ff5000':'#2a2a2a'}`,
          borderRadius:10, padding:'9px 12px', display:'flex', alignItems:'center', gap:10,
        }}>
          <span style={{ fontSize:18, filter:h.done?'none':'grayscale(1) opacity(.4)' }}>{h.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, color:h.done?'#f5f5f5':'#444' }}>{h.label}</div>
            <div style={{ height:3, background:'#1a1a1a', borderRadius:2, marginTop:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${h.pct}%`, background:h.done?'#ff5000':'#2a2a2a', borderRadius:2 }}/>
            </div>
          </div>
          <div style={{ width:22, height:22, borderRadius:5, background:h.done?'#ff5000':'#1a1a1a', border:`2px solid ${h.done?'#ff5000':'#2a2a2a'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#0a0a0a' }}>{h.done?'✓':''}</div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const nav = useNavigate()
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      r: Math.random()*1.6+0.2, dx: (Math.random()-0.5)*0.22, dy: (Math.random()-0.5)*0.22,
      a: Math.random()*0.3+0.05,
    }))
    let raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,80,0,${p.a})`; ctx.fill()
        p.x+=p.dx; p.y+=p.dy
        if(p.x<0||p.x>canvas.width) p.dx*=-1
        if(p.y<0||p.y>canvas.height) p.dy*=-1
      })
      raf=requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ minHeight:'100dvh', background:'#0a0a0a', color:'#f5f5f5', fontFamily:"'Barlow',sans-serif", overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;}
        .bc{font-family:'Barlow Condensed',sans-serif;}
        @keyframes flicker{0%,100%{opacity:1}92%{opacity:.85}94%{opacity:1}}
        @keyframes rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,80,0,.4)}50%{box-shadow:0 0 60px rgba(255,80,0,.9),0 0 100px rgba(255,80,0,.2)}}
        @keyframes scanline{0%{top:-4px}100%{top:100%}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes slideX{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .diagonal-bg{background-image:repeating-linear-gradient(45deg,rgba(255,80,0,.025) 0,rgba(255,80,0,.025) 1px,transparent 0,transparent 50%);background-size:22px 22px;}
        .feat-card{transition:all .2s;border:1px solid #1e1e1e;cursor:default;}
        .feat-card:hover{border-color:#ff5000;transform:translateY(-4px);background:rgba(255,80,0,0.04)!important;}
        .cta-btn{transition:all .2s;}
        .cta-btn:hover{transform:scale(1.03);}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#ff5000;}
        .ticker-inner{display:flex;animation:slideX 20s linear infinite;}
        .ticker-inner:hover{animation-play-state:paused;}

        /* Desktop layout */
        @media(min-width:1024px){
          .hero-grid{display:grid!important;grid-template-columns:1fr 1fr;align-items:center;gap:60px;text-align:left!important;}
          .hero-text{text-align:left!important;}
          .hero-btns{justify-content:flex-start!important;}
          .hero-mockup{max-width:100%!important;}
          .section-inner{max-width:1100px!important;}
          .features-grid{grid-template-columns:repeat(4,1fr)!important;}
          .stats-grid{grid-template-columns:repeat(4,1fr)!important;}
          .steps-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:12px;}
          .desktop-split{display:grid!important;grid-template-columns:1fr 1fr;gap:40px;align-items:center;}
        }
        @media(min-width:1280px){
          .section-inner{max-width:1200px!important;}
        }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, opacity:.5 }}/>
      <div className="diagonal-bg" style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>
      <div style={{ position:'fixed', left:0, right:0, height:2, zIndex:1, pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(255,80,0,.3),transparent)', animation:'scanline 7s linear infinite' }}/>

      {/* STICKY NAV */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        background:scrollY>50?'rgba(10,10,10,0.97)':'transparent',
        backdropFilter:scrollY>50?'blur(20px)':'none',
        borderBottom:scrollY>50?'1px solid #1a1a1a':'none',
        transition:'all .3s', padding:'14px 24px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>⚡</span>
          <span className="bc" style={{ fontSize:22, fontWeight:900, color:'#ff5000', letterSpacing:-0.5, animation:'flicker 9s infinite' }}>HABITSTACK</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{ background:'transparent', border:'none', color:'#555', fontSize:13, cursor:'pointer', padding:'7px 12px' }}>Features</button>
          <button onClick={()=>nav('/auth')} style={{ background:'transparent', border:'1px solid #2a2a2a', color:'#666', padding:'7px 14px', borderRadius:8, fontSize:12, cursor:'pointer' }}>Sign In</button>
          <button onClick={()=>nav('/auth?mode=signup')} className="bc cta-btn" style={{ background:'#ff5000', border:'none', color:'#0a0a0a', padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:900, letterSpacing:1, cursor:'pointer', boxShadow:'0 0 16px rgba(255,80,0,0.4)' }}>JOIN FREE</button>
        </div>
      </nav>

      <div style={{ position:'relative', zIndex:2 }}>

        {/* ── HERO ── */}
        <section style={{ minHeight:'100dvh', display:'flex', alignItems:'center', padding:'100px 24px 60px' }}>
          <div className="section-inner" style={{ maxWidth:700, margin:'0 auto', width:'100%' }}>
            <div className="hero-grid" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:48 }}>

              {/* Left / Text */}
              <div className="hero-text" style={{ flex:1 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,80,0,0.1)', border:'1px solid rgba(255,80,0,0.3)', borderRadius:50, padding:'6px 16px', marginBottom:28, animation:'rise .4s ease both' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>
                  <span className="bc" style={{ fontSize:12, color:'#ff5000', letterSpacing:2, fontWeight:700 }}>EARLY BIRD — FREE FOREVER · CODE: GIFT2EVERY1</span>
                </div>

                <div style={{ animation:'rise .5s ease .1s both' }}>
                  <div style={{ fontSize:56, marginBottom:4, filter:'drop-shadow(0 0 40px rgba(255,80,0,0.7))' }}>⚡</div>
                  <div className="bc" style={{
                    fontSize:'clamp(60px,10vw,96px)', fontWeight:900, letterSpacing:-3, lineHeight:.88,
                    color:'#ff5000', animation:'flicker 8s infinite',
                    textShadow:'0 0 80px rgba(255,80,0,0.5)',
                    marginBottom:12,
                  }}>HABIT<br/>STACK</div>
                  <div className="bc" style={{ fontSize:14, letterSpacing:8, color:'#444', marginBottom:24 }}>NO DAYS OFF</div>
                </div>

                <div style={{ animation:'rise .5s ease .2s both', maxWidth:520, marginBottom:36 }}>
                  <div style={{ fontSize:'clamp(16px,2.5vw,20px)', color:'#888', lineHeight:1.65, fontWeight:300 }}>
                    The habit tracker built for people who <strong style={{ color:'#f5f5f5' }}>train hard</strong>, compete with friends, and <strong style={{ color:'#f5f5f5' }}>never settle for average</strong>.
                    <br/><span style={{ color:'#ff5000' }}>Visual grids. AI coaching. Crew competition.</span>
                  </div>
                </div>

                <div className="hero-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', animation:'rise .5s ease .3s both' }}>
                  <button onClick={()=>nav('/auth?mode=signup')} className="bc cta-btn" style={{
                    background:'#ff5000', border:'none', color:'#0a0a0a',
                    padding:'17px 40px', borderRadius:12, fontSize:20, fontWeight:900, letterSpacing:2,
                    cursor:'pointer', animation:'glow 3s infinite',
                  }}>START FOR FREE →</button>
                  <button onClick={()=>document.getElementById('features').scrollIntoView({behavior:'smooth'})} style={{
                    background:'transparent', border:'1px solid #2a2a2a', color:'#666',
                    padding:'17px 28px', borderRadius:12, fontSize:16, cursor:'pointer',
                  }}>See Features ↓</button>
                </div>
              </div>

              {/* Right / Mockup */}
              <div className="hero-mockup" style={{ flex:1, width:'100%', maxWidth:380, animation:'rise .6s ease .4s both' }}>
                <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:20, overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,80,0,0.1)' }}>
                  <div style={{ background:'#0a0a0a', borderBottom:'1px solid #1a1a1a', padding:'12px 16px', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>⚡</span>
                    <span className="bc" style={{ fontSize:16, fontWeight:900, color:'#ff5000' }}>HABITSTACK</span>
                    <div style={{ marginLeft:'auto', width:28, height:28, borderRadius:7, background:'#141414', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>💪</div>
                  </div>
                  <div style={{ padding:'14px 16px', background:'#0f0f0f', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ position:'relative', width:52, height:52 }}>
                      <svg width="52" height="52" style={{ transform:'rotate(-90deg)' }}>
                        <circle cx="26" cy="26" r="22" fill="none" stroke="#1e1e1e" strokeWidth="5"/>
                        <circle cx="26" cy="26" r="22" fill="none" stroke="#ff5000" strokeWidth="5" strokeDasharray={`${2*Math.PI*22}`} strokeDashoffset={`${2*Math.PI*22*0.4}`} strokeLinecap="round" style={{ filter:'drop-shadow(0 0 5px #ff5000)' }}/>
                      </svg>
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span className="bc" style={{ fontSize:12, fontWeight:900, color:'#ff5000' }}>60%</span>
                      </div>
                    </div>
                    <div>
                      <div className="bc" style={{ fontSize:18, fontWeight:900, color:'#ff5000' }}>BEAST MODE</div>
                      <div style={{ fontSize:11, color:'#555' }}>3/5 missions done today</div>
                    </div>
                  </div>
                  <div style={{ padding:'10px 12px' }}>
                    <MockHabitRows/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTIVITY TICKER ── */}
        <section style={{ padding:'0 0 60px', overflow:'hidden' }}>
          <div style={{ borderTop:'1px solid #1a1a1a', borderBottom:'1px solid #1a1a1a', padding:'16px 0', background:'rgba(255,80,0,0.02)' }}>
            <div className="ticker-inner">
              {[...ACTIVITIES, ...ACTIVITIES].map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'0 28px', flexShrink:0 }}>
                  <span style={{ fontSize:22 }}>{a.icon}</span>
                  <div>
                    <div className="bc" style={{ fontSize:13, fontWeight:800, color:'#f5f5f5', letterSpacing:1 }}>{a.label}</div>
                    <div style={{ height:3, width:60, background:'#1a1a1a', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${a.pct}%`, background:a.color, borderRadius:2 }}/>
                    </div>
                  </div>
                  <span style={{ color:'#333', fontSize:18, paddingLeft:18 }}>·</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section style={{ padding:'0 24px 60px' }}>
          <div className="section-inner stats-grid" style={{ maxWidth:700, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderTop:'3px solid #ff5000', borderRadius:12, padding:'16px 10px', textAlign:'center' }}>
                <div className="bc" style={{ fontSize:32, fontWeight:900, color:'#ff5000' }}>{s.val}</div>
                <div className="bc" style={{ fontSize:9, letterSpacing:2, color:'#444', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VIDEO SECTION ── */}
        <section style={{ padding:'0 24px 70px' }}>
          <div className="section-inner" style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div className="bc" style={{ fontSize:11, letterSpacing:5, color:'#ff5000', marginBottom:8 }}>IN ACTION</div>
              <div className="bc" style={{ fontSize:'clamp(28px,6vw,52px)', fontWeight:900, letterSpacing:-1, lineHeight:1 }}>SEE THE GRIND</div>
              <div style={{ fontSize:14, color:'#555', marginTop:12, lineHeight:1.7 }}>Watch how HabitStack turns daily discipline into visible progress.</div>
            </div>

            <div style={{ position:'relative', borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,80,0,0.2)', boxShadow:'0 0 60px rgba(255,80,0,0.1)', background:'#050505', aspectRatio:'16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', position:'relative', zIndex:5 }} // High Z-Index
              >
                <source src="/demo.mp4" type="video/mp4"/>
              </video>

              {/* Fallback overlay (Behind Video) */}
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0a0a0a,#1a0800)', zIndex:1 }} id="video-fallback">
                <div style={{ fontSize:64, marginBottom:16, filter:'drop-shadow(0 0 30px rgba(255,80,0,0.8))' }}>⚡</div>
                <div className="bc" style={{ fontSize:22, fontWeight:900, color:'#ff5000', letterSpacing:2 }}>LOADING DEMO...</div>
              </div>

              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 40%)', pointerEvents:'none', zIndex:6 }}/>
            </div>
          </div>
        </section>

        {/* ── CALENDAR PREVIEW ── */}
        <section style={{ padding:'0 24px 70px' }}>
          <div className="section-inner desktop-split" style={{ maxWidth:1000, margin:'0 auto', display:'block' }}>
            <div>
              <div className="bc" style={{ fontSize:11, letterSpacing:5, color:'#ff5000', marginBottom:8 }}>VISUAL HISTORY</div>
              <div className="bc" style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:900, letterSpacing:-1, lineHeight:1, marginBottom:16 }}>EVERY DAY<br/>ON THE RECORD</div>
              <div style={{ fontSize:14, color:'#666', lineHeight:1.7, maxWidth:400, marginBottom:28 }}>See your consistency at a glance — past months, circle rings, habit breakdown. Every day recorded.</div>
              <button onClick={()=>nav('/auth?mode=signup')} className="bc cta-btn" style={{ background:'transparent', border:'2px solid #ff5000', color:'#ff5000', padding:'12px 28px', borderRadius:10, fontSize:15, fontWeight:900, letterSpacing:1, cursor:'pointer' }}>START TRACKING →</button>
            </div>
            <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:20, padding:'20px', boxShadow:'0 0 40px rgba(255,80,0,0.06)', marginTop:32 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
                <div className="bc" style={{ fontSize:16, fontWeight:900, letterSpacing:1 }}>APRIL 2026</div>
                <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                  {['MAR','APR','MAY'].map((m,i) => <div key={i} style={{ background:i===1?'#ff5000':'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6, padding:'4px 8px' }}><span className="bc" style={{ fontSize:10, fontWeight:800, color:i===1?'#0a0a0a':'#555' }}>{m}</span></div>)}
                </div>
              </div>
              <MockCalendarGrid/>
              <div style={{ display:'flex', justifyContent:'space-around', marginTop:16, paddingTop:14, borderTop:'1px solid #1a1a1a' }}>
                {[['AVG','74%','#ff5000'],['BEST','100%','#ffd700'],['ACTIVE','87%','#22c55e']].map(([l,v,c],i) => (
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ position:'relative', width:50, height:50, margin:'0 auto' }}>
                      <svg width="50" height="50" style={{ transform:'rotate(-90deg)' }}>
                        <circle cx="25" cy="25" r="20" fill="none" stroke="#1e1e1e" strokeWidth="5"/>
                        <circle cx="25" cy="25" r="20" fill="none" stroke={c} strokeWidth="5" strokeDasharray={`${2*Math.PI*20}`} strokeDashoffset={`${2*Math.PI*20*(1-parseInt(v)/100)}`} strokeLinecap="round" style={{ filter:`drop-shadow(0 0 4px ${c})` }}/>
                      </svg>
                      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span className="bc" style={{ fontSize:10, fontWeight:900, color:c }}>{v}</span>
                      </div>
                    </div>
                    <div className="bc" style={{ fontSize:8, color:'#444', marginTop:4, letterSpacing:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ padding:'0 24px 70px' }}>
          <div className="section-inner" style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <div className="bc" style={{ fontSize:11, letterSpacing:5, color:'#ff5000', marginBottom:8 }}>ARSENAL</div>
              <div className="bc" style={{ fontSize:'clamp(32px,7vw,56px)', fontWeight:900, letterSpacing:-1 }}>BUILT DIFFERENT</div>
            </div>
            <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="feat-card" style={{ background:'#0f0f0f', borderRadius:14, padding:'20px 18px' }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
                  <div className="bc" style={{ fontSize:15, fontWeight:800, letterSpacing:.5, marginBottom:6 }}>{f.title}</div>
                  <div style={{ fontSize:12, color:'#555', lineHeight:1.65 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:'0 24px 70px' }}>
          <div className="section-inner" style={{ maxWidth:900, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div className="bc" style={{ fontSize:11, letterSpacing:5, color:'#ff5000', marginBottom:8 }}>PROTOCOL</div>
              <div className="bc" style={{ fontSize:'clamp(28px,6vw,48px)', fontWeight:900, letterSpacing:-1 }}>4 STEPS TO BEAST</div>
            </div>
            <div className="steps-grid" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { n:'01', t:'Sign up in 60 seconds', d:'Pick your avatar, username. Zero friction. Start immediately.' },
                { n:'02', t:'Load your missions', d:'Use our proven defaults or build your own habit stack. Add private personal habits too.' },
                { n:'03', t:'Check in every day', d:'Tap done as you complete each habit. Watch your calendar grid fill with fire.' },
                { n:'04', t:'Compete with your crew', d:'Invite your friends. Leaderboard shows scores only — your habits are always private.' },
              ].map((s, i) => (
                <div key={i} style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderLeft:'4px solid #ff5000', borderRadius:14, padding:'18px 20px', display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div className="bc" style={{ fontSize:32, fontWeight:900, color:'#ff5000', opacity:.35, flexShrink:0, lineHeight:1, marginTop:2 }}>{s.n}</div>
                  <div>
                    <div className="bc" style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>{s.t}</div>
                    <div style={{ fontSize:13, color:'#555', lineHeight:1.65 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EARLY BIRD ── */}
        <section style={{ padding:'0 24px 70px' }}>
          <div className="section-inner" style={{ maxWidth:560, margin:'0 auto' }}>
            <div style={{ background:'linear-gradient(135deg,#1e0800,#0f0f0f)', border:'2px solid #ff5000', borderRadius:22, padding:'36px 28px', textAlign:'center', animation:'glow 4s infinite', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:14, right:14, background:'#22c55e', color:'#0a0a0a', borderRadius:6, padding:'3px 10px' }}>
                <span className="bc" style={{ fontSize:10, fontWeight:900, letterSpacing:1 }}>LIVE NOW</span>
              </div>
              <div style={{ fontSize:52, marginBottom:10 }}>🎁</div>
              <div className="bc" style={{ fontSize:28, fontWeight:900, color:'#ff5000', letterSpacing:-0.5, marginBottom:8 }}>EARLY BIRD ACCESS</div>
              <div className="bc" style={{ fontSize:48, fontWeight:900, color:'#ffd700', marginBottom:6 }}>FREE</div>
              <div style={{ fontSize:14, color:'#888', lineHeight:1.7, marginBottom:20 }}>
                Every feature. Forever. No credit card.<br/>
                <strong style={{ color:'#f5f5f5' }}>Be among the first 1000 users.</strong>
              </div>
              <div style={{ background:'#0a0a0a', border:'1px solid rgba(255,80,0,0.3)', borderRadius:12, padding:'12px 20px', display:'inline-block', marginBottom:24 }}>
                <div className="bc" style={{ fontSize:10, color:'#555', letterSpacing:3, marginBottom:4 }}>USE THIS CODE AT SIGNUP</div>
                <div className="bc" style={{ fontSize:26, fontWeight:900, color:'#ffd700', letterSpacing:3 }}>GIFT2EVERY1</div>
              </div>
              <div>
                <button onClick={()=>nav('/auth?mode=signup')} className="bc cta-btn" style={{ background:'#ff5000', border:'none', color:'#0a0a0a', padding:'15px 38px', borderRadius:12, fontSize:18, fontWeight:900, letterSpacing:2, cursor:'pointer', display:'block', width:'100%', marginBottom:12 }}>JOIN THE CREW →</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding:'0 24px 80px', textAlign:'center' }}>
          <div style={{ maxWidth:480, margin:'0 auto' }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🔥</div>
            <div className="bc" style={{ fontSize:'clamp(32px,8vw,56px)', fontWeight:900, letterSpacing:-1, marginBottom:12 }}>READY TO GRIND?</div>
            <div style={{ fontSize:14, color:'#555', marginBottom:32, lineHeight:1.7 }}>Install on your phone in 30 seconds. No app store. No bullshit.</div>
            <button onClick={()=>nav('/auth?mode=signup')} className="bc cta-btn" style={{ background:'#ff5000', border:'none', color:'#0a0a0a', padding:'18px 48px', borderRadius:14, fontSize:22, fontWeight:900, letterSpacing:2, cursor:'pointer', boxShadow:'0 0 50px rgba(255,80,0,0.5)', animation:'glow 3s infinite', display:'inline-block' }}>JOIN FREE NOW →</button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding:'32px 24px', borderTop:'1px solid #1a1a1a' }}>
          <div className="section-inner" style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>⚡</span>
                <span className="bc" style={{ fontSize:18, fontWeight:900, color:'#ff5000' }}>HABITSTACK</span>
              </div>
              <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Sign In','/auth']].map(([l,p]) => (
                  <button key={l} onClick={()=>nav(p)} style={{ background:'transparent', border:'none', color:'#555', fontSize:13, cursor:'pointer', transition:'color .15s' }} onMouseEnter={e=>e.target.style.color='#ff5000'} onMouseLeave={e=>e.target.style.color='#555'}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div style={{ fontSize:12, color:'#333' }}>© 2026 HabitStack · Built for grinders. No days off.</div>
              <div style={{ fontSize:12, color:'#333' }}>Made with 🔥 in India</div>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating chat on landing too */}
      <FloatingChat />
    </div>
  )
}