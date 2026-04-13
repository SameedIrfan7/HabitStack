import { useState, useEffect } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import { MOTIVATION_QUOTES, MISS_QUOTES, DEFAULT_COMMON_HABITS, MUSLIM_HABITS } from '../data/constants'
import AddHabitModal from '../components/AddHabitModal'
import { format, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'

export default function TodayPage() {
  const { profile, user } = useAuth()
  const {
    commonHabits, commonLogs, loading,
    toggleCommon, addCommonHabit, deleteCommonHabit,
    getTodayCommonScore, getMissedCommonToday,
    getRate, getStreak, today, refetch
  } = useHabits()

  const [tapped, setTapped] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [quote, setQuote] = useState(null)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [showYesterday, setShowYesterday] = useState(false)

  const { done, total, pct } = getTodayCommonScore()
  const missed = getMissedCommonToday()
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  useEffect(() => {
    const idx = new Date().getDate() % MOTIVATION_QUOTES.length
    setQuote(MOTIVATION_QUOTES[idx])
  }, [])

  async function setupDefaults() {
    setSetupLoading(true)
    try {
      const habits = [...DEFAULT_COMMON_HABITS]
      if (profile?.is_muslim) habits.push(...MUSLIM_HABITS)

      const { error } = await supabase.from('common_habits').insert(
        habits.map((h, i) => ({
          ...h,
          user_id: user.id,
          sort_order: i,
          is_active: true,
          is_muslim_habit: h.is_muslim_habit || false,
        }))
      )

      if (error) {
        console.error('Insert error:', error.message)
      } else {
        await refetch()
      }
    } catch (e) {
      console.error('setupDefaults failed:', e)
    }
    setSetupLoading(false)
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
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        displayName: profile?.display_name,
        pct, done, total, doneLabels, missedLabels
      })
    })
    const data = await res.json()
    setAiSuggestion(data.text || getFallback())
  } catch { setAiSuggestion(getFallback()) }
  setAiLoading(false)
}

  function getFallback() {
    const pool = missed.length > 0 ? MISS_QUOTES : MOTIVATION_QUOTES
    return `"${pool[Math.floor(Math.random() * pool.length)].quote}"`
  }

  const battle = (() => {
    if (pct >= 90) return { text: 'ABSOLUTELY GOATED', sub: 'Top 1% energy today', color: '#ffd700' }
    if (pct >= 70) return { text: 'BEAST MODE', sub: 'Keep that fire burning', color: '#ff5000' }
    if (pct >= 50) return { text: 'KEEP GRINDING', sub: 'Halfway there — finish strong', color: '#ff8c00' }
    if (pct > 0)   return { text: 'WAKE UP WARRIOR', sub: 'The day isn\'t over yet', color: '#cc4000' }
    return { text: 'GET TO WORK', sub: 'Every journey starts with one step', color: '#555' }
  })()

  const yesterdayDone = commonHabits.filter(h => commonLogs[`${h.id}:${yesterday}`]).length
  const yesterdayPct = total > 0 ? Math.round((yesterdayDone / total) * 100) : 0

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
      {[1,2,3,4,5].map(i => <div key={i} style={{ height: 68, borderRadius: 12, background: '#141414', animation: 'pulse 1.5s infinite', animationDelay: `${i*100}ms`, opacity:.5 }} />)}
    </div>
  )

  return (
    <div>
      {/* Quote strip — TOP */}
      {quote && (
        <div style={{ background: 'rgba(255,80,0,0.04)', border: '1px solid #1e1e1e', borderLeft: '3px solid #ff5000', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="bc" style={{ fontSize: 18, color: '#ff5000', flexShrink: 0 }}>❝</span>
          <div>
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5, fontStyle: 'italic' }}>{quote.quote}</div>
            <div className="bc" style={{ fontSize: 10, color: '#ff5000', marginTop: 3, letterSpacing: 1 }}>— {quote.author.toUpperCase()}</div>
          </div>
        </div>
      )}

      {/* Score hero */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderLeft: `4px solid ${battle.color}`, borderRadius: 16, padding: '18px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
          <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="34" cy="34" r="28" fill="none" stroke="#1e1e1e" strokeWidth="6" />
            <circle cx="34" cy="34" r="28" fill="none" stroke={battle.color} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .6s ease', filter: `drop-shadow(0 0 6px ${battle.color})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="bc" style={{ fontSize: 15, fontWeight: 900, color: battle.color }}>{pct}%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 3 }}>{format(new Date(), 'EEEE, MMM d').toUpperCase()}</div>
          <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: battle.color, lineHeight: 1.1 }}>{battle.text}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{battle.sub}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{done}/{total} missions done</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: '#ff5000', border: 'none', color: '#0a0a0a', width: 34, height: 34, borderRadius: 8, fontSize: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 12px rgba(255,80,0,0.4)' }}>+</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${battle.color},#ff8c00)`, borderRadius: 2, transition: 'width .5s ease', boxShadow: '0 0 8px rgba(255,80,0,0.5)' }} />
      </div>

      {/* Yesterday quick panel */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <button onClick={() => setShowYesterday(v => !v)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span className="bc" style={{ fontSize: 12, color: '#555', letterSpacing: 2 }}>YESTERDAY</span>
          <div style={{ flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${yesterdayPct}%`, background: yesterdayPct >= 70 ? '#ff5000' : yesterdayPct >= 40 ? '#ff8c00' : '#3a1a1a', borderRadius: 2 }} />
          </div>
          <span className="bc" style={{ fontSize: 14, fontWeight: 900, color: yesterdayPct >= 70 ? '#ff5000' : '#888' }}>{yesterdayPct}%</span>
          <span style={{ color: '#444', fontSize: 12 }}>{showYesterday ? '▲' : '▼'}</span>
        </button>
        {showYesterday && (
          <div style={{ borderTop: '1px solid #1a1a1a', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {commonHabits.map(h => {
              const done = !!commonLogs[`${h.id}:${yesterday}`]
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: done ? 'rgba(255,80,0,0.08)' : '#141414', border: `1px solid ${done ? '#ff5000' : '#1e1e1e'}`, borderRadius: 8, padding: '5px 10px' }}>
                  <span style={{ fontSize: 14 }}>{h.icon}</span>
                  <span className="bc" style={{ fontSize: 11, color: done ? '#ff5000' : '#444', fontWeight: 700 }}>{h.label}</span>
                  <span style={{ fontSize: 10, color: done ? '#22c55e' : '#ef4444' }}>{done ? '✓' : '✗'}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {commonHabits.length === 0 && (
        <div style={{ background: '#0f0f0f', border: '1px dashed #2a2a2a', borderRadius: 16, padding: '36px 20px', textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🏋️</div>
          <div className="bc" style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>NO MISSIONS LOADED</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>Load defaults or build your own mission set{profile?.is_muslim ? ' (includes Namaz)' : ''}.</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={setupDefaults} disabled={setupLoading} className="bc" style={{ background: '#ff5000', border: 'none', color: '#0a0a0a', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 900, letterSpacing: 1, cursor: 'pointer', boxShadow: '0 0 16px rgba(255,80,0,0.3)', opacity: setupLoading ? .7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {setupLoading ? <><div className="spinner" /> LOADING...</> : `LOAD DEFAULTS${profile?.is_muslim ? ' + NAMAZ' : ''}`}
            </button>
            <button onClick={() => setShowAdd(true)} className="bc" style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>+ CUSTOM</button>
          </div>
        </div>
      )}

      {/* Section label */}
      {commonHabits.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ height: 1, flex: 1, background: '#1a1a1a' }} />
          <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#333', fontWeight: 700 }}>DAILY MISSIONS</div>
          <div style={{ height: 1, flex: 1, background: '#1a1a1a' }} />
        </div>
      )}

      {/* Habit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {commonHabits.map((h, i) => {
          const isDone = !!commonLogs[`${h.id}:${today}`]
          const streak = getStreak(h.id, commonLogs)
          const rate = getRate(h.id, commonLogs, 7)
          return (
            <div key={h.id} className={`rise ${tapped === h.id ? (isDone ? 'shake' : 'slam') : ''}`} style={{ animationDelay: `${i * 40}ms` }} onClick={() => tap(h.id)}>
              <div style={{ background: isDone ? 'rgba(255,80,0,0.06)' : '#0f0f0f', border: `1px solid ${isDone ? '#ff5000' : '#1e1e1e'}`, borderLeft: `4px solid ${isDone ? '#ff5000' : h.color || '#2a2a2a'}`, borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all .18s', userSelect: 'none', position: 'relative', overflow: 'hidden' }}>
                {isDone && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(255,80,0,0.04),transparent)', pointerEvents: 'none' }} />}
                <div style={{ fontSize: 22, filter: isDone ? 'none' : 'grayscale(.7) opacity(.4)', transition: 'filter .2s', flexShrink: 0 }}>{h.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bc" style={{ fontSize: 16, fontWeight: 800, letterSpacing: .5, color: isDone ? '#f5f5f5' : '#555' }}>{h.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    {streak > 0 && <span className="bc" style={{ fontSize: 10, background: 'rgba(255,140,0,0.12)', color: '#ff8c00', padding: '2px 7px', borderRadius: 5, fontWeight: 700, letterSpacing: 1 }}>🔥{streak}D</span>}
                    <span style={{ fontSize: 11, color: '#444' }}>{rate}% this week</span>
                    {h.is_muslim_habit && <span style={{ fontSize: 10, color: '#fbbf24', letterSpacing: 1 }}>🕌</span>}
                  </div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: isDone ? '#ff5000' : '#1a1a1a', border: `2px solid ${isDone ? '#ff5000' : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontSize: 13, fontWeight: 900, transition: 'all .2s', boxShadow: isDone ? '0 0 12px rgba(255,80,0,0.5)' : 'none' }}>{isDone ? '✓' : ''}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Coach box */}
      {commonHabits.length > 0 && (
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
          <button onClick={getAISuggestion} style={{ width: '100%', background: 'transparent', border: 'none', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,80,0,0.1)', border: '1px solid rgba(255,80,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div className="bc" style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, color: '#ff5000' }}>COACH CLAUDE</div>
              <div style={{ fontSize: 11, color: '#555' }}>AI analysis based on your performance</div>
            </div>
            <span style={{ fontSize: 14, color: '#333' }}>{showSuggestion ? '▲' : '▼'}</span>
          </button>
          {showSuggestion && (
            <div style={{ borderTop: '1px solid #1a1a1a', padding: '13px 16px', background: 'rgba(255,80,0,0.03)' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="spinner" /><span style={{ fontSize: 13, color: '#555' }}>Analysing your data...</span></div>
              ) : (
                <div style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.75 }}>{aiSuggestion}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Missed habits */}
      {missed.length > 0 && commonHabits.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '13px 14px', marginBottom: 14 }}>
          <div className="bc" style={{ fontSize: 11, letterSpacing: 2, color: '#ef4444', marginBottom: 10 }}>⚠ UNFINISHED MISSIONS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {missed.map(h => (
              <div key={h.id} onClick={() => tap(h.id)} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <span style={{ fontSize: 16 }}>{h.icon}</span>
                <span className="bc" style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{h.label}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 10, fontStyle: 'italic' }}>
            "{MISS_QUOTES[new Date().getMinutes() % MISS_QUOTES.length].quote}"
          </div>
        </div>
      )}

      {showAdd && <AddHabitModal type="common" onClose={() => setShowAdd(false)} onAdd={addCommonHabit} profile={profile} />}
    </div>
  )
}