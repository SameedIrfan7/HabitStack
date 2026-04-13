import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext({})

const SITE_URL = 'https://habit-stack-tau.vercel.app'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfile(data); setLoading(false)
  }

  async function signUp({ email, password, username, displayName, avatarEmoji, isMuslim }) {
    return supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${SITE_URL}/auth`,
        data: { username, display_name: displayName, avatar_emoji: avatarEmoji }
      }
    }).then(async res => {
      if (!res.error && res.data.user) {
        await supabase.from('profiles').update({ is_muslim: isMuslim }).eq('id', res.data.user.id)
      }
      return res
    })
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() { await supabase.auth.signOut() }

  async function updateProfile(updates) {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, refetchProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)