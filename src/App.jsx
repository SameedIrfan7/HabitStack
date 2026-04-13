import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import StatsPage from './pages/StatsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import PersonalPage from './pages/PersonalPage'
import ProfilePage from './pages/ProfilePage'
import FirePage from './pages/FirePage'
import CalendarPage from './pages/CalendarPage'
import PricingPage from './pages/PricingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a0a', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:52, filter:'drop-shadow(0 0 20px rgba(255,80,0,0.6))' }}>⚡</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:'#ff5000', letterSpacing:6, fontSize:13 }}>LOADING</div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/app" element={<Guard><Layout /></Guard>}>
            <Route index element={<TodayPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
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
