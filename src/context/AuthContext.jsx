import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, usernameToEmail } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(username, password) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return { error: { message: 'Логин: 3-20 символов, латиница, цифры, _' } }
    }
    if (password.length < 6) {
      return { error: { message: 'Пароль минимум 6 символов' } }
    }

    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: { data: { username } },
    })
    if (error) return { error }

    // После signUp сессия может быть не активна — логинимся вручную
    if (!data.session) {
      const { error: e2 } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      })
      if (e2) return { error: e2 }
    }
    return { error: null }
  }

  async function signIn(username, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)