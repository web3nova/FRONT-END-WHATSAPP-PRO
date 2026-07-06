import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLogin } from '../../hooks/useLogin'
import onboardingApi from '../../services/onboardingService'
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const from = fromSignup ? '/subscribe' : location.state?.from?.pathname || '/dashboard'

  // Auto-rotate testimonials (pauses on hover/focus)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setTIdx((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused])

  // Focus email on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  const validateEmail = (email) => {
    if (!email) return ''
    return EMAIL_REGEX.test(email) ? '' : 'Please enter a valid email address.'
  }

  const validatePassword = (password) => {
    if (!password) return ''
    return password.length >= 6 ? '' : 'Password must be at least 6 characters.'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear errors as the user corrects them
    if (error) setError('')
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const trimmed = value.trim()
    if (name === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(trimmed) }))
    } else if (name === 'password') {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(trimmed) }))
    }
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

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setFieldErrors((prev) => ({ ...prev, email: emailError }))
      emailInputRef.current?.focus()
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setFieldErrors((prev) => ({ ...prev, password: passwordError }))
      passwordInputRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    try {
      const authData = await loginRequest({ email, password })

      // Save user and tokens in AuthContext (also fetches real subscription)
      await auth.login(authData.user, {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      })

      // Navigate to intended destination — RequireSubscription handles redirect
      // to /subscribe if the subscription is not active.
      try {
        const statusData = await onboardingApi.checkStatus()
        const isOnboarded = statusData?.completed === true || statusData?.steps?.business === true
        if (!isOnboarded) {
          navigate('/onboarding', { replace: true })
          return
        }
      } catch {
        // onboarding check failed — proceed to destination
      }

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
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

              <div
                className="auth-testimonial"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              >
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
                <div className="auth-alert auth-alert--success" role="status" aria-live="polite">
                  {notice}
                </div>
              )}

              {(error || apiError) && (
                <div className="auth-alert auth-alert--error" role="alert" aria-live="assertive">
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
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`auth-field__input ${(error && !form.email) || fieldErrors.email ? 'auth-field__input--error' : ''}`}
                    autoComplete="email"
                    disabled={isSubmitting || loading}
                    aria-invalid={!!(error || fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="auth-field__error" role="alert">
                      {fieldErrors.email}
                    </p>
                  )}
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
                      onBlur={handleBlur}
                      placeholder="Your password"
                      className={`auth-field__input ${(error && !form.password) || fieldErrors.password ? 'auth-field__input--error' : ''}`}
                      autoComplete="current-password"
                      disabled={isSubmitting || loading}
                      aria-invalid={!!(error || fieldErrors.password)}
                      aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting || loading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="password-error" className="auth-field__error" role="alert">
                      {fieldErrors.password}
                    </p>
                  )}
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