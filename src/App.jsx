import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import StatsPage from './pages/StatsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import PersonalPage from './pages/PersonalPage'
import ProfilePage from './pages/ProfilePage'
import FirePage from './pages/FirePage'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:48, animation:'flicker 2s infinite' }}>⚡</div>
      <div className="bc" style={{ color:'#ff5000', letterSpacing:6, fontSize:13 }}>LOADING</div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<TodayPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="personal" element={<PersonalPage />} />
            <Route path="fire" element={<FirePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
