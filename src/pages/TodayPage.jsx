import { useState, useEffect } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import { MOTIVATION_QUOTES, MISS_QUOTES, DEFAULT_COMMON_HABITS, MUSLIM_HABITS } from '../data/constants'
import AddHabitModal from '../components/AddHabitModal'
import { format } from 'date-fns'

export default function TodayPage() {
  const { profile } = useAuth()
  const { commonHabits, commonLogs, loading, toggleCommon, addCommonHabit, deleteCommonHabit, getTodayCommonScore, getMissedCommonToday, today } = useHabits()
  const [tapped, setTapped] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [quote, setQuote] = useState(null)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)

  const { done, total, pct } = getTodayCommonScore()
  const missed = getMissedCommonToday()

  // Pick a daily motivational quote
  useEffect(() => {
    const idx = new Date().getDate() % MOTIVATION_QUOTES.length
    setQuote(MOTIVATION_QUOTES[idx])
  }, [])

  async function setupDefaults() {
    const habits = [...DEFAULT_COMMON_HABITS]
    if (profile?.is_muslim) habits.push(...MUSLIM_HABITS)
    for (const h of habits) await addCommonHabit(h)
    setSetupDone(true)
  }

  function tap(id) {
    setTapped(id); setTimeout(() => setTapped(null), 350)
    toggleCommon(id)
  }

  async function getAISuggestion() {
    setAiLoading(true); setShowSuggestion(true); setAiSuggestion('')
    const missedLabels = missed.map(h => h.label).join(', ') || 'None'
    const doneLabels = commonHabits.filter(h => commonLogs[`${h.id}:${today}`]).map(h => h.label).join(', ') || 'None'
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a ruthless but caring gym coach and life mentor. The user's name is ${profile?.display_name || 'Warrior'}.
Today's score: ${pct}% (${done}/${total} habits done).
Completed: ${doneLabels}.
Missed: ${missedLabels}.

Write a SHORT, punchy 2-3 sentence coaching message. If score >= 80, hype them up intensely. If 40-79, push them to finish strong. If < 40, call them out with tough love but encourage them. Reference the specific missed habits. Sound like a legendary coach - direct, powerful, no fluff. End with one concrete action they can take RIGHT NOW.`
          }]
        })
      })
      const data = await res.json()
      setAiSuggestion(data.content?.[0]?.text || getFallback())
    } catch { setAiSuggestion(getFallback()) }
    setAiLoading(false)
  }

  function getFallback() {
    const q = missed.length > 0 ? MISS_QUOTES : MOTIVATION_QUOTES
    return q[Math.floor(Math.random() * q.length)].quote
  }

  const getBattleText = () => {
    if (pct >= 90) return { text: 'ABSOLUTELY GOATED 🔱', color: '#ffd700' }
    if (pct >= 70) return { text: 'BEAST MODE 🔥', color: '#ff5000' }
    if (pct >= 50) return { text: 'KEEP GRINDING ⚡', color: '#ff8c00' }
    if (pct > 0)   return { text: 'WAKE UP WARRIOR 💪', color: '#cc4000' }
    return { text: 'GET TO WORK 🏋️', color: '#888' }
  }
  const battle = getBattleText()

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:4 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ height:70, borderRadius:12, background:'#141414', animation:'pulse 1.5s infinite', animationDelay:`${i*100}ms` }}/>
      ))}
    </div>
  )

  return (
    <div>
      {/* Score hero */}
      <div style={{
        background:'#0f0f0f', border:'1px solid #1e1e1e', borderLeft:`4px solid ${battle.color}`,
        borderRadius:16, padding:'18px 20px', marginBottom:16,
        display:'flex', alignItems:'center', gap:16,
      }}>
        {/* SVG Ring */}
        <div style={{ position:'relative', width:68, height:68, flexShrink:0 }}>
          <svg width="68" height="68" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="34" cy="34" r="28" fill="none" stroke="#1e1e1e" strokeWidth="6"/>
            <circle cx="34" cy="34" r="28" fill="none" stroke={battle.color} strokeWidth="6"
              strokeDasharray={`${2*Math.PI*28}`}
              strokeDashoffset={`${2*Math.PI*28*(1-pct/100)}`}
              strokeLinecap="round"
              style={{ transition:'stroke-dashoffset .6s ease', filter:`drop-shadow(0 0 6px ${battle.color})` }}
            />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span className="bc" style={{ fontSize:16, fontWeight:900, color:battle.color }}>{pct}%</span>
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#555', marginBottom:4 }}>
            {format(new Date(), 'EEEE, MMM d').toUpperCase()}
          </div>
          <div className="bc" style={{ fontSize:22, fontWeight:900, color:battle.color, lineHeight:1.1 }}>{battle.text}</div>
          <div style={{ fontSize:13, color:'#666', marginTop:4 }}>{done}/{total} missions complete</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background:'#ff5000', border:'none', color:'#0a0a0a', width:36, height:36,
          borderRadius:8, fontSize:22, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 14px rgba(255,80,0,0.4)',
        }}>+</button>
      </div>

      {/* Progress bar */}
      <div style={{ height:3, background:'#1a1a1a', borderRadius:2, marginBottom:18, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${battle.color},#ff8c00)`, borderRadius:2, transition:'width .5s ease', boxShadow:'0 0 8px rgba(255,80,0,0.6)' }}/>
      </div>

      {/* Empty state */}
      {commonHabits.length === 0 && (
        <div style={{ background:'#0f0f0f', border:'1px dashed #2a2a2a', borderRadius:16, padding:'36px 20px', textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🏋️</div>
          <div className="bc" style={{ fontSize:20, fontWeight:900, letterSpacing:1, marginBottom:8 }}>ZERO MISSIONS LOADED</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:20, lineHeight:1.6 }}>Load the recommended mission set or build your own from scratch.</div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={setupDefaults} className="bc" style={{ background:'#ff5000', border:'none', color:'#0a0a0a', padding:'11px 22px', borderRadius:10, fontSize:14, fontWeight:900, letterSpacing:1, boxShadow:'0 0 18px rgba(255,80,0,0.35)' }}>
              LOAD DEFAULTS {profile?.is_muslim ? '+ NAMAZ' : ''}
            </button>
            <button onClick={() => setShowAdd(true)} className="bc" style={{ background:'transparent', border:'1px solid #2a2a2a', color:'#888', padding:'11px 22px', borderRadius:10, fontSize:14, fontWeight:700, letterSpacing:1 }}>
              + CUSTOM
            </button>
          </div>
        </div>
      )}

      {/* Section divider */}
      {commonHabits.length > 0 && (
        <Divider text="DAILY MISSIONS" />
      )}

      {/* Habit list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
        {commonHabits.map((h, i) => {
          const isDone = !!commonLogs[`${h.id}:${today}`]
          const isTapped = tapped === h.id
          return (
            <div key={h.id} className={`rise ${isTapped ? (isDone ? 'shake' : 'slam') : ''}`}
              style={{ animationDelay:`${i*40}ms` }}
              onClick={() => tap(h.id)}>
              <div style={{
                background: isDone ? 'rgba(255,80,0,0.06)' : '#0f0f0f',
                border: `1px solid ${isDone ? '#ff5000' : '#1e1e1e'}`,
                borderLeft: `4px solid ${isDone ? '#ff5000' : h.color || '#2a2a2a'}`,
                borderRadius: 12, padding: '13px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'all .18s', userSelect: 'none',
                position: 'relative', overflow: 'hidden',
              }}>
                {isDone && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(255,80,0,0.04),transparent)', pointerEvents:'none' }}/>}
                <div style={{ fontSize:24, filter: isDone ? 'none' : 'grayscale(.6) opacity(.5)', transition:'filter .2s' }}>{h.icon}</div>
                <div style={{ flex:1 }}>
                  <div className="bc" style={{ fontSize:17, fontWeight:800, letterSpacing:.5, color: isDone ? '#f5f5f5' : '#555' }}>{h.label}</div>
                  {h.is_muslim_habit && <div style={{ fontSize:10, color:'#fbbf24', letterSpacing:1 }}>🕌 DEEN</div>}
                  {!h.is_muslim_habit && <div style={{ fontSize:11, color:'#444' }}>{h.category}</div>}
                </div>
                <div style={{
                  width:30, height:30, borderRadius:7, flexShrink:0,
                  background: isDone ? '#ff5000' : '#1a1a1a',
                  border: `2px solid ${isDone ? '#ff5000' : '#2e2e2e'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#0a0a0a', fontSize:14, fontWeight:900, transition:'all .2s',
                  boxShadow: isDone ? '0 0 14px rgba(255,80,0,0.5)' : 'none',
                }}>{isDone ? '✓' : ''}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Coach Suggestion box */}
      {commonHabits.length > 0 && (
        <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, marginBottom:16, overflow:'hidden' }}>
          <button onClick={getAISuggestion} style={{
            width:'100%', background:'transparent', border:'none', padding:'14px 16px',
            display:'flex', alignItems:'center', gap:12, cursor:'pointer',
          }}>
            <span style={{ fontSize:22 }}>🤖</span>
            <div style={{ flex:1, textAlign:'left' }}>
              <div className="bc" style={{ fontSize:14, fontWeight:800, letterSpacing:1, color:'#ff5000' }}>COACH CLAUDE</div>
              <div style={{ fontSize:12, color:'#555' }}>Tap for personalized coaching</div>
            </div>
            <span style={{ fontSize:18, color:'#555' }}>{showSuggestion ? '▲' : '▼'}</span>
          </button>
          {showSuggestion && (
            <div style={{ borderTop:'1px solid #1a1a1a', padding:'14px 16px', background:'rgba(255,80,0,0.03)' }}>
              {aiLoading ? (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="spinner"/>
                  <span style={{ fontSize:13, color:'#555' }}>Analysing your performance...</span>
                </div>
              ) : (
                <div style={{ fontSize:14, color:'#d4d4d8', lineHeight:1.7 }}>{aiSuggestion}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Missed habits callout */}
      {missed.length > 0 && commonHabits.length > 0 && (
        <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
          <div className="bc" style={{ fontSize:12, letterSpacing:2, color:'#ef4444', marginBottom:8 }}>⚠️ UNFINISHED MISSIONS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {missed.map(h => (
              <div key={h.id} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:'6px 12px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:16 }}>{h.icon}</span>
                <span className="bc" style={{ fontSize:12, fontWeight:700, color:'#ef4444' }}>{h.label}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:'#888', marginTop:10 }}>
            "{MISS_QUOTES[new Date().getMinutes() % MISS_QUOTES.length].quote}" — {MISS_QUOTES[new Date().getMinutes() % MISS_QUOTES.length].author}
          </div>
        </div>
      )}

      {/* Daily quote */}
      {quote && (
        <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderLeft:'3px solid #ff5000', borderRadius:12, padding:'14px 16px' }}>
          <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#ff5000', marginBottom:8 }}>DAILY FUEL</div>
          <div style={{ fontSize:14, color:'#aaa', lineHeight:1.7, fontStyle:'italic' }}>"{quote.quote}"</div>
          <div className="bc" style={{ fontSize:11, color:'#555', marginTop:8, letterSpacing:1 }}>— {quote.author.toUpperCase()}</div>
        </div>
      )}

      {showAdd && <AddHabitModal type="common" onClose={() => setShowAdd(false)} onAdd={addCommonHabit} profile={profile}/>}
    </div>
  )
}

function Divider({ text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
      <div style={{ height:1, flex:1, background:'#1e1e1e' }}/>
      <div className="bc" style={{ fontSize:10, letterSpacing:3, color:'#444', fontWeight:700 }}>{text}</div>
      <div style={{ height:1, flex:1, background:'#1e1e1e' }}/>
    </div>
  )
}
