import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useHabits } from '../hooks/useHabits'
import { AVATAR_OPTIONS } from '../data/constants'

export default function ProfilePage() {
  const { profile, updateProfile, signOut } = useAuth()
  const { commonHabits, personalHabits, deleteCommonHabit, deletePersonalHabit } = useHabits()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    avatar_emoji: '💪',
    is_muslim: false,
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_emoji: profile.avatar_emoji || '💪',
        is_muslim: profile.is_muslim || false,
      })
    }
  }, [profile])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function save() {
    if (!form.display_name.trim()) { setErr('Name cannot be empty'); return }
    setErr(''); setSaving(true)
    const { error } = await updateProfile({
      display_name: form.display_name.trim(),
      bio: form.bio.trim(),
      avatar_emoji: form.avatar_emoji,
      is_muslim: form.is_muslim,
    })
    setSaving(false)
    if (error) { setErr(error.message) }
    else { setMsg('SAVED ✓'); setEditing(false); setTimeout(() => setMsg(''), 3000) }
  }

  function startEdit() {
    setForm({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      avatar_emoji: profile?.avatar_emoji || '💪',
      is_muslim: profile?.is_muslim || false,
    })
    setErr('')
    setEditing(true)
  }

  return (
    <div className="fade-in">
      <div className="bc" style={{ fontSize: 26, fontWeight: 900, letterSpacing: 1, color: '#ff5000', marginBottom: 2 }}>PROFILE</div>
      <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#444', marginBottom: 16 }}>YOUR IDENTITY</div>

      {/* Profile card */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20, marginBottom: 14 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 10 }}>AVATAR</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {AVATAR_OPTIONS.map(a => (
                  <button key={a} onClick={() => set('avatar_emoji', a)} style={{
                    width: 40, height: 40, fontSize: 20, cursor: 'pointer',
                    border: `2px solid ${form.avatar_emoji === a ? '#ff5000' : '#1e1e1e'}`,
                    borderRadius: 9, background: form.avatar_emoji === a ? 'rgba(255,80,0,0.1)' : '#141414',
                    transition: 'all .15s',
                  }}>{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6 }}>DISPLAY NAME</label>
              <input value={form.display_name} onChange={e => set('display_name', e.target.value)}
                placeholder="Your name"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = '#ff5000'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
            </div>

            <div>
              <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6 }}>BIO</label>
              <input value={form.bio} onChange={e => set('bio', e.target.value)}
                placeholder="Grind never stops 💪"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = '#ff5000'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
            </div>

            <div onClick={() => set('is_muslim', !form.is_muslim)} style={{
              background: '#141414', border: `1px solid ${form.is_muslim ? 'rgba(255,80,0,0.3)' : '#1e1e1e'}`,
              borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>🕌 Muslim Mode</div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Namaz + Quran habits in Today</div>
              </div>
              <div style={{ width: 46, height: 25, borderRadius: 13, background: form.is_muslim ? '#ff5000' : '#2a2a2a', position: 'relative', transition: 'background .25s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: 19, height: 19, borderRadius: '50%', background: '#fff', top: 3, left: form.is_muslim ? 24 : 3, transition: 'left .25s' }} />
              </div>
            </div>

            {err && <div style={{ padding: '10px 14px', borderRadius: 9, fontSize: 13, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} disabled={saving} className="bc" style={{
                flex: 1, padding: '13px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 900,
                letterSpacing: 1, background: saving ? '#1e1e1e' : '#ff5000', color: saving ? '#555' : '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: saving ? 'not-allowed' : 'pointer',
              }}>{saving ? <><div className="spinner" /><span>SAVING...</span></> : 'SAVE CHANGES'}</button>
              <button onClick={() => { setEditing(false); setErr('') }} style={{ padding: '13px 18px', borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#666', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 62, height: 62, borderRadius: 14, background: '#141414', border: '2px solid #ff5000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, boxShadow: '0 0 18px rgba(255,80,0,0.2)', flexShrink: 0 }}>
              {profile?.avatar_emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bc" style={{ fontSize: 20, fontWeight: 900, letterSpacing: 0.5 }}>{profile?.display_name}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>@{profile?.username}{profile?.is_muslim ? ' · 🕌' : ''}</div>
              {profile?.bio && <div style={{ fontSize: 13, color: '#888', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.bio}</div>}
              {msg && <div className="bc" style={{ fontSize: 12, color: '#22c55e', marginTop: 6, letterSpacing: 1 }}>{msg}</div>}
            </div>
            <button onClick={startEdit} className="bc" style={{ background: '#141414', border: '1px solid #2a2a2a', color: '#888', padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', flexShrink: 0 }}>EDIT</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderTop: '3px solid #ff5000', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
          <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: '#ff5000' }}>{commonHabits.length}</div>
          <div className="bc" style={{ fontSize: 9, letterSpacing: 2, color: '#444', marginTop: 2 }}>COMMON HABITS</div>
        </div>
        <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderTop: '3px solid #22c55e', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
          <div className="bc" style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>{personalHabits.length}</div>
          <div className="bc" style={{ fontSize: 9, letterSpacing: 2, color: '#444', marginTop: 2 }}>PRIVATE HABITS</div>
        </div>
      </div>

      {/* Privacy note */}
      <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>◆</span>
        <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
          Your habit logs are <strong style={{ color: '#f5f5f5' }}>fully private</strong>. Only your daily % score appears on the leaderboard. No one sees which habits you did or missed.
        </div>
      </div>

      {/* Habit lists */}
      {commonHabits.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 10 }}>COMMON HABITS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {commonHabits.map(h => <HabitRow key={h.id} habit={h} onDelete={() => { if (window.confirm(`Remove "${h.label}"?`)) deleteCommonHabit(h.id) }} />)}
          </div>
        </div>
      )}

      {personalHabits.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="bc" style={{ fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 10 }}>PERSONAL HABITS (PRIVATE)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {personalHabits.map(h => <HabitRow key={h.id} habit={h} onDelete={() => { if (window.confirm(`Remove "${h.label}"?`)) deletePersonalHabit(h.id) }} />)}
          </div>
        </div>
      )}

      <button onClick={signOut} className="bc" style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid #1e1e1e', background: 'transparent', color: '#444', fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', marginTop: 8 }}>
        SIGN OUT
      </button>
    </div>
  )
}

function HabitRow({ habit, onDelete }) {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderLeft: `3px solid ${habit.color}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{habit.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bc" style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.label}</div>
        <div style={{ fontSize: 11, color: '#444' }}>{habit.category}{habit.is_muslim_habit ? ' · 🕌' : ''}</div>
      </div>
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', color: '#2a2a2a', fontSize: 20, padding: '0 2px', cursor: 'pointer', flexShrink: 0, transition: 'color .15s' }}
        onMouseEnter={e => e.target.style.color = '#ef4444'}
        onMouseLeave={e => e.target.style.color = '#2a2a2a'}>×</button>
    </div>
  )
}
