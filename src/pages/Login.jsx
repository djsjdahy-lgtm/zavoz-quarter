import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('in')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const fn = mode === 'in' ? signIn : signUp
    const { error } = await fn(username.trim(), password)
    setBusy(false)
    if (error) { setError(error.message); return }
    nav('/')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-tabs">
        <div
          className={`auth-indicator ${mode === 'up' ? 'right' : ''}`}
          style={{ left: 4 }}
        />
        <div
          className={`auth-tab ${mode === 'in' ? 'active' : ''}`}
          onClick={() => { setMode('in'); setError('') }}
        >
          Вход
        </div>
        <div
          className={`auth-tab ${mode === 'up' ? 'active' : ''}`}
          onClick={() => { setMode('up'); setError('') }}
        >
          Регистрация
        </div>
      </div>

      <div className="card">
        <form onSubmit={submit}>
          <input
            placeholder="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? '...' : mode === 'in' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}