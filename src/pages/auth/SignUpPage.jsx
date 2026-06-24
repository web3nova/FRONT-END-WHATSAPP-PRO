import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function SignUpPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // TODO: Replace with real API call
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }

    signup({ name: form.name, email: form.email })
    navigate('/subscribe')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          {/* TODO: Replace with your logo */}
          <div className="auth-logo-placeholder">YourLogo</div>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          {/* TODO: Update with your value proposition */}
          Join thousands of businesses managing their orders and customer conversations in one place.
        </p>

        {error && <p className="auth-error">{error}</p>}

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

          {/* TODO: Add terms of service checkbox when your ToS is ready */}
          <p className="auth-terms">
            By signing up, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>

          <button type="submit" className="auth-btn-primary">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}