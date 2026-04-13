import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

const TT = { contentStyle: { background: '#111', border: '1px solid #ff5000', borderRadius: 8, color: '#f5f5f5', fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14 }, cursor: { fill: 'rgba(255,80,0,0.05)' } }

export default function StatsPage() {
  const { profile } = useAuth()
  const { commonHabits, commonLogs, getRate, getStreak, getWeekData, getMonthData, getTodayCommonScore } = useHabits()
  const [aiPrediction, setAiPrediction] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [predShown, setPredShown] = useState(false)

  const weekData = getWeekData(commonHabits, commonLogs)
  const monthData = getMonthData(commonHabits, commonLogs)
  const { pct } = getTodayCommonScore()

  const last7Avg = Math.round(weekData.reduce((a, d) => a + d.score, 0) / 7)
  const last30Avg = Math.round(monthData.reduce((a, d) => a + d.score, 0) / 30)
  const trend = last7Avg - last30Avg

  const projectionIfKeep = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i + 1}`,
    keep: Math.min(100, Math.max(0, last7Avg + (trend > 0 ? trend * 0.5 : trend * 0.3) * (i / 30) + (Math.random() - 0.5) * 5)),
    quit: Math.max(0, last7Avg - (15 + i * 1.5) + (Math.random() - 0.5) * 4),
  }))

  async function getAIPrediction() {
    setAiLoading(true); setPredShown(true); setAiPrediction('')
    const habitSummary = commonHabits.map(h => `${h.label}: ${getRate(h.id, commonLogs, 7)}% (7d), ${getStreak(h.id, commonLogs)}d streak`).join('\n')
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          displayName: profile?.display_name,
          pct: last7Avg,
          done: last7Avg,
          total: 100,
          doneLabels: habitSummary,
          missedLabels: `7-day avg: ${last7Avg}%, 30-day avg: ${last30Avg}%, trend: ${trend > 0 ? '+' : ''}${trend}%`
        })
      })
      const data = await res.json()
      setAiPrediction(data.text || 'Keep your current pace and you will be unstoppable in 30 days.')
    } catch { setAiPrediction('Your data shows strong momentum. Keep going.') }
    setAiLoading(false)
  }

  const topHabits = [...commonHabits].map(h => ({ ...h, rate: getRate(h.id, commonLogs, 7) })).sort((a, b) => b.rate - a.rate)
  const weakHabits = [...topHabits].sort((a, b) => a.rate - b.rate).slice(0, 3)

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, color: '#ff5000', marginBottom: 2 }}>WAR REPORT</div>
      <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#444', marginBottom: 16 }}>YOUR BATTLE ANALYTICS</div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: '7-DAY AVG', val: `${last7Avg}%`, color: '#ff5000' },
          { label: '30-DAY AVG', val: `${last30Avg}%`, color: '#ff8c00' },
          { label: 'TREND', val: `${trend >= 0 ? '+' : ''}${trend}%`, color: trend >= 0 ? '#22c55e' : '#ef4444' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div className="bc" style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div className="bc" style={{ fontSize: 8, letterSpacing: 2, color: '#444', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Week bar chart */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 8px', marginBottom: 12 }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 14, paddingLeft: 8 }}>THIS WEEK</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekData} barCategoryGap="28%">
            <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: 1 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip {...TT} formatter={v => [v + '%', 'SCORE']} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {weekData.map((e, i) => <Cell key={i} fill={e.score >= 80 ? '#ff5000' : e.score >= 60 ? '#9a3412' : e.score > 0 ? '#2a1500' : '#111'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 30-day trend */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 8px', marginBottom: 12 }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 14, paddingLeft: 8 }}>30-DAY GRIND</div>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={monthData}>
            <XAxis dataKey="label" tick={{ fill: '#444', fontSize: 9, fontFamily: "'Barlow Condensed',sans-serif" }} axisLine={false} tickLine={false} interval={6} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip {...TT} formatter={v => [v + '%', 'SCORE']} />
            <ReferenceLine y={last30Avg} stroke="#333" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="score" stroke="#ff5000" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#ff8c00' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Prediction */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
        <button onClick={getAIPrediction} style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,80,0,0.1)', border: '1px solid rgba(255,80,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🔮</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div className="bc" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1, color: '#ff5000' }}>30-DAY AI PREDICTION</div>
            <div style={{ fontSize: 11, color: '#555' }}>What happens if you keep going — or stop</div>
          </div>
          <span style={{ color: '#444', fontSize: 12 }}>{predShown ? '▲' : '▼'}</span>
        </button>
        {predShown && (
          <div style={{ borderTop: '1px solid #1a1a1a' }}>
            <div style={{ padding: '14px 8px 0' }}>
              <div className="bc" style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginBottom: 10, paddingLeft: 8 }}>PROJECTED NEXT 30 DAYS</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={projectionIfKeep}>
                  <XAxis dataKey="day" tick={{ fill: '#333', fontSize: 8 }} axisLine={false} tickLine={false} interval={9} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f5f5f5', fontSize: 12 }} />
                  <Line type="monotone" dataKey="keep" stroke="#ff5000" strokeWidth={2} dot={false} name="IF YOU GRIND" />
                  <Line type="monotone" dataKey="quit" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" name="IF YOU STOP" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 14, padding: '6px 8px 12px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: '#ff5000' }} /><span style={{ fontSize: 10, color: '#888' }}>IF YOU GRIND</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 16, height: 2, background: '#ef4444', borderTop: '2px dashed #ef4444' }} /><span style={{ fontSize: 10, color: '#888' }}>IF YOU STOP</span></div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1a1a1a', padding: '13px 16px', background: 'rgba(255,80,0,0.03)' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="spinner" /><span style={{ fontSize: 13, color: '#555' }}>Crunching your data...</span></div>
              ) : (
                <div style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.8 }}>{aiPrediction}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Habit breakdown */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 14px', marginBottom: 12 }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 14 }}>HABIT BREAKDOWN (7D)</div>
        {commonHabits.length === 0 && <div style={{ fontSize: 13, color: '#444', textAlign: 'center', padding: '16px 0' }}>No habits yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topHabits.map(h => {
            const streak = getStreak(h.id, commonLogs)
            const r30 = getRate(h.id, commonLogs, 30)
            const t = h.rate - r30
            return (
              <div key={h.id} style={{ background: '#141414', border: '1px solid #1e1e1e', borderLeft: `3px solid ${h.color}`, borderRadius: 10, padding: '11px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bc" style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</div>
                    {streak > 0 && <span style={{ fontSize: 10, color: '#ff8c00' }}>🔥 {streak}d streak</span>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="bc" style={{ fontSize: 22, fontWeight: 900, color: h.color }}>{h.rate}%</div>
                    <div style={{ fontSize: 10, color: t >= 0 ? '#22c55e' : '#ef4444' }}>{t >= 0 ? '↑' : '↓'}{Math.abs(t)}% vs 30d</div>
                  </div>
                </div>
                <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${h.rate}%`, background: `linear-gradient(90deg,${h.color},#ff8c00)`, borderRadius: 2, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weakest habits */}
      {weakHabits.length > 0 && weakHabits.some(h => h.rate < 60) && (
        <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '14px 14px' }}>
          <div className="bc" style={{ fontSize: 11, letterSpacing: 2, color: '#ef4444', marginBottom: 10 }}>⚡ NEEDS WORK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weakHabits.filter(h => h.rate < 60).map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{h.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="bc" style={{ fontSize: 13, fontWeight: 700 }}>{h.label}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>Only {h.rate}% this week</div>
                </div>
                <div className="bc" style={{ fontSize: 20, fontWeight: 900, color: '#ef4444' }}>{h.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}