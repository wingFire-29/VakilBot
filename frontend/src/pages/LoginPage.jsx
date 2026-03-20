import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const API = `${import.meta.env.VITE_API_URL || ''}/api`

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.access, data.user)
        navigate('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('Connection error. Is the server running?')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="orb orb--primary" style={{ width: 500, height: 500, top: -150, right: -100 }} />
      <div className="orb orb--secondary" style={{ width: 400, height: 400, bottom: -100, left: -100 }} />

      <Link to="/" className="auth-logo">⚖️ Vakil<span className="gradient-text">Bot</span></Link>

      <div className="auth-card card">
        <div className="auth-card__header">
          <span className="auth-card__emoji">🔐</span>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to your VakilBot dashboard</p>
        </div>

        {error && <div className="notif notif--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input id="login-username" className="form-input" type="text" placeholder="yourfirm" required
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" className="form-input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button id="login-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : '→ Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Register your firm →</Link>
        </p>
      </div>

      <div className="auth-trust">
        <div className="auth-trust-item">🔒 Secure JWT Auth</div>
        <div className="auth-trust-item">🛡️ Data Encrypted</div>
        <div className="auth-trust-item">🇮🇳 Made in India</div>
      </div>
    </div>
  )
}
