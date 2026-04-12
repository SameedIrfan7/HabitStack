import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/',            icon: '⚡', label: 'TODAY'  },
  { to: '/stats',       icon: '📊', label: 'STATS'  },
  { to: '/leaderboard', icon: '🏆', label: 'CREW'   },
  { to: '/personal',    icon: '🔒', label: 'MINE'   },
  { to: '/fire',        icon: '🔥', label: 'FIRE'   },
]

export default function Layout() {
  const { profile } = useAuth()
  const loc = useLocation()

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', position:'relative' }}>
      {/* Diagonal bg */}
      <div className="diagonal-bg" style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>

      {/* Scanline sweep */}
      <div style={{
        position:'fixed', left:0, right:0, height:3, zIndex:1, pointerEvents:'none',
        background:'linear-gradient(90deg,transparent,rgba(255,80,0,0.25),transparent)',
        animation:'scanline 8s linear infinite',
      }}/>

      {/* Top Header */}
      <header style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(10,10,10,0.96)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid #1a1a1a',
      }}>
        <div style={{ maxWidth:500, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:22 }}>⚡</span>
            <span className="bc" style={{
              fontSize:22, fontWeight:900, color:'#ff5000', letterSpacing:-0.5,
              animation:'flicker 9s infinite',
              textShadow:'0 0 20px rgba(255,80,0,0.4)',
            }}>HABITSTACK</span>
          </div>
          <NavLink to="/profile" style={{ textDecoration:'none' }}>
            <div style={{
              width:36, height:36, borderRadius:8, background:'#141414',
              border:`1px solid ${loc.pathname==='/profile'?'#ff5000':'#2a2a2a'}`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
              transition:'border-color .2s',
            }}>{profile?.avatar_emoji || '💪'}</div>
          </NavLink>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex:1, maxWidth:500, margin:'0 auto', width:'100%', padding:'16px 14px 100px', position:'relative', zIndex:2 }}>
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'rgba(10,10,10,0.97)', backdropFilter:'blur(24px)',
        borderTop:'1px solid #1a1a1a',
        paddingBottom:'max(16px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth:500, margin:'0 auto', display:'flex', padding:'8px 8px 0' }}>
          {NAV.map(n => {
            const active = n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to)
            return (
              <NavLink key={n.to} to={n.to} style={{ flex:1, textDecoration:'none' }}>
                <div style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                  padding:'6px 4px', borderRadius:10, transition:'all .15s',
                  borderTop: active ? '2px solid #ff5000' : '2px solid transparent',
                  background: active ? 'rgba(255,80,0,0.06)' : 'transparent',
                }}>
                  <span style={{ fontSize:20, filter: active?'none':'grayscale(.5) opacity(.6)' }}>{n.icon}</span>
                  <span className="bc" style={{
                    fontSize:9, fontWeight:800, letterSpacing:1.5,
                    color: active ? '#ff5000' : '#444',
                  }}>{n.label}</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
