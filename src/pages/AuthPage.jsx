import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AVATAR_OPTIONS } from '../data/constants'

export default function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '', avatarEmoji: '💪', isMuslim: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

 if (!loading && user) return <Navigate to="/app" replace />

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function submit() {
    setErr(''); setBusy(true)
    try {
      if (mode === 'signin') {
        if (!form.email || !form.password) { setErr('Enter email and password'); setBusy(false); return }
        const { error: e } = await signIn({ email: form.email, password: form.password })
        if (e) setErr(e.message === 'Invalid login credentials' ? 'Wrong email or password' : e.message)
      } else {
        if (!form.email || !form.password) { setErr('Enter email and password'); setBusy(false); return }
        if (form.password.length < 6) { setErr('Password needs 6+ characters'); setBusy(false); return }
        const { error: e } = await signUp({
          email: form.email, password: form.password,
          username: form.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          displayName: form.displayName, avatarEmoji: form.avatarEmoji, isMuslim: form.isMuslim,
        })
        if (e) setErr(e.message); else setDone(true)
      }
    } catch { setErr('Something went wrong. Try again.') }
    setBusy(false)
  }

  if (done) return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 14 }}>📧</div>
        <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: '#ff5000', marginBottom: 10 }}>CHECK YOUR EMAIL</div>
        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 28px' }}>
          Confirmation sent to <strong style={{ color: '#f5f5f5' }}>{form.email}</strong>. Click the link then come back and sign in.
        </div>
        <button onClick={() => { setDone(false); setMode('signin') }} className="bc" style={{ background: '#ff5000', border: 'none', color: '#0a0a0a', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 900, letterSpacing: 1, cursor: 'pointer' }}>SIGN IN →</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,80,0,.02) 0,rgba(255,80,0,.02) 1px,transparent 0,transparent 50%)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,80,0,0.06),transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        <button onClick={() => nav('/')} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: 13, cursor: 'pointer', marginBottom: 18, padding: 0 }}>← Back to home</button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 38, marginBottom: 6 }}>⚡</div>
          <div className="bc" style={{ fontSize: 30, fontWeight: 900, color: '#ff5000', letterSpacing: -1 }}>HABITSTACK</div>
          <div className="bc" style={{ fontSize: 10, letterSpacing: 5, color: '#333', marginTop: 3 }}>NO DAYS OFF</div>
        </div>

        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 20, padding: 22 }}>
          <div style={{ display: 'flex', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setErr('') }} className="bc" style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 900, letterSpacing: 2,
                background: mode === m ? '#ff5000' : 'transparent', color: mode === m ? '#0a0a0a' : '#444',
                transition: 'all .2s', cursor: 'pointer',
              }}>{m === 'signin' ? 'SIGN IN' : 'SIGN UP'}</button>
            ))}
          </div>

          {mode === 'signin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="EMAIL" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@example.com" onKey={e => e.key === 'Enter' && submit()} />
              <Field label="PASSWORD" type="password" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" onKey={e => e.key === 'Enter' && submit()} />
            </div>
          )}

          {mode === 'signup' && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 9 }}>PICK AVATAR</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {AVATAR_OPTIONS.map(a => (
                    <button key={a} onClick={() => set('avatarEmoji', a)} style={{
                      width: 40, height: 40, fontSize: 20, cursor: 'pointer',
                      border: `2px solid ${form.avatarEmoji === a ? '#ff5000' : '#1e1e1e'}`,
                      borderRadius: 9, background: form.avatarEmoji === a ? 'rgba(255,80,0,0.1)' : '#141414',
                      transition: 'all .15s',
                    }}>{a}</button>
                  ))}
                </div>
              </div>
              <Field label="YOUR NAME" value={form.displayName} onChange={v => set('displayName', v)} placeholder="Sameed" />
              <Field label="USERNAME" value={form.username} onChange={v => set('username', v)} placeholder="sameed7" hint="Shown on leaderboard" />
              <div onClick={() => set('isMuslim', !form.isMuslim)} style={{ background: '#141414', border: `1px solid ${form.isMuslim ? 'rgba(255,80,0,0.3)' : '#1e1e1e'}`, borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color .2s' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>🕌 Muslim User (Optional)</div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Adds Namaz × 5 + Quran tracking</div>
                </div>
                <div style={{ width: 46, height: 25, borderRadius: 13, background: form.isMuslim ? '#ff5000' : '#2a2a2a', position: 'relative', transition: 'background .25s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', width: 19, height: 19, borderRadius: '50%', background: '#fff', top: 3, left: form.isMuslim ? 24 : 3, transition: 'left .25s' }} />
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255,80,0,0.06)', border: '1px solid rgba(255,80,0,0.2)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>{form.avatarEmoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{form.displayName}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>@{form.username}{form.isMuslim ? ' · 🕌' : ''}</div>
                </div>
              </div>
              <Field label="EMAIL" type="email" value={form.email} onChange={v => set('email', v)} placeholder="you@example.com" />
              <Field label="PASSWORD" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Min 6 characters" onKey={e => e.key === 'Enter' && submit()} />
            </div>
          )}

          {err && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, fontSize: 13, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mode === 'signup' && step === 1 ? (
              <Btn onClick={() => { if (!form.displayName.trim() || !form.username.trim()) { setErr('Fill in name and username'); return } setErr(''); setStep(2) }}>CONTINUE →</Btn>
            ) : (
              <Btn onClick={submit} loading={busy}>{mode === 'signin' ? 'ENTER THE GYM' : 'CREATE ACCOUNT'}</Btn>
            )}
            {mode === 'signup' && step === 2 && <button onClick={() => { setStep(1); setErr('') }} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 13, padding: '6px 0', cursor: 'pointer' }}>← Back</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, hint, onKey }) {
  return (
    <div>
      <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6, fontWeight: 700 }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} onKeyDown={onKey}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s', WebkitAppearance: 'none' }}
        onFocus={e => e.target.style.borderColor = '#ff5000'}
        onBlur={e => e.target.style.borderColor = '#1e1e1e'}
      />
      {hint && <div style={{ fontSize: 11, color: '#3a3a3a', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

function Btn({ children, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} className="bc" style={{
      width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 900, letterSpacing: 2,
      background: loading ? '#1e1e1e' : '#ff5000', color: loading ? '#555' : '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s',
      boxShadow: loading ? 'none' : '0 0 20px rgba(255,80,0,0.3)',
    }}>
      {loading ? <div className="spinner" /> : children}
    </button>
  )
}
