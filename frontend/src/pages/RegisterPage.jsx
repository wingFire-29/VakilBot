import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

const API = `${import.meta.env.VITE_API_URL || ''}/api`

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', firm_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        login(data.access, data.user)
        navigate('/dashboard')
      } else {
        const msgs = Object.values(data).flat()
        setError(msgs.join(' ') || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Connection error. Is the server running?')
    }
    setLoading(false)
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-page">
      <div className="orb orb--primary" style={{ width: 500, height: 500, top: -150, right: -100 }} />
      <div className="orb orb--secondary" style={{ width: 400, height: 400, bottom: -100, left: -100 }} />

      <Link to="/" className="auth-logo">⚖️ Vakil<span className="gradient-text">Bot</span></Link>

      <div className="auth-card auth-card--wide card">
        <div className="auth-card__header">
          <span className="auth-card__emoji">🏛️</span>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">Set up your law firm and get your embed key instantly</p>
        </div>

        {error && <div className="notif notif--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form__row">
            <div className="form-group">
              <label htmlFor="reg-fname">First Name</label>
              <input id="reg-fname" className="form-input" type="text" placeholder="Priya" required value={form.first_name} onChange={set('first_name')} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-lname">Last Name</label>
              <input id="reg-lname" className="form-input" type="text" placeholder="Sharma" required value={form.last_name} onChange={set('last_name')} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reg-firm">Law Firm Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input id="reg-firm" className="form-input" type="text" placeholder="Sharma & Associates" value={form.firm_name} onChange={set('firm_name')} />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" className="form-input" type="email" placeholder="advocate@yourfirm.in" required value={form.email} onChange={set('email')} />
          </div>
          <div className="auth-form__row">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input id="reg-username" className="form-input" type="text" placeholder="yourfirm" required value={form.username} onChange={set('username')} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" className="form-input" type="password" placeholder="Min. 8 characters" required value={form.password} onChange={set('password')} />
            </div>
          </div>
          <button id="register-submit" type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</>
              : '🚀 Create Account & Get Embed Key'
            }
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in →</Link>
        </p>
      </div>

      <div className="auth-trust">
        <div className="auth-trust-item">🔒 Secure JWT Auth</div>
        <div className="auth-trust-item">✨ Instant Embed Key</div>
        <div className="auth-trust-item">🇮🇳 Indian Law AI</div>
      </div>
    </div>
  )
}
