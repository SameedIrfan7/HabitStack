import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, subDays } from 'date-fns'

const MEDALS = ['🥇','🥈','🥉']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7)
  const [copied, setCopied] = useState(false)

  useEffect(() => { load() }, [range])

  async function load() {
    setLoading(true)
    const from = format(subDays(new Date(), range), 'yyyy-MM-dd')
    const { data: scores } = await supabase.from('daily_scores').select('user_id,score,score_date').gte('score_date', from)
    if (!scores?.length) { setBoard([]); setLoading(false); return }

    const map = {}
    scores.forEach(s => {
      if (!map[s.user_id]) map[s.user_id] = { scores:[], total:0, days:0 }
      map[s.user_id].scores.push(s.score)
      map[s.user_id].total += s.score
      map[s.user_id].days++
    })

    const ids = Object.keys(map)
    const { data: profiles } = await supabase.from('profiles').select('id,display_name,username,avatar_emoji').in('id', ids)

    const result = (profiles || []).map(p => {
      const st = map[p.id] || { total:0, days:1, scores:[] }
      const avg = Math.round(st.total / st.days)
      const best = Math.max(...st.scores, 0)
      let streak = 0; for (let i = st.scores.length-1; i>=0; i--) { if(st.scores[i]>=50) streak++; else break }
      return { ...p, avg, best, streak, days: st.days }
    }).sort((a,b) => b.avg - a.avg)

    setBoard(result); setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.origin + '/auth')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
    {[1,2,3,4].map(i=><div key={i} style={{ height:72, borderRadius:12, background:'#141414', opacity:.5 }}/>)}
  </div>

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize:28, fontWeight:900, letterSpacing:1, color:'#ff5000', marginBottom:2 }}>CREW RANKINGS</div>
      <div className="bc" style={{ fontSize:10, letterSpacing:3, color:'#444', marginBottom:16 }}>SCORES ONLY · YOUR HABITS STAY PRIVATE</div>

      {/* Range toggle */}
      <div style={{ display:'flex', background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:10, padding:4, marginBottom:16, gap:4 }}>
        {[7,30].map(r=>(
          <button key={r} onClick={()=>setRange(r)} className="bc" style={{
            flex:1, padding:'8px 0', borderRadius:8, border:'none', fontSize:13, fontWeight:800, letterSpacing:1,
            background:range===r?'#ff5000':'transparent', color:range===r?'#0a0a0a':'#555', transition:'all .2s',
          }}>LAST {r}D</button>
        ))}
      </div>

      {board.length === 0 ? (
        <div style={{ background:'#0f0f0f', border:'1px dashed #2a2a2a', borderRadius:14, padding:'40px 20px', textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>👀</div>
          <div className="bc" style={{ fontSize:18, fontWeight:900, letterSpacing:1, marginBottom:8 }}>EMPTY LEADERBOARD</div>
          <div style={{ fontSize:13, color:'#555' }}>Start tracking and invite your crew!</div>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {board.length >= 2 && (
            <div style={{
              background:'linear-gradient(180deg,#150800,#0f0f0f)', border:'1px solid #1e1e1e',
              borderRadius:16, padding:'20px 12px 0', marginBottom:14,
              display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:6, alignItems:'end',
            }}>
              {[board[1], board[0], board[2]].filter(Boolean).map((u,i) => {
                const rankIdx = i===1 ? 0 : i===0 ? 1 : 2
                const heights = [80,110,56]
                const colors  = ['#aaa','#ff5000','#cd7f32']
                return (
                  <div key={u.id} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:rankIdx===0?32:26, marginBottom:4 }}>{u.avatar_emoji}</div>
                    <div className="bc" style={{ fontSize:rankIdx===0?15:13, fontWeight:900, color:rankIdx===0?'#ff5000':'#f5f5f5', marginBottom:2 }}>{u.display_name}</div>
                    <div className="bc" style={{ fontSize:rankIdx===0?24:18, fontWeight:900, color:colors[rankIdx], textShadow:rankIdx===0?'0 0 16px rgba(255,80,0,0.6)':'none' }}>{u.avg}%</div>
                    <div style={{
                      height:heights[rankIdx], marginTop:8,
                      background:rankIdx===0?'linear-gradient(180deg,#3a1500,#1e0a00)':rankIdx===1?'#2a2a2a':'#1e1e1e',
                      borderRadius:'6px 6px 0 0', borderTop:`3px solid ${colors[rankIdx]}`,
                      display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:8, fontSize:22,
                      boxShadow:rankIdx===0?'0 -6px 24px rgba(255,80,0,0.25)':'none',
                    }}>{MEDALS[rankIdx]}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          {board.map((entry, i) => {
            const isMe = entry.id === user?.id
            return (
              <div key={entry.id} className="rise" style={{ animationDelay:`${i*40}ms`, marginBottom:8 }}>
                <div style={{
                  background: isMe ? 'rgba(255,80,0,0.07)' : '#0f0f0f',
                  border: `1px solid ${isMe ? '#ff5000' : '#1e1e1e'}`,
                  borderLeft:`4px solid ${i===0?'#ffd700':i===1?'#aaa':i===2?'#cd7f32':'#2a2a2a'}`,
                  borderRadius:12, padding:'13px 14px', display:'flex', alignItems:'center', gap:12,
                }}>
                  <div className="bc" style={{ fontSize:22, fontWeight:900, width:30, textAlign:'center', color:i<3?['#ffd700','#aaa','#cd7f32'][i]:'#333' }}>#{i+1}</div>
                  <div style={{ width:38, height:38, borderRadius:8, background:'#141414', border:`1px solid ${isMe?'#ff5000':'#2a2a2a'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{entry.avatar_emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="bc" style={{ fontSize:16, fontWeight:900, letterSpacing:.5, display:'flex', alignItems:'center', gap:8 }}>
                      {entry.display_name}
                      {isMe && <span className="bc" style={{ fontSize:9, background:'#ff5000', color:'#0a0a0a', padding:'2px 6px', borderRadius:4, fontWeight:900, letterSpacing:1 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize:11, color:'#555' }}>@{entry.username} · 🔥{entry.streak}d streak</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="bc" style={{ fontSize:26, fontWeight:900, color:i===0?'#ff5000':'#f5f5f5', textShadow:i===0?'0 0 14px rgba(255,80,0,0.5)':'none' }}>{entry.avg}%</div>
                    <div style={{ fontSize:9, color:'#444', letterSpacing:1 }}>AVG SCORE</div>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Invite */}
      <div style={{ marginTop:16, background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, padding:16 }}>
        <div className="bc" style={{ fontSize:14, fontWeight:800, letterSpacing:1, marginBottom:4 }}>📨 RECRUIT YOUR CREW</div>
        <div style={{ fontSize:12, color:'#555', marginBottom:12, lineHeight:1.6 }}>Share this link. Leaderboard only shows scores — habits stay private forever.</div>
        <div style={{ background:'#141414', border:'1px solid #1e1e1e', borderRadius:9, padding:'10px 14px', fontSize:12, color:'#888', fontFamily:"'Barlow',sans-serif", wordBreak:'break-all', marginBottom:10 }}>
          {window.location.origin}/auth
        </div>
        <button onClick={copyLink} className="bc" style={{ background:'#ff5000', border:'none', color:'#0a0a0a', padding:'10px 20px', borderRadius:9, fontSize:13, fontWeight:900, letterSpacing:1 }}>
          {copied ? '✓ COPIED!' : '📋 COPY LINK'}
        </button>
      </div>
    </div>
  )
}
