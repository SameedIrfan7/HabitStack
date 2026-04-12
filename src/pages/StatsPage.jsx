import { useHabits } from '../hooks/useHabits'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TT = { contentStyle:{ background:'#111', border:'1px solid #ff5000', borderRadius:8, color:'#f5f5f5', fontFamily:"'Barlow Condensed',sans-serif", fontSize:14 }, cursor:{ fill:'rgba(255,80,0,0.05)' } }

export default function StatsPage() {
  const { commonHabits, commonLogs, loading, getRate, getStreak, getWeekData, getMonthData } = useHabits()
  const weekData  = getWeekData(commonHabits, commonLogs)
  const monthData = getMonthData(commonHabits, commonLogs)

  if (loading) return <Skel/>

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize:28, fontWeight:900, letterSpacing:1, color:'#ff5000', marginBottom:2 }}>WAR REPORT</div>
      <div className="bc" style={{ fontSize:11, letterSpacing:4, color:'#444', marginBottom:20 }}>YOUR BATTLE HISTORY</div>

      <Card title="THIS WEEK">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barCategoryGap="28%">
            <XAxis dataKey="day" tick={{ fill:'#555', fontSize:12, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, letterSpacing:1 }} axisLine={false} tickLine={false}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip {...TT} formatter={v=>[v+'%','SCORE']}/>
            <Bar dataKey="score" radius={[4,4,0,0]}>
              {weekData.map((e,i)=><Cell key={i} fill={e.score>=80?'#ff5000':e.score>=50?'#9a3412':'#2a1500'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="30-DAY GRIND">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={monthData}>
            <XAxis dataKey="label" tick={{ fill:'#555', fontSize:9, fontFamily:"'Barlow Condensed',sans-serif" }} axisLine={false} tickLine={false} interval={6}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip {...TT} formatter={v=>[v+'%']}/>
            <Line type="monotone" dataKey="score" stroke="#ff5000" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:'#ff8c00' }}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="MISSION BREAKDOWN">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {commonHabits.length === 0 && <div style={{ fontSize:13, color:'#555', textAlign:'center', padding:'20px 0' }}>No habits tracked yet.</div>}
          {commonHabits.map(h => {
            const r7  = getRate(h.id, commonLogs, 7)
            const r30 = getRate(h.id, commonLogs, 30)
            const str = getStreak(h.id, commonLogs)
            const trend = r7 - r30
            return (
              <div key={h.id} style={{ background:'#141414', border:'1px solid #1e1e1e', borderRadius:12, padding:'13px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{h.icon}</span>
                  <div style={{ flex:1 }}>
                    <div className="bc" style={{ fontSize:15, fontWeight:800, letterSpacing:.5 }}>{h.label}</div>
                    {str > 0 && <div style={{ fontSize:11, color:'#ff8c00' }}>🔥 {str}d streak</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="bc" style={{ fontSize:24, fontWeight:900, color:h.color }}>{r7}%</div>
                    <div style={{ fontSize:10, color: trend>0?'#22c55e':trend<0?'#ef4444':'#555' }}>
                      {trend>0?'↑':trend<0?'↓':'→'} {Math.abs(trend)}%
                    </div>
                  </div>
                </div>
                <div style={{ height:4, background:'#1a1a1a', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${r7}%`, background:`linear-gradient(90deg,${h.color},#ff8c00)`, borderRadius:2, transition:'width .5s' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background:'#0f0f0f', border:'1px solid #1e1e1e', borderRadius:14, padding:'16px 14px', marginBottom:14 }}>
      <div className="bc" style={{ fontSize:11, letterSpacing:3, color:'#555', marginBottom:14, fontWeight:700 }}>{title}</div>
      {children}
    </div>
  )
}

function Skel() {
  return <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
    {[1,2,3].map(i=><div key={i} style={{ height:160, borderRadius:14, background:'#141414', opacity:.5 }}/>)}
  </div>
}
