import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from '../../hooks/useSignup'
import './Auth.css'

const TESTIMONIALS = [
  {
    quote:
      'BizAI handles 80% of our customer queries automatically. Game changer.',
    name: 'Chioma A.',
    role: 'CEO, SwiftMart Lagos',
  },
  {
    quote:
      'Our WhatsApp response time dropped from 4 hours to instant. Incredible ROI.',
    name: 'Emeka O.',
    role: 'Founder, TechVault NG',
  },
  {
    quote:
      'Setup was effortless. The bot knows our product catalogue inside out.',
    name: 'Fatima I.',
    role: 'Head of Sales, Kaira Foods',
  },
]

export default function SignUpPage() {
  const navigate = useNavigate()

  const {
    signup,
    loading,
    error: apiError,
  } = useSignup()

  const [form, setForm] = useState({
    name: '',
    tenantName: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (
      !form.name ||
      !form.tenantName ||
      !form.email ||
      !form.password
    ) {
      setError('All fields are required.')
      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      setError(
        'Please enter a valid email address.'
      )
      return
    }

    if (form.password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )
      return
    }

    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        tenantName: form.tenantName,
      })

      navigate('/login', {
        state: {
          notice:
            'Account created! Please sign in.',
          email: form.email,
          fromSignup: true,
        },
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div className="auth-split">

      <div className="auth-panel auth-panel--brand">
        <div className="auth-panel__inner">

          <div className="auth-logo">
            <span className="auth-logo__mark">
              B
            </span>
            <span className="auth-logo__wordmark">
              BizAI
            </span>
          </div>

          <div className="auth-panel__copy">
            <p className="auth-panel__eyebrow">
              Get started
            </p>

            <h1 className="auth-panel__headline">
              Automate your
              <br />
              business today.
            </h1>

            <p className="auth-panel__body">
              Join 500+ Nigerian businesses
              using AI.
            </p>
          </div>

        </div>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">

          <h2 className="auth-form__heading">
            Create your account
          </h2>

          <p className="auth-form__sub">
            Free for 14 days
          </p>

          {(error || apiError) && (
            <p className="auth-error">
              {error || apiError}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            <div className="auth-field">
              <label className="auth-field__label">
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Company Name
              </label>

              <input
                name="tenantName"
                value={form.tenantName}
                onChange={handleChange}
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Password
              </label>

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="auth-field__input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link
              to="/login"
              className="auth-switch__link"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}