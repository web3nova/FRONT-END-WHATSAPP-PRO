import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const TESTIMONIALS = [
  {
    quote: 'BizAI handles 80% of our customer queries automatically. Game changer.',
    name: 'Chioma A.',
    role: 'CEO, SwiftMart Lagos',
  },
  {
    quote: 'Our WhatsApp response time dropped from 4 hours to instant. Incredible ROI.',
    name: 'Emeka O.',
    role: 'Founder, TechVault NG',
  },
  {
    quote: 'Setup was effortless. The bot knows our product catalogue inside out.',
    name: 'Fatima I.',
    role: 'Head of Sales, Kaira Foods',
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // State passed from SignupPage
  const fromSignup = location.state?.fromSignup ?? false
  const prefillEmail = location.state?.email ?? ''
  const notice = location.state?.notice ?? ''

  const [form, setForm] = useState({
    email: prefillEmail,
    password: '',
  })

  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)

  const from = fromSignup
    ? '/subscribe'
    : location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    // Replace with actual authentication API later
    login({
      email: form.email,
      name: 'Returning User',
      isNewUser: fromSignup,
    })

    navigate(from, { replace: true })
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div className="auth-split">

      {/* Left Panel */}
      <div className="auth-panel auth-panel--brand">
        <div className="auth-panel__inner">

          <div className="auth-logo">
            <span className="auth-logo__mark">B</span>
            <span className="auth-logo__wordmark">BizAI</span>
          </div>

          <div className="auth-panel__copy">
            <p className="auth-panel__eyebrow">Sign in</p>

            <h1 className="auth-panel__headline">
              Welcome
              <br />
              back.
            </h1>

            <p className="auth-panel__body">
              Your AI agents have been busy.
              Sign in to see what they've been up to.
            </p>
          </div>

          <div className="auth-testimonial">
            <p className="auth-testimonial__quote">
              "{t.quote}"
            </p>

            <div className="auth-testimonial__author">
              <span className="auth-testimonial__avatar">
                {t.name[0]}
              </span>

              <div>
                <p className="auth-testimonial__name">
                  {t.name}
                </p>

                <p className="auth-testimonial__role">
                  {t.role}
                </p>
              </div>
            </div>

            <div className="auth-testimonial__dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`auth-testimonial__dot ${
                    i === tIdx
                      ? 'auth-testimonial__dot--active'
                      : ''
                  }`}
                  onClick={() => setTIdx(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <p className="auth-panel__footer">
            © 2026 BizAI · Powering Nigerian businesses with AI
          </p>
        </div>

        <span className="auth-ring auth-ring--tl" />
        <span className="auth-ring auth-ring--br" />
      </div>

      {/* Right Panel */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">

          <h2 className="auth-form__heading">
            Sign in
          </h2>

          <p className="auth-form__sub">
            Access your business dashboard
          </p>

          {notice && (
            <p className="auth-success">{notice}</p>
          )}

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-form"
            noValidate
          >
            <div className="auth-field">
              <label
                htmlFor="email"
                className="auth-field__label"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="ada@yourbusiness.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label
                htmlFor="password"
                className="auth-field__label"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="auth-field__input"
              />
            </div>

            <div className="auth-field-footer">
              <Link
                to="/forgot-password"
                className="auth-link-muted"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
            >
              Log in
            </button>
          </form>

          <p className="auth-switch">
            New here?{' '}
            <Link
              to="/signup"
              className="auth-switch__link"
            >
              Create an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}