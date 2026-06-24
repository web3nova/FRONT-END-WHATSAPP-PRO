import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, MessageCircle, ShoppingBag, BarChart3 } from 'lucide-react'
import './Auth.css'

const features = [
  { icon: MessageCircle, text: 'AI WhatsApp agent handles orders 24/7' },
  { icon: ShoppingBag,   text: 'Unified order & customer management' },
  { icon: BarChart3,     text: 'Real-time analytics & business insights' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }
    login({ email: form.email, name: 'Returning User' })
    navigate(from, { replace: true })
  }

  return (
    <div className="auth-split">

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-left-logo-mark"><Zap size={17} /></div>
          Web3Nova
        </div>

        <div className="auth-left-body">
          <h2 className="auth-left-headline">The smarter way to run your business</h2>
          <p className="auth-left-sub">
            Join thousands of businesses managing orders, customers, and WhatsApp conversations — all in one place.
          </p>
          <div className="auth-feature-list">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="auth-feature-item">
                <div className="auth-feature-icon"><Icon size={16} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-stats">
          <div className="auth-stat">
            <span className="auth-stat-num">2,000+</span>
            <span className="auth-stat-label">Businesses</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">98%</span>
            <span className="auth-stat-label">Satisfaction</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">24/7</span>
            <span className="auth-stat-label">AI Support</span>
          </div>
        </div>

        <div className="auth-deco-1" />
        <div className="auth-deco-2" />
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Log in to your dashboard and keep things moving.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ada@yourbusiness.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="auth-field-footer">
              <Link to="/forgot-password" className="auth-link-muted">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn-primary">Log in →</button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup">Sign up free</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
