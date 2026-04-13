import { useState, useRef, useEffect } from 'react'
import { useHabits } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import AddHabitModal from '../components/AddHabitModal'

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`
const AI_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
}

export default function PersonalPage() {
  const { profile } = useAuth()
  const { personalHabits, personalLogs, commonHabits, commonLogs, loading, togglePersonal, addPersonalHabit, deletePersonalHabit, today, getRate, getStreak } = useHabits()
  const [tapped, setTapped] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hey ${profile?.display_name || 'Warrior'} 👊 I'm your personal coach. Ask me anything about your habits, streaks, or how to improve.` }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  const done = personalHabits.filter(h => personalLogs[`${h.id}:${today}`]).length

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function tap(id) {
    setTapped(id); setTimeout(()=>setTapped(null),350)
    togglePersonal(id)
  }

  async function sendMessage() {
    if (!input.trim() || chatLoading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', text: userMsg }])
    setChatLoading(true)

    const habitContext = commonHabits.map(h => {
      const rate = getRate(h.id, commonLogs, 7)
      const streak = getStreak(h.id, commonLogs)
      return `${h.label}: ${rate}% this week, ${streak}d streak`
    }).join('; ')

    try {
      const res = await fetch(AI_URL, {
        method: 'POST', headers: AI_HEADERS,
        body: JSON.stringify({ type: 'chat', displayName: profile?.display_name, message: userMsg, habitContext })
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'ai', text: data.text || 'Keep pushing forward!' }])
    } catch {
      setMessages(p => [...p, { role: 'ai', text: 'Connection issue. Try again.' }])
    }
    setChatLoading(false)
  }

  return (
    <div className="fade-in">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
        <div>
          <div className="bc" style={{ fontSize:28, fontWeight:900, letterSpacing:1, color:'#f5f5f5' }}>PERSONAL ZONE</div>
          <div className="bc" style={{ fontSize:10, letterSpacing:3, color:'#444' }}>🔒 NEVER ON LEADERBOARD</div>
        </div>
        <div style={{ marginLeft:'auto', background:'rgba(255,80,0,0.08)', border:'1px solid rgba(255,80,0,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
          <div className="bc" style={{ fontSize:24, fontWeight:900, color:'#ff5000' }}>{done}/{personalHabits.length}</div>
          <div style={{ fontSize:10, color:'#555' }}>done</div>
        </div>
      </div>

      {/* Privacy badge */}
      <div style={{ background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:12, padding:'12px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>🔐</span>
        <div style={{ fontSize:13, color:'#888', lineHeight:1.5 }}>
          These are <strong style={{ color:'#f5f5f5' }}>your private habits</strong>. Not synced to the crew leaderboard. Only you see them.
        </div>
      </div>

      {/* Coach Chat */}
      <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
        <button onClick={() => setShowChat(v => !v)} style={{ width:'100%', background:'transparent', border:'none', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,80,0,0.1)', border:'1px solid rgba(255,80,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🤖</div>
          <div style={{ flex:1, textAlign:'left' }}>
            <div className="bc" style={{ fontSize:14, fontWeight:900, letterSpacing:1, color:'#ff5000' }}>COACH CHAT</div>
            <div style={{ fontSize:11, color:'#555' }}>Ask anything about your habits & performance</div>
          </div>
          <span style={{ color:'#444', fontSize:12 }}>{showChat ? '▲' : '▼'}</span>
        </button>

        {showChat && (
          <div style={{ borderTop:'1px solid #1a1a1a' }}>
            {/* Messages */}
            <div style={{ height:280, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.role === 'user' ? '#ff5000' : '#141414',
                    border: m.role === 'user' ? 'none' : '1px solid #2a2a2a',
                    fontSize:13, color: m.role === 'user' ? '#0a0a0a' : '#d4d4d8',
                    lineHeight:1.6, fontWeight: m.role === 'user' ? 700 : 400,
                  }}>{m.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:'14px 14px 14px 4px', padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
                    <div className="spinner"/><span style={{ fontSize:12, color:'#555' }}>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop:'1px solid #1a1a1a', padding:'12px 16px', display:'flex', gap:8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your coach..."
                style={{ flex:1, background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#f5f5f5', outline:'none' }}
                onFocus={e => e.target.style.borderColor = '#ff5000'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
              <button onClick={sendMessage} disabled={chatLoading} style={{ background:'#ff5000', border:'none', color:'#0a0a0a', width:40, height:40, borderRadius:10, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>↑</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setShowAdd(true)} className="bc" style={{
        width:'100%', background:'#ff5000', border:'none', color:'#0a0a0a',
        padding:'13px', borderRadius:12, fontSize:15, fontWeight:900, letterSpacing:2,
        marginBottom:16, boxShadow:'0 0 18px rgba(255,80,0,0.3)',
      }}>+ ADD PERSONAL HABIT</button>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[1,2,3].map(i=><div key={i} style={{ height:70, borderRadius:12, background:'#141414', opacity:.5 }}/>)}
        </div>
      ) : personalHabits.length === 0 ? (
        <div style={{ background:'#0f0f0f', border:'1px dashed #2a2a2a', borderRadius:14, padding:'40px 20px', textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🔒</div>
          <div className="bc" style={{ fontSize:18, fontWeight:900, letterSpacing:1, marginBottom:8 }}>YOUR PRIVATE DOJO</div>
          <div style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>Add personal habits — side quests, religious practices, anything you want to track privately.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {personalHabits.map((h, i) => {
            const isDone = !!personalLogs[`${h.id}:${today}`]
            return (
              <div key={h.id} className={`rise ${tapped===h.id?(isDone?'shake':'slam'):''}`} style={{ animationDelay:`${i*40}ms` }} onClick={() => tap(h.id)}>
                <div style={{
                  background: isDone ? 'rgba(34,197,94,0.05)' : '#0f0f0f',
                  border: `1px solid ${isDone ? '#22c55e' : '#1e1e1e'}`,
                  borderLeft: `4px solid ${isDone ? '#22c55e' : h.color || '#2a2a2a'}`,
                  borderRadius:12, padding:'13px 14px',
                  display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  transition:'all .18s', userSelect:'none',
                }}>
                  <div style={{ fontSize:24, filter:isDone?'none':'grayscale(.6) opacity(.5)' }}>{h.icon}</div>
                  <div style={{ flex:1 }}>
                    <div className="bc" style={{ fontSize:17, fontWeight:800, color:isDone?'#f5f5f5':'#555' }}>{h.label}</div>
                    <div style={{ fontSize:11, color:'#444' }}>{h.category}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();if(confirm(`Remove "${h.label}"?`))deletePersonalHabit(h.id)}} style={{ background:'transparent', border:'none', color:'#333', fontSize:20, padding:'0 4px', cursor:'pointer' }}>×</button>
                  <div style={{
                    width:30, height:30, borderRadius:7, flexShrink:0,
                    background:isDone?'#22c55e':'#1a1a1a', border:`2px solid ${isDone?'#22c55e':'#2e2e2e'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#0a0a0a', fontSize:14, fontWeight:900, transition:'all .2s',
                  }}>{isDone?'✓':''}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && <AddHabitModal type="personal" onClose={() => setShowAdd(false)} onAdd={addPersonalHabit}/>}
    </div>
  )
}