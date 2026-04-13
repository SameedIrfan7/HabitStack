import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from 'date-fns'

function getRingColor(pct) {
  if (pct >= 80) return '#ff5000'
  if (pct >= 60) return '#ff8c00'
  if (pct >= 40) return '#ffd700'
  if (pct > 0)   return '#444'
  return '#1e1e1e'
}

function CircleRing({ pct, size = 44, label }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const color = getRingColor(pct)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ filter: pct > 0 ? `drop-shadow(0 0 4px ${color})` : 'none' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="bc" style={{ fontSize: 11, fontWeight: 900, color: pct > 0 ? color : '#333' }}>{pct}%</span>
        </div>
      </div>
      {label && <div style={{ fontSize: 9, color: '#444', letterSpacing: 1 }}>{label}</div>}
    </div>
  )
}

export default function CalendarPage() {
  const { commonHabits, commonLogs } = useHabits()
  const [selectedMonth, setSelectedMonth] = useState(0) // 0=this month, 1=last, 2=two months ago
  const months = [0, 1, 2].map(i => subMonths(new Date(), i))

  function getDayScore(dateStr) {
    if (!commonHabits.length) return 0
    const done = commonHabits.filter(h => commonLogs[`${h.id}:${dateStr}`]).length
    return Math.round((done / commonHabits.length) * 100)
  }

  function getDayDone(dateStr) {
    return commonHabits.filter(h => commonLogs[`${h.id}:${dateStr}`]).length
  }

  const currentMonth = months[selectedMonth]
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  // Month stats
  const monthScores = days.map(d => getDayScore(format(d, 'yyyy-MM-dd')))
  const avgScore = monthScores.length ? Math.round(monthScores.reduce((a, b) => a + b, 0) / monthScores.length) : 0
  const bestDay = Math.max(...monthScores)
  const activeDays = monthScores.filter(s => s > 0).length
  const perfectDays = monthScores.filter(s => s === 100).length

  // Per-habit monthly rates
  const habitMonthRates = commonHabits.map(h => {
    const done = days.filter(d => commonLogs[`${h.id}:${format(d, 'yyyy-MM-dd')}`]).length
    return { ...h, rate: Math.round((done / days.length) * 100), done }
  }).sort((a, b) => b.rate - a.rate)

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, color: '#ff5000', marginBottom: 2 }}>BATTLE HISTORY</div>
      <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#444', marginBottom: 16 }}>EVERY DAY ON THE RECORD</div>

      {/* Month selector */}
      <div style={{ display: 'flex', background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 10, padding: 4, marginBottom: 16, gap: 4 }}>
        {months.map((m, i) => (
          <button key={i} onClick={() => setSelectedMonth(i)} className="bc" style={{
            flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 800, letterSpacing: 1,
            background: selectedMonth === i ? '#ff5000' : 'transparent',
            color: selectedMonth === i ? '#0a0a0a' : '#555', cursor: 'pointer', transition: 'all .2s',
          }}>{format(m, 'MMM').toUpperCase()}</button>
        ))}
      </div>

      {/* Monthly stats rings */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '18px 16px', marginBottom: 14 }}>
        <div className="bc" style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{format(currentMonth, 'MMMM yyyy').toUpperCase()}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <CircleRing pct={avgScore} size={72} label="AVG" />
          <CircleRing pct={bestDay} size={72} label="BEST DAY" />
          <CircleRing pct={Math.round((activeDays / days.length) * 100)} size={72} label="ACTIVE" />
          <CircleRing pct={Math.round((perfectDays / days.length) * 100)} size={72} label="PERFECT" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'AVG SCORE', val: `${avgScore}%`, color: getRingColor(avgScore) },
            { label: 'ACTIVE DAYS', val: `${activeDays}/${days.length}`, color: '#ff8c00' },
            { label: 'PERFECT DAYS', val: perfectDays, color: '#ffd700' },
            { label: 'BEST DAY', val: `${bestDay}%`, color: '#ff5000' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#141414', borderRadius: 10, padding: '8px 14px', textAlign: 'center', flex: '1 1 80px' }}>
              <div className="bc" style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div className="bc" style={{ fontSize: 8, letterSpacing: 2, color: '#444', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '16px 12px', marginBottom: 14 }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 12 }}>DAILY GRID</div>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <span className="bc" style={{ fontSize: 10, color: '#333', fontWeight: 700 }}>{d}</span>
            </div>
          ))}
        </div>
        {/* Grid cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(d => {
            const ds = format(d, 'yyyy-MM-dd')
            const score = getDayScore(ds)
            const doneCnt = getDayDone(ds)
            const isToday = ds === today
            const isYesterday = ds === yesterday
            const isFuture = ds > today
            const color = isFuture ? '#0f0f0f' : getRingColor(score)
            return (
              <div key={ds} style={{
                aspectRatio: '1', borderRadius: 6,
                background: isFuture ? '#0f0f0f' : score >= 80 ? 'rgba(255,80,0,0.15)' : score >= 60 ? 'rgba(255,140,0,0.1)' : score > 0 ? 'rgba(255,215,0,0.06)' : '#0a0a0a',
                border: `1px solid ${isToday ? '#ff5000' : isYesterday ? '#ff8c00' : score > 0 ? `${color}40` : '#1a1a1a'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', cursor: isFuture ? 'default' : 'pointer',
                boxShadow: isToday ? '0 0 8px rgba(255,80,0,0.4)' : 'none',
              }}>
                <div style={{ fontSize: 9, color: isToday ? '#ff5000' : '#555', fontWeight: isToday ? 900 : 400, lineHeight: 1 }}>{d.getDate()}</div>
                {!isFuture && score > 0 && <div style={{ fontSize: 8, color, fontWeight: 700, lineHeight: 1, marginTop: 1 }}>{score}%</div>}
                {!isFuture && score === 0 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e1e1e', marginTop: 2 }} />}
              </div>
            )
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {[['#ff5000','80-100%'],['#ff8c00','60-79%'],['#ffd700','40-59%'],['#444','1-39%'],['#1a1a1a','0%']].map(([c,l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
              <span style={{ fontSize: 10, color: '#444' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-habit breakdown grid */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '16px 14px', marginBottom: 14 }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 14 }}>HABIT PERFORMANCE — {format(currentMonth, 'MMM').toUpperCase()}</div>
        {commonHabits.length === 0 && <div style={{ fontSize: 13, color: '#444', textAlign: 'center', padding: '20px 0' }}>No habits tracked yet.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {habitMonthRates.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{h.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="bc" style={{ fontSize: 13, fontWeight: 800, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</div>
                <div style={{ height: 5, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${h.rate}%`, background: `linear-gradient(90deg,${h.color},#ff8c00)`, borderRadius: 3, transition: 'width .6s ease' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="bc" style={{ fontSize: 18, fontWeight: 900, color: getRingColor(h.rate) }}>{h.rate}%</div>
                <div style={{ fontSize: 10, color: '#444' }}>{h.done}d</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-month comparison circles */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '16px 14px' }}>
        <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 14 }}>3-MONTH OVERVIEW</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: 10 }}>
          {months.map((m, i) => {
            const mDays = eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) })
            const mScores = mDays.map(d => getDayScore(format(d, 'yyyy-MM-dd')))
            const mAvg = mScores.length ? Math.round(mScores.reduce((a, b) => a + b, 0) / mScores.length) : 0
            return (
              <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                <CircleRing pct={mAvg} size={64} />
                <div className="bc" style={{ fontSize: 11, color: '#888', marginTop: 6, fontWeight: 700 }}>{format(m, 'MMM').toUpperCase()}</div>
                <div className="bc" style={{ fontSize: 18, fontWeight: 900, color: getRingColor(mAvg), marginTop: 2 }}>{mAvg}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
