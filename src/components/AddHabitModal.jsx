import { useState } from 'react'
import { ICON_OPTIONS, COLOR_OPTIONS, CATEGORY_OPTIONS, MUSLIM_HABITS } from '../data/constants'

export default function AddHabitModal({ type, onClose, onAdd, profile }) {
  const [form, setForm] = useState({ label: '', icon: '◈', color: '#ff5000', category: 'Strength', is_muslim_habit: false })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('custom')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const showMuslimTab = type === 'common' && profile?.is_muslim

  async function handleAdd() {
    if (!form.label.trim()) { setErr('Give your habit a name'); return }
    setErr(''); setLoading(true)
    const { error } = await onAdd({ ...form, label: form.label.trim().toUpperCase() })
    setLoading(false)
    if (error) setErr(error.message)
    else onClose()
  }

  async function quickAddMuslim(h) {
    setLoading(true)
    await onAdd(h)
    setLoading(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
      zIndex: 1000, display: 'flex', alignItems: 'flex-end', padding: '0 12px 70px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="slide-up" style={{
        background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 20,
        width: '100%', maxWidth: 480, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        height: '80dvh',
      }}>
        {/* Fixed header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="bc" style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>
                {type === 'personal' ? '◆ PERSONAL HABIT' : '◈ NEW MISSION'}
              </div>
              {type === 'personal' && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Private · never on leaderboard</div>}
            </div>
            <button onClick={onClose} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#666', width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>

          {showMuslimTab && (
            <div style={{ display: 'flex', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 8, padding: 3, marginTop: 14, gap: 3 }}>
              {['custom', 'muslim'].map(t => (
                <button key={t} onClick={() => setTab(t)} className="bc" style={{
                  flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 800, letterSpacing: 1,
                  background: tab === t ? '#ff5000' : 'transparent', color: tab === t ? '#0a0a0a' : '#555',
                  transition: 'all .2s', cursor: 'pointer',
                }}>{t === 'muslim' ? '🕌 NAMAZ / QURAN' : 'CUSTOM'}</button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', WebkitOverflowScrolling: 'touch' }}>
          {tab === 'muslim' && showMuslimTab ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 4, lineHeight: 1.6 }}>Tap to add Islamic habits to your daily missions:</div>
              {MUSLIM_HABITS.map(h => (
                <button key={h.label} onClick={() => quickAddMuslim(h)} disabled={loading} style={{
                  background: '#141414', border: '1px solid #1e1e1e', borderLeft: `4px solid ${h.color}`,
                  borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', width: '100%', transition: 'all .15s', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 22 }}>{h.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div className="bc" style={{ fontSize: 15, fontWeight: 800 }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{h.category}</div>
                  </div>
                  <span style={{ color: '#ff5000', fontSize: 18, flexShrink: 0 }}>+</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Preview */}
              <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderLeft: `4px solid ${form.color}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${form.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{form.icon}</div>
                <div>
                  <div className="bc" style={{ fontSize: 15, fontWeight: 800 }}>{form.label.toUpperCase() || 'HABIT NAME...'}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{form.category}</div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 6, fontWeight: 700 }}>HABIT NAME *</label>
                <input value={form.label} onChange={e => set('label', e.target.value)}
                  placeholder="e.g. RUN 3KM, NO PHONE..."
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, background: '#141414', border: '1px solid #1e1e1e', color: '#f5f5f5', outline: 'none', transition: 'border-color .2s', WebkitAppearance: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#ff5000'}
                  onBlur={e => e.target.style.borderColor = '#1e1e1e'}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 8, fontWeight: 700 }}>ICON</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => set('icon', ic)} style={{
                      width: 36, height: 36, fontSize: 18, border: `2px solid ${form.icon === ic ? '#ff5000' : '#1e1e1e'}`,
                      borderRadius: 8, background: form.icon === ic ? 'rgba(255,80,0,0.1)' : '#141414', cursor: 'pointer', transition: 'all .15s',
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
                      width: 30, height: 30, borderRadius: 7, background: c, cursor: 'pointer',
                      border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                      transform: form.color === c ? 'scale(1.2)' : 'scale(1)', transition: 'all .15s',
                      boxShadow: form.color === c ? `0 0 12px ${c}` : 'none',
                    }} />
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="bc" style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: '#555', marginBottom: 8, fontWeight: 700 }}>CATEGORY</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {CATEGORY_OPTIONS.map(cat => (
                    <button key={cat} onClick={() => set('category', cat)} className="bc" style={{
                      padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${form.category === cat ? '#ff5000' : '#1e1e1e'}`,
                      background: form.category === cat ? 'rgba(255,80,0,0.1)' : '#141414',
                      color: form.category === cat ? '#ff5000' : '#555',
                      fontSize: 11, fontWeight: 700, letterSpacing: 1,
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              {err && <div style={{ padding: '10px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}
            </div>
          )}
        </div>

        {/* Fixed footer - ALWAYS VISIBLE */}
        {tab !== 'muslim' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #1a1a1a', flexShrink: 0, display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} disabled={loading} className="bc" style={{
              flex: 1, padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 900,
              letterSpacing: 1, background: loading ? '#1e1e1e' : '#ff5000', color: loading ? '#555' : '#0a0a0a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 18px rgba(255,80,0,0.3)',
            }}>
              {loading ? <><div className="spinner" /><span>SAVING...</span></> : '+ ADD HABIT'}
            </button>
            <button onClick={onClose} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #2a2a2a', background: 'transparent', color: '#555', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}