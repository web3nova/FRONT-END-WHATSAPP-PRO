import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  // Redirect to where the user came from, or dashboard by default
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // TODO: Replace with real API call to verify credentials
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    login({ email: form.email, name: 'Returning User' })
    navigate(from, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          {/* TODO: Replace with your logo */}
          <div className="auth-logo-placeholder">YourLogo</div>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">
          {/* TODO: Update tagline */}
          Log in to manage your orders and WhatsApp conversations.
        </p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
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

          {/* TODO: Wire up forgot password flow */}
          <div className="auth-field-footer">
            <Link to="/forgot-password" className="auth-link-muted">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-btn-primary">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          New here?{' '}
          <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}