import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FloatingChat from './FloatingChat'

const NAV = [
  { to: '/app',             icon: '⚡', label: 'TODAY'   },
  { to: '/app/calendar',    icon: '📅', label: 'HISTORY' },
  { to: '/app/stats',       icon: '📊', label: 'STATS'   },
  { to: '/app/leaderboard', icon: '🏆', label: 'CREW'    },
  { to: '/app/fire',        icon: '🔥', label: 'FIRE'    },
]

export default function Layout() {
  const { profile } = useAuth()
  const loc = useLocation()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="diagonal-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', left: 0, right: 0, height: 2, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(90deg,transparent,rgba(255,80,0,0.3),transparent)', animation: 'scanline 8s linear infinite' }} />

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <span className="bc" style={{ fontSize: 20, fontWeight: 900, color: '#ff5000', letterSpacing: -0.5, animation: 'flicker 9s infinite', textShadow: '0 0 14px rgba(255,80,0,0.3)' }}>HABITSTACK</span>
          </div>
          <NavLink to="/app/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#141414', border: `1px solid ${loc.pathname === '/app/profile' ? '#ff5000' : '#222'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'border-color .2s' }}>
              {profile?.avatar_emoji || '💪'}
            </div>
          </NavLink>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '16px 14px 110px', position: 'relative', zIndex: 2 }}>
        <Outlet />
      </main>

      {/* Glassmorphism bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'min(360px, calc(100vw - 32px))',
        background: 'rgba(12,12,12,0.75)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,80,0,0.15)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', padding: '8px 6px' }}>
          {NAV.map(n => {
            const active = n.to === '/app' ? loc.pathname === '/app' : loc.pathname.startsWith(n.to)
            return (
              <NavLink key={n.to} to={n.to} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px',
                  borderRadius: 14,
                  background: active ? 'rgba(255,80,0,0.15)' : 'transparent',
                  transition: 'all .15s',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1, filter: active ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'filter .15s' }}>{n.icon}</span>
                  <span className="bc" style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1.5, color: active ? '#ff5000' : '#333', transition: 'color .15s' }}>{n.label}</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <FloatingChat />
    </div>
  )
}