import { useState } from 'react'
import { useHabits } from '../hooks/useHabits'
import AddHabitModal from '../components/AddHabitModal'
import { format } from 'date-fns'

export default function PersonalPage() {
  const { personalHabits, personalLogs, loading, togglePersonal, addPersonalHabit, deletePersonalHabit, today } = useHabits()
  const [tapped, setTapped] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  function tap(id) {
    setTapped(id); setTimeout(()=>setTapped(null),350)
    togglePersonal(id)
  }

  const done = personalHabits.filter(h => personalLogs[`${h.id}:${today}`]).length

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
              <div key={h.id} className={`rise ${tapped===h.id?(isDone?'shake':'slam'):''}`}
                style={{ animationDelay:`${i*40}ms` }}
                onClick={() => tap(h.id)}>
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
