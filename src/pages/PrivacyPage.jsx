import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const nav = useNavigate()
  const sections = [
    { title: '1. Information We Collect', body: `We collect information you provide directly: your email address, display name, username, and avatar preference when you create an account. We also collect habit completion data (which habits you check as done each day), your daily completion score (a percentage), and basic usage analytics to improve the app.` },
    { title: '2. How We Use Your Information', body: `Your email is used solely for account authentication and critical security communications. Your habit logs are stored securely and are used only to display your personal dashboard and calculate your daily score. Your daily score (a single percentage number) is shared on the leaderboard — your individual habit details are never shared with other users, ever.` },
    { title: '3. Data Sharing & Leaderboard Privacy', body: `The leaderboard displays only: your chosen display name, avatar emoji, username, and daily score percentage. No other users can see which specific habits you tracked, which you completed, or which you missed. This is a core design principle of HabitStack and will never change.` },
    { title: '4. Data Storage & Security', body: `Your data is stored using Supabase, a secure cloud database provider with industry-standard encryption at rest and in transit. We use Row Level Security policies to ensure each user can only access their own habit data. We do not sell your data to any third parties.` },
    { title: '5. Third-Party Services', body: `We use Supabase for database and authentication services. We use Anthropic's Claude API to power the AI Coach feature — when you tap "Coach Claude," your score and habit names (not logs) are sent to generate coaching advice. No personally identifiable information is included in these API calls.` },
    { title: '6. Data Retention & Deletion', body: `You can delete your account at any time from your Profile page. Upon deletion, all your habit logs, scores, and personal information are permanently removed from our systems within 30 days. We do not retain backup copies of deleted user data beyond this period.` },
    { title: '7. Children\'s Privacy', body: `HabitStack is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.` },
    { title: '8. Changes to This Policy', body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notification. Continued use of HabitStack after changes constitutes acceptance of the updated policy.` },
    { title: '9. Contact', body: `For privacy concerns or data requests, contact us at: privacy@habitstack.app. We will respond within 72 hours.` },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#f5f5f5', fontFamily: "'Barlow', sans-serif", padding: '0 20px 60px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@300;400;500&display=swap'); .bc{font-family:'Barlow Condensed',sans-serif;}`}</style>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ padding: '60px 0 32px' }}>
          <button onClick={() => nav('/')} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Back</button>
          <div className="bc" style={{ fontSize: 36, fontWeight: 900, color: '#ff5000', letterSpacing: -1, marginBottom: 6 }}>PRIVACY POLICY</div>
          <div style={{ fontSize: 13, color: '#555' }}>Last updated: April 2026 · HabitStack</div>
        </div>
        <div style={{ background: 'rgba(255,80,0,0.04)', border: '1px solid rgba(255,80,0,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7 }}>
            <strong style={{ color: '#ff5000' }}>TL;DR:</strong> Your habit details are private. We only share your score (a %) on the leaderboard. We don't sell your data. You can delete your account anytime.
          </div>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div className="bc" style={{ fontSize: 16, fontWeight: 900, color: '#f5f5f5', marginBottom: 8, letterSpacing: 0.5 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: '#888', lineHeight: 1.8 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
