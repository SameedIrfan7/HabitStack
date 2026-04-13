import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/app',            sym: '◈', label: 'TODAY'    },
  { to: '/app/calendar',   sym: '▦', label: 'HISTORY'  },
  { to: '/app/stats',      sym: '▲', label: 'STATS'    },
  { to: '/app/leaderboard',sym: '◉', label: 'CREW'     },
  { to: '/app/fire',       sym: '▶', label: 'FIRE'     },
]

export default function Layout() {
  const { profile } = useAuth()
  const loc = useLocation()
  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', position:'relative' }}>
      <div className="diagonal-bg" style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>
      <div style={{ position:'fixed', left:0, right:0, height:2, zIndex:1, pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(255,80,0,0.3),transparent)', animation:'scanline 8s linear infinite' }}/>
      <header style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,10,10,0.97)', backdropFilter:'blur(24px)', borderBottom:'1px solid #1a1a1a' }}>
        <div style={{ maxWidth:520, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:52 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <img src="/icon-32.png" alt="" style={{ width:22, height:22, borderRadius:5 }} onError={e=>e.target.style.display='none'}/>
            <span className="bc" style={{ fontSize:20, fontWeight:900, color:'#ff5000', letterSpacing:-0.5, animation:'flicker 9s infinite', textShadow:'0 0 14px rgba(255,80,0,0.3)' }}>HABITSTACK</span>
          </div>
          <NavLink to="/app/profile" style={{ textDecoration:'none' }}>
            <div style={{ width:34, height:34, borderRadius:8, background:'#141414', border:`1px solid ${loc.pathname==='/app/profile'?'#ff5000':'#222'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, transition:'border-color .2s' }}>
              {profile?.avatar_emoji || '◈'}
            </div>
          </NavLink>
        </div>
      </header>
      <main style={{ flex:1, maxWidth:520, margin:'0 auto', width:'100%', padding:'16px 14px 96px', position:'relative', zIndex:2 }}>
        <Outlet />
      </main>
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'rgba(8,8,8,0.99)', backdropFilter:'blur(24px)', borderTop:'1px solid #1a1a1a', paddingBottom:'max(14px, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth:520, margin:'0 auto', display:'flex', padding:'7px 4px 0' }}>
          {NAV.map(n => {
            const active = n.to === '/app' ? loc.pathname === '/app' : loc.pathname.startsWith(n.to)
            return (
              <NavLink key={n.to} to={n.to} style={{ flex:1, textDecoration:'none' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'5px 2px', borderTop: active ? '2px solid #ff5000' : '2px solid transparent', transition:'all .15s' }}>
                  <span className="bc" style={{ fontSize:16, fontWeight:900, color: active ? '#ff5000' : '#2a2a2a', lineHeight:1, transition:'color .15s' }}>{n.sym}</span>
                  <span className="bc" style={{ fontSize:8, fontWeight:800, letterSpacing:1.5, color: active ? '#ff5000' : '#2e2e2e', transition:'color .15s' }}>{n.label}</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
