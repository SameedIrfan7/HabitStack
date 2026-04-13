import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`
const AI_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}

export default function FloatingChat() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: user ? `Hey ${profile?.display_name || 'Warrior'} 👊 I'm Coach Claude. Ask me anything about your habits, performance, or how to improve.` : `Hey! I'm Coach Claude 👊 Login to get personalised coaching based on your habit data.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Try to use habits if logged in
  let habitContext = ''
  try {
    const habits = useHabitsContext()
    habitContext = habits
  } catch {}

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  async function send() {
    if (!input.trim() || loading) return
    if (!user) {
      setMessages(p => [...p,
        { role: 'user', text: input.trim() },
        { role: 'ai', text: '🔒 Please sign in to get personalised coaching. Your habit data powers my responses!' }
      ])
      setInput('')
      return
    }
    const msg = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const res = await fetch(AI_URL, {
        method: 'POST', headers: AI_HEADERS,
        body: JSON.stringify({ type: 'chat', displayName: profile?.display_name, message: msg, habitContext })
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'ai', text: data.text || 'Keep pushing forward!' }])
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Connection issue. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        }} />
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 16, zIndex: 999,
          width: 'min(360px, calc(100vw - 32px)',
          background: 'rgba(15,15,15,0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,80,0,0.25)',
          borderRadius: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,80,0,0.1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp .25s ease',
        }}>
          <style>{`
            @keyframes chatSlideUp {
              from { opacity:0; transform:translateY(20px) scale(0.97); }
              to { opacity:1; transform:translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,80,0,0.15)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,80,0,0.05)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,80,0,0.15)', border: '1px solid rgba(255,80,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 900, letterSpacing: 1, color: '#ff5000' }}>COACH CLAUDE</div>
              <div style={{ fontSize: 11, color: '#555' }}>{user ? 'Powered by your habit data' : 'Login for personalised coaching'}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ height: 300, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#ff5000' : 'rgba(255,255,255,0.05)',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13, color: m.role === 'user' ? '#0a0a0a' : '#d4d4d8',
                  lineHeight: 1.6, fontWeight: m.role === 'user' ? 700 : 400,
                }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="spinner" /><span style={{ fontSize: 12, color: '#555' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={user ? 'Ask your coach...' : 'Sign in to chat...'}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f5f5f5', outline: 'none',
                fontFamily: "'Barlow',sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,80,0,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button onClick={send} disabled={loading} style={{
              background: '#ff5000', border: 'none', color: '#0a0a0a',
              width: 40, height: 40, borderRadius: 10, fontSize: 18,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              opacity: loading ? 0.5 : 1,
            }}>↑</button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 997,
          width: 52, height: 52, borderRadius: 16,
          background: open ? 'rgba(255,80,0,0.9)' : 'rgba(15,15,15,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,80,0,0.4)',
          boxShadow: open ? '0 8px 32px rgba(255,80,0,0.5)' : '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,80,0,0.2)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          transition: 'all .2s',
        }}
      >
        {open ? '×' : '🤖'}
      </button>
    </>
  )
}

// Safe hook wrapper — returns empty string if not in habit context
function useHabitsContext() {
  try {
    const { commonHabits, commonLogs, getRate, getStreak } = useHabits()
    if (!commonHabits?.length) return ''
    return commonHabits.map(h => {
      const rate = getRate(h.id, commonLogs, 7)
      const streak = getStreak(h.id, commonLogs)
      return `${h.label}: ${rate}% this week, ${streak}d streak`
    }).join('; ')
  } catch {
    return ''
  }
}