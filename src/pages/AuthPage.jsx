import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AVATAR_OPTIONS } from '../data/constants'

export default function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email:'', password:'', username:'', displayName:'', avatarEmoji:'💪', isMuslim:false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  async function submit() {
    setErr(''); setBusy(true)
    if (mode==='signin') {
      const {error:e} = await signIn({email:form.email,password:form.password})
      if (e) setErr(e.message)
    } else {
      if (!form.displayName||!form.username) {setErr('Fill all fields');setBusy(false);return}
      const {error:e} = await signUp({email:form.email,password:form.password,username:form.username.toLowerCase().replace(/\s/g,''),displayName:form.displayName,avatarEmoji:form.avatarEmoji,isMuslim:form.isMuslim})
      if (e) setErr(e.message)
      else setDone(true)
    }
    setBusy(false)
  }

  if (done) return (
    <div style={{minHeight:'100dvh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="pop-in" style={{textAlign:'center'}}>
        <div style={{fontSize:60,marginBottom:16}}>📧</div>
        <div className="bc" style={{fontSize:28,fontWeight:900,color:'#ff5000',marginBottom:8}}>CHECK YOUR EMAIL</div>
        <div style={{fontSize:14,color:'#888',lineHeight:1.6,maxWidth:280,margin:'0 auto'}}>Confirm your account then come back and sign in. Time to get to work.</div>
        <button onClick={()=>{setDone(false);setMode('signin')}} style={{marginTop:24,background:'#ff5000',border:'none',color:'#0a0a0a',padding:'12px 28px',borderRadius:10,fontSize:14,fontWeight:700,letterSpacing:1}}>SIGN IN →</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100dvh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'}}>
      <div className="diagonal-bg" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,80,0,0.06) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:0}}/>

      <div className="rise" style={{width:'100%',maxWidth:400,position:'relative',zIndex:2}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:44,marginBottom:8,filter:'drop-shadow(0 0 20px rgba(255,80,0,0.5))'}}>⚡</div>
          <div className="bc" style={{fontSize:36,fontWeight:900,color:'#ff5000',letterSpacing:-1,animation:'flicker 8s infinite',textShadow:'0 0 30px rgba(255,80,0,0.4)'}}>HABITSTACK</div>
          <div className="bc" style={{fontSize:12,letterSpacing:5,color:'#444',marginTop:4}}>NO DAYS OFF</div>
        </div>

        <div style={{background:'#0f0f0f',border:'1px solid #1e1e1e',borderRadius:18,padding:24}}>
          {/* Mode toggle */}
          <div style={{display:'flex',background:'#141414',borderRadius:10,padding:4,marginBottom:22,border:'1px solid #1e1e1e'}}>
            {['signin','signup'].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setStep(1);setErr('')}} style={{
                flex:1,padding:'9px 0',borderRadius:8,border:'none',fontSize:13,fontWeight:800,
                letterSpacing:2,background:mode===m?'#ff5000':'transparent',
                color:mode===m?'#0a0a0a':'#555',transition:'all .2s',
              }} className="bc">{m==='signin'?'SIGN IN':'SIGN UP'}</button>
            ))}
          </div>

          {mode==='signin' ? (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <Field label="EMAIL" type="email" value={form.email} onChange={v=>set('email',v)} placeholder="you@example.com"/>
              <Field label="PASSWORD" type="password" value={form.password} onChange={v=>set('password',v)} placeholder="••••••••"/>
            </div>
          ) : step===1 ? (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <div className="bc" style={{fontSize:11,letterSpacing:3,color:'#666',marginBottom:10}}>PICK YOUR AVATAR</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {AVATAR_OPTIONS.map(a=>(
                    <button key={a} onClick={()=>set('avatarEmoji',a)} style={{
                      width:42,height:42,fontSize:22,border:`2px solid ${form.avatarEmoji===a?'#ff5000':'#1e1e1e'}`,
                      borderRadius:10,background:form.avatarEmoji===a?'rgba(255,80,0,0.1)':'#141414',
                      transition:'all .15s',boxShadow:form.avatarEmoji===a?'0 0 12px rgba(255,80,0,0.3)':'none',
                    }}>{a}</button>
                  ))}
                </div>
              </div>
              <Field label="DISPLAY NAME" value={form.displayName} onChange={v=>set('displayName',v)} placeholder="Sameed"/>
              <Field label="USERNAME" value={form.username} onChange={v=>set('username',v)} placeholder="sameed7" hint="Shown on leaderboard"/>
              {/* Muslim toggle */}
              <div style={{background:'#141414',border:'1px solid #1e1e1e',borderRadius:12,padding:14,display:'flex',alignItems:'center',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>🕌 Muslim User</div>
                  <div style={{fontSize:12,color:'#666'}}>Adds optional Namaz & Quran tracking</div>
                </div>
                <div onClick={()=>set('isMuslim',!form.isMuslim)} style={{
                  width:48,height:26,borderRadius:13,background:form.isMuslim?'#ff5000':'#2a2a2a',
                  position:'relative',cursor:'pointer',transition:'all .25s',border:`1px solid ${form.isMuslim?'#ff5000':'#3a3a3a'}`,
                }}>
                  <div style={{position:'absolute',width:20,height:20,borderRadius:'50%',background:'#fff',top:2,left:form.isMuslim?25:3,transition:'left .25s',boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}}/>
                </div>
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{background:'rgba(255,80,0,0.06)',border:'1px solid rgba(255,80,0,0.2)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                <span style={{fontSize:28}}>{form.avatarEmoji}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{form.displayName}</div>
                  <div style={{fontSize:12,color:'#888'}}>@{form.username}{form.isMuslim?' · 🕌':''}</div>
                </div>
              </div>
              <Field label="EMAIL" type="email" value={form.email} onChange={v=>set('email',v)} placeholder="you@example.com"/>
              <Field label="PASSWORD" type="password" value={form.password} onChange={v=>set('password',v)} placeholder="Min 6 characters"/>
            </div>
          )}

          {err && <div style={{marginTop:12,padding:'10px 14px',borderRadius:8,fontSize:13,background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.2)'}}>{err}</div>}

          <div style={{marginTop:18,display:'flex',flexDirection:'column',gap:10}}>
            {mode==='signup'&&step===1 ? (
              <Btn onClick={()=>{if(!form.displayName||!form.username)setErr('Fill all fields');else{setErr('');setStep(2)}}}>CONTINUE →</Btn>
            ) : (
              <Btn onClick={submit} loading={busy}>{mode==='signin'?'ENTER THE GYM':'CREATE ACCOUNT'}</Btn>
            )}
            {mode==='signup'&&step===2&&<button onClick={()=>setStep(1)} style={{background:'transparent',border:'none',color:'#555',fontSize:13,padding:'6px 0'}}>← Back</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({label,type='text',value,onChange,placeholder,hint}) {
  return (
    <div>
      <label className="bc" style={{display:'block',fontSize:10,letterSpacing:3,color:'#666',marginBottom:6,fontWeight:700}}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',padding:'11px 14px',borderRadius:10,fontSize:14,background:'#141414',border:'1px solid #1e1e1e',color:'#f5f5f5',outline:'none',transition:'border-color .2s'}}
        onFocus={e=>e.target.style.borderColor='#ff5000'}
        onBlur={e=>e.target.style.borderColor='#1e1e1e'}
      />
      {hint&&<div style={{fontSize:11,color:'#444',marginTop:4}}>{hint}</div>}
    </div>
  )
}

function Btn({children,onClick,loading}) {
  return (
    <button onClick={onClick} disabled={loading} className="bc" style={{
      width:'100%',padding:'13px',borderRadius:12,border:'none',fontSize:15,fontWeight:900,letterSpacing:2,
      background:loading?'#1e1e1e':'#ff5000',color:loading?'#555':'#0a0a0a',
      display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',
      boxShadow:loading?'none':'0 0 20px rgba(255,80,0,0.3)',
    }}>
      {loading?<div className="spinner"/>:children}
    </button>
  )
}
