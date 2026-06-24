import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, MessageCircle, ShoppingBag, BarChart3 } from 'lucide-react'
import './Auth.css'

const features = [
  { icon: MessageCircle, text: 'AI WhatsApp agent handles orders 24/7' },
  { icon: ShoppingBag,   text: 'Unified order & customer management' },
  { icon: BarChart3,     text: 'Real-time analytics & business insights' },
]

export default function SignUpPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    signup({ name: form.name, email: form.email })
    navigate('/subscribe')
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
          <h2 className="auth-left-headline">Start building your AI-powered business today</h2>
          <p className="auth-left-sub">
            Set up in minutes. No technical skills needed. Cancel anytime.
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
            <span className="auth-stat-num">14 days</span>
            <span className="auth-stat-label">Free trial</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">5 mins</span>
            <span className="auth-stat-label">Setup time</span>
          </div>
          <div className="auth-stat-divider" />
          <div className="auth-stat">
            <span className="auth-stat-num">₦0</span>
            <span className="auth-stat-label">Card required</span>
          </div>
        </div>

        <div className="auth-deco-1" />
        <div className="auth-deco-2" />
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">14 days free — no credit card needed.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ada Okonkwo"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email">Work email</label>
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
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <p className="auth-terms">
              By signing up you agree to our{' '}
              <a href="/terms">Terms of Service</a> and{' '}
              <a href="/privacy">Privacy Policy</a>.
            </p>

            <button type="submit" className="auth-btn-primary">Create account →</button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
