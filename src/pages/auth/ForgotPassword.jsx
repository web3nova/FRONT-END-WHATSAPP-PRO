import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../../hooks/useForgotPassword'
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
    quote: 'Setup was effortless.',
    name: 'Fatima I.',
    role: 'Head of Sales, Kaira Foods',
  },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error: apiError, success } = useForgotPassword()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [tIdx, setTIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const emailInputRef = useRef(null)

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
    emailInputRef.current?.focus()
  }, [])

  const validateEmail = (value) => {
    if (!value) return ''
    return EMAIL_REGEX.test(value) ? '' : 'Please enter a valid email address.'
  }

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (fieldError) setFieldError('')
  }

  const handleBlur = (e) => {
    setFieldError(validateEmail(e.target.value.trim()))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Email is required.')
      emailInputRef.current?.focus()
      return
    }

    const emailError = validateEmail(trimmedEmail)
    if (emailError) {
      setError(emailError)
      setFieldError(emailError)
      emailInputRef.current?.focus()
      return
    }

    try {
      await forgotPassword(trimmedEmail)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div className="app-bg">
      <BizBackground variant="dark" />
      <div className="content-layer">
        <div className="auth-split">
          {/* Left panel */}
          <div className="auth-panel auth-panel--brand">
            <div className="auth-panel__inner">
              <div className="auth-logo">
                <span className="auth-logo__mark">B</span>
                <span className="auth-logo__wordmark">BizAI</span>
              </div>

              <div className="auth-panel__copy">
                <p className="auth-panel__eyebrow">Password Recovery</p>
                <h1 className="auth-panel__headline">
                  Recover your
                  <br />
                  account
                </h1>
                <p className="auth-panel__body">
                  Enter your email and we'll send instructions to reset your password.
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

          {/* Right panel */}
          <div className="auth-panel auth-panel--form">
            <div className="auth-form-card">
              <h2 className="auth-form__heading">Forgot password</h2>
              <p className="auth-form__sub">Enter your email to receive reset instructions.</p>

              {success && (
                <div className="auth-alert auth-alert--success" role="status" aria-live="polite">
                  {success}
                </div>
              )}

              {(error || apiError) && (
                <div className="auth-alert auth-alert--error" role="alert" aria-live="assertive">
                  <span className="auth-alert__icon">✕</span>
                  {error || apiError}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label htmlFor="fp-email" className="auth-field__label">
                    Email Address
                  </label>
                  <input
                    ref={emailInputRef}
                    id="fp-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@business.com"
                    className={`auth-field__input ${fieldError ? 'auth-field__input--error' : ''}`}
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? 'fp-email-error' : undefined}
                  />
                  {fieldError && (
                    <p id="fp-email-error" className="auth-field__error" role="alert">
                      {fieldError}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? (
                    <>
                      <span className="auth-spinner" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send reset email'
                  )}
                </button>
              </form>

              <p className="auth-switch">
                Remembered your password?{' '}
                <Link to="/login" className="auth-switch__link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}