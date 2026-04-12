import { useState } from 'react'
import { ICON_OPTIONS, COLOR_OPTIONS, CATEGORY_OPTIONS, MUSLIM_HABITS } from '../data/constants'

export default function AddHabitModal({ type, onClose, onAdd, profile }) {
  const [form, setForm] = useState({ label: '', icon: '🎯', color: '#ff5000', category: 'Strength', is_muslim_habit: false })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('custom') // custom | muslim (only for common + muslim user)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const showMuslimTab = type === 'common' && profile?.is_muslim

  async function handleAdd() {
    if (!form.label.trim()) { setErr('Give your habit a name'); return }
    setLoading(true)
    const { error } = await onAdd(form)
    setLoading(false)
    if (error) setErr(error.message)
    else onClose()
  }

  async function addMuslimHabit(h) {
    setLoading(true)
    const { error } = await onAdd(h)
    setLoading(false)
    if (!error) onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
      zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 12px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="slide-up" style={{
        background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 20,
        padding: 22, width: '100%', maxWidth: 480, maxHeight: '88dvh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div className="bc" style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>
              {type === 'personal' ? '🔒 PERSONAL HABIT' : '⚡ NEW MISSION'}
            </div>
            {type === 'personal' && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Private — never on leaderboard</div>}
          </div>
          <button onClick={onClose} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>

        {/* Muslim tab switcher */}
        {showMuslimTab && (
          <div style={{ display: 'flex', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 10, padding: 4, marginBottom: 18, gap: 4 }}>
            {['custom', 'muslim'].map(t => (
              <button key={t} onClick={() => setTab(t)} className="bc" style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 800, letterSpacing: 1,
                background: tab === t ? '#ff5000' : 'transparent',
                color: tab === t ? '#0a0a0a' : '#555', transition: 'all .2s',
              }}>{t === 'muslim' ? '🕌 NAMAZ / QURAN' : 'CUSTOM'}</button>
            ))}
          </div>
        )}

        {/* Muslim quick-add */}
        {tab === 'muslim' && showMuslimTab ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4, lineHeight: 1.6 }}>Tap to add Islamic habits to your daily missions:</div>
            {MUSLIM_HABITS.map(h => (
              <button key={h.label} onClick={() => addMuslimHabit(h)} style={{
                background: '#141414', border: '1px solid #1e1e1e', borderLeft: `4px solid ${h.color}`,
                borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', width: '100%', transition: 'all .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ff5000'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
              >
                <span style={{ fontSize: 24 }}>{h.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div className="bc" style={{ fontSize: 16, fontWeight: 800 }}>{h.label}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{h.category}</div>
                </div>
                <span style={{ color: '#ff5000', fontSize: 18 }}>+</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Preview */}
            <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderLeft: `4px solid ${form.color}`, borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${form.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{form.icon}</div>
              <div>
                <div className="bc" style={{ fontSize: 16, fontWeight: 800 }}>{form.label || 'Habit name...'}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{form.category}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6, fontWeight: 700 }}>HABIT NAME *</label>
                <input value={form.label} onChange={e => set('label', e.target.value)}
                  placeholder="e.g. RUN 3KM, NO PHONE, COLD SHOWER..."
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = '#ff5000'}
                  onBlur={e => e.target.style.borderColor = '#1e1e1e'}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 8, fontWeight: 700 }}>ICON</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 130, overflowY: 'auto', paddingRight: 4 }}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => set('icon', ic)} style={{
                      width: 38, height: 38, fontSize: 20,
                      border: `2px solid ${form.icon === ic ? '#ff5000' : '#1e1e1e'}`,
                      borderRadius: 8, background: form.icon === ic ? 'rgba(255,80,0,0.1)' : '#141414',
                      cursor: 'pointer', transition: 'all .15s',
                    }}>{ic}</button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 8, fontWeight: 700 }}>COLOR</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => set('color', c)} style={{
                      width: 30, height: 30, borderRadius: 8, background: c, cursor: 'pointer',
                      border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                      transform: form.color === c ? 'scale(1.25)' : 'scale(1)', transition: 'all .15s',
                      boxShadow: form.color === c ? `0 0 12px ${c}` : 'none',
                    }} />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 8, fontWeight: 700 }}>CATEGORY</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORY_OPTIONS.map(cat => (
                    <button key={cat} onClick={() => set('category', cat)} className="bc" style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: `1px solid ${form.category === cat ? '#ff5000' : '#1e1e1e'}`,
                      background: form.category === cat ? 'rgba(255,80,0,0.1)' : '#141414',
                      color: form.category === cat ? '#ff5000' : '#555',
                      fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                    }}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>

            {err && <div style={{ marginTop: 14, fontSize: 12, color: '#ef4444', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{err}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={handleAdd} disabled={loading} className="bc" style={{
                flex: 1, padding: '13px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 900,
                letterSpacing: 1, background: loading ? '#1e1e1e' : '#ff5000', color: loading ? '#555' : '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 0 18px rgba(255,80,0,0.3)',
              }}>{loading ? <div className="spinner" /> : '+ ADD HABIT'}</button>
              <button onClick={onClose} style={{ padding: '13px 18px', borderRadius: 12, border: '1px solid #2a2a2a', background: 'transparent', color: '#666', fontSize: 14 }}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
