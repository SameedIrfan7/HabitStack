import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'
import { AVATAR_OPTIONS } from '../data/constants'

export default function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth()
  const { commonHabits, personalHabits, deleteCommonHabit, deletePersonalHabit } = useHabits()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ display_name: profile?.display_name || '', bio: profile?.bio || '', avatar_emoji: profile?.avatar_emoji || '💪', is_muslim: profile?.is_muslim || false })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const { error } = await updateProfile(form)
    setSaving(false)
    if (!error) { setMsg('SAVED ✓'); setEditing(false); setTimeout(() => setMsg(''), 2000) }
  }

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1, color: '#ff5000', marginBottom: 2 }}>PROFILE</div>
      <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#444', marginBottom: 16 }}>YOUR IDENTITY</div>

      {/* Profile card */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 10 }}>PICK AVATAR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AVATAR_OPTIONS.map(a => (
                  <button key={a} onClick={() => set('avatar_emoji', a)} style={{
                    width: 42, height: 42, fontSize: 22,
                    border: `2px solid ${form.avatar_emoji === a ? '#ff5000' : '#1e1e1e'}`,
                    borderRadius: 10, background: form.avatar_emoji === a ? 'rgba(255,80,0,0.1)' : '#141414',
                    transition: 'all .15s', cursor: 'pointer',
                    boxShadow: form.avatar_emoji === a ? '0 0 12px rgba(255,80,0,0.3)' : 'none',
                  }}>{a}</button>
                ))}
              </div>
            </div>

            <Field label="DISPLAY NAME" value={form.display_name} onChange={v => set('display_name', v)} />
            <Field label="BIO" value={form.bio} onChange={v => set('bio', v)} placeholder="e.g. Grind never stops 💪" />

            {/* Muslim toggle */}
            <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>🕌 Muslim Mode</div>
                <div style={{ fontSize: 12, color: '#555' }}>Namaz & Quran habits in Today</div>
              </div>
              <div onClick={() => set('is_muslim', !form.is_muslim)} style={{
                width: 48, height: 26, borderRadius: 13,
                background: form.is_muslim ? '#ff5000' : '#2a2a2a',
                position: 'relative', cursor: 'pointer', transition: 'all .25s',
                border: `1px solid ${form.is_muslim ? '#ff5000' : '#3a3a3a'}`,
              }}>
                <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 2, left: form.is_muslim ? 25 : 3, transition: 'left .25s' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} disabled={saving} className="bc" style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 900,
                letterSpacing: 1, background: saving ? '#1e1e1e' : '#ff5000', color: saving ? '#555' : '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>{saving ? <div className="spinner" /> : 'SAVE CHANGES'}</button>
              <button onClick={() => setEditing(false)} style={{
                padding: '12px 18px', borderRadius: 10, border: '1px solid #2a2a2a',
                background: 'transparent', color: '#666', fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 14, background: '#141414',
              border: '2px solid #ff5000', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 36,
              boxShadow: '0 0 20px rgba(255,80,0,0.25)',
            }}>{profile?.avatar_emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="bc" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.5 }}>{profile?.display_name}</div>
              <div style={{ fontSize: 13, color: '#555' }}>@{profile?.username}{profile?.is_muslim ? ' · 🕌' : ''}</div>
              {profile?.bio && <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{profile.bio}</div>}
              {msg && <div className="bc" style={{ fontSize: 12, color: '#22c55e', marginTop: 4, letterSpacing: 1 }}>{msg}</div>}
            </div>
            <button onClick={() => setEditing(true)} className="bc" style={{
              background: '#141414', border: '1px solid #2a2a2a', color: '#888',
              padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, letterSpacing: 1,
            }}>EDIT</button>
          </div>
        )}
      </div>

      {/* Privacy info */}
      <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🔒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', marginBottom: 2 }}>Your Privacy</div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Individual habit logs are <strong style={{ color: '#f5f5f5' }}>fully private</strong>. Only your daily % score appears on the leaderboard. Nobody sees which habits you did or skipped.</div>
        </div>
      </div>

      {/* Habit counts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard label="COMMON HABITS" value={commonHabits.length} icon="⚡" color="#ff5000" />
        <StatCard label="PERSONAL HABITS" value={personalHabits.length} icon="🔒" color="#22c55e" />
      </div>

      {/* Common habits list */}
      {commonHabits.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 10 }}>COMMON HABITS (ON LEADERBOARD)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {commonHabits.map(h => (
              <HabitRow key={h.id} habit={h} onDelete={() => { if (confirm(`Remove "${h.label}"?`)) deleteCommonHabit(h.id) }} />
            ))}
          </div>
        </div>
      )}

      {/* Personal habits list */}
      {personalHabits.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="bc" style={{ fontSize: 11, letterSpacing: 3, color: '#555', marginBottom: 10 }}>PERSONAL HABITS (PRIVATE)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {personalHabits.map(h => (
              <HabitRow key={h.id} habit={h} onDelete={() => { if (confirm(`Remove "${h.label}"?`)) deletePersonalHabit(h.id) }} />
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button onClick={signOut} className="bc" style={{
        width: '100%', padding: '13px', borderRadius: 12,
        border: '1px solid #2a2a2a', background: 'transparent', color: '#555',
        fontSize: 14, fontWeight: 700, letterSpacing: 2, marginTop: 8,
      }}>SIGN OUT</button>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6, fontWeight: 700 }}>{label}</label>
      <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s' }}
        onFocus={e => e.target.style.borderColor = '#ff5000'}
        onBlur={e => e.target.style.borderColor = '#1e1e1e'}
      />
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderTop: `3px solid ${color}`, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div className="bc" style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div className="bc" style={{ fontSize: 9, letterSpacing: 2, color: '#444', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function HabitRow({ habit, onDelete }) {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{habit.icon}</div>
      <div style={{ flex: 1 }}>
        <div className="bc" style={{ fontSize: 14, fontWeight: 700 }}>{habit.label}</div>
        <div style={{ fontSize: 11, color: '#444' }}>{habit.category}{habit.is_muslim_habit ? ' · 🕌' : ''}</div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: '#333', fontSize: 20, padding: '0 4px', cursor: 'pointer', transition: 'color .15s' }}
        onMouseEnter={e => e.target.style.color = '#ef4444'}
        onMouseLeave={e => e.target.style.color = '#333'}>×</button>
    </div>
  )
}
