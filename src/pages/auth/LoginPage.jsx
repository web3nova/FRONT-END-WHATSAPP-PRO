import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLogin } from '../../hooks/useLogin'
import BizBackground from '../../components/BizBackground'
import './Auth.css'

const TESTIMONIALS = [
  {
    quote: 'BizAI handles 80% of our customer queries automatically. Game changer.',
    name: 'Chioma A.',
    role: 'CEO, SwiftMart Lagos',
  },
  {
    quote: 'Our WhatsApp response time dropped from 4 hours to instant.',
    name: 'Emeka O.',
    role: 'Founder, TechVault NG',
  },
  {
    quote: 'Setup was effortless. We were live in under 10 minutes.',
    name: 'Fatima I.',
    role: 'Head of Sales, Kaira Foods',
  },
]

export default function LoginPage() {
  const auth = useAuth()
  const { login: loginRequest, loading, error: apiError } = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const fromSignup = location.state?.fromSignup ?? false
  const prefillEmail = location.state?.email ?? ''
  const notice = location.state?.notice ?? ''

  const [form, setForm] = useState({
    email: prefillEmail,
    password: '',
  })
  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const from = fromSignup ? '/subscribe' : location.state?.from?.pathname || '/dashboard'

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTIdx((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Focus email on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const email = form.email.trim()
    const password = form.password.trim()

    if (!email || !password) {
      setError('Email and password are required.')
      if (!email) emailInputRef.current?.focus()
      else passwordInputRef.current?.focus()
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      emailInputRef.current?.focus()
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      passwordInputRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const authData = await loginRequest({ email, password })

      // Save user and tokens in AuthContext
      auth.login(authData.user, {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      })

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      // Don't clear password on error - let user correct it
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting && !loading) {
      handleSubmit(e)
    }
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div className="app-bg">
      <BizBackground variant="dark" />
      <div className="content-layer">
        <div className="auth-split">
          {/* Left panel - Brand */}
          <div className="auth-panel auth-panel--brand">
            <div className="auth-panel__inner">
              <div className="auth-logo">
                <span className="auth-logo__mark">B</span>
                <span className="auth-logo__wordmark">BizAI</span>
              </div>

              <div className="auth-panel__copy">
                <p className="auth-panel__eyebrow">Secure sign in</p>
                <h1 className="auth-panel__headline">
                  Welcome
                  <br />
                  back.
                </h1>
                <p className="auth-panel__body">
                  Your AI agents have been busy. Sign in to continue.
                </p>
              </div>

              <div className="auth-testimonial">
                <p className="auth-testimonial__quote">"{t.quote}"</p>
                <div className="auth-testimonial__author">
                  <span className="auth-testimonial__avatar">{t.name[0]}</span>
                  <div>
                    <p className="auth-testimonial__name">{t.name}</p>
                    <p className="auth-testimonial__role">{t.role}</p>
                  </div>
                </div>
                <div className="auth-testimonial__dots">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`auth-testimonial__dot ${i === tIdx ? 'auth-testimonial__dot--active' : ''}`}
                      onClick={() => setTIdx(i)}
                      aria-label={`Testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Form */}
          <div className="auth-panel auth-panel--form">
          <div className="auth-form-card">   {/* was: auth-form-inner */}
            <h2 className="auth-form__heading">Sign in</h2>
              <p className="auth-form__sub">Access your business dashboard</p>

              {notice && (
                <div className="auth-alert auth-alert--success" role="status">
                  {notice}
                </div>
              )}

              {(error || apiError) && (
                <div className="auth-alert auth-alert--error" role="alert">
                  <span className="auth-alert__icon">✕</span>
                  {error || apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="email" className="auth-field__label">
                    Email
                  </label>
                  <input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="you@example.com"
                    className={`auth-field__input ${error && !form.email ? 'auth-field__input--error' : ''}`}
                    autoComplete="email"
                    disabled={isSubmitting || loading}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'login-error' : undefined}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password" className="auth-field__label">
                    Password
                  </label>
                  <div className="auth-password-wrapper">
                    <input
                      ref={passwordInputRef}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Your password"
                      className={`auth-field__input ${error && !form.password ? 'auth-field__input--error' : ''}`}
                      autoComplete="current-password"
                      disabled={isSubmitting || loading}
                      aria-invalid={!!error}
                      aria-describedby={error ? 'login-error' : undefined}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="auth-field-footer">
                  <Link to="/forgot-password" className="auth-link-muted">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="auth-btn-primary"
                >
                  {isSubmitting || loading ? (
                    <>
                      <span className="auth-spinner" aria-hidden="true" />
                      Signing in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </button>
              </form>

              <p className="auth-switch">
                New here?{' '}
                <Link to="/signup" className="auth-switch__link">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}