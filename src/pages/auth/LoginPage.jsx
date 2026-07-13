import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
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
  const { login: loginRequest, verifyOtp, resendOtp, loading, error: apiError } = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const fromSignup = location.state?.fromSignup ?? false
  const prefillEmail = location.state?.email ?? ''
  const notice = searchParams.get('invited') === '1'
    ? 'Account created! Sign in with your email and the password you just set.'
    : (location.state?.notice ?? '')

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

  // OTP step state
  const [otpStep, setOtpStep] = useState(false)
  const [otpUserId, setOtpUserId] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [resent, setResent] = useState(false)
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(600) // 10-min code TTL
  const [resendCooldown, setResendCooldown] = useState(0)   // seconds until resend allowed

  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  // OTP expiry + resend cooldown countdown
  useEffect(() => {
    if (!otpStep) return
    const t = setInterval(() => {
      setOtpSecondsLeft(s => Math.max(0, s - 1))
      setResendCooldown(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [otpStep])

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
      const result = await loginRequest({ email, password })

      // Step 1 succeeded — backend sent OTP, show the code input
      if (result.requiresOtp) {
        setOtpUserId(result.userId)
        setOtpEmail(result.email)
        setOtpStep(true)
        setOtpSecondsLeft(600)
        setResendCooldown(60)
        setIsSubmitting(false)
        return
      }

      // Fallback: no OTP (shouldn't happen but handle gracefully)
      const authData = result
      await auth.login(authData.user, {
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      })

      // Navigate to intended destination — RequireSubscription handles redirect
      // to /subscribe if the subscription is not active.
      // Check business profile first: if it exists, onboarding is complete.
      try {
        const profile = await onboardingApi.getProfile()
        if (profile?.displayName || profile?.id) {
          navigate(from, { replace: true })
          return
        }
      } catch {
        // No business profile — check onboarding status below
      }

      try {
        const statusData = await onboardingApi.checkStatus()
        const onboardingDone = statusData?.allPanelsDone === true
        if (!onboardingDone) {
          navigate('/onboarding', { replace: true })
          return
        }
        navigate(from, { replace: true })
      } catch {
        navigate(from, { replace: true })
      }
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
                <img src="/BizIq6.png" alt="BizIQ" className="auth-logo__img" />
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
          <div className="auth-form-card">

            {otpStep ? (
              /* ── OTP step ── */
              <>
                <h2 className="auth-form__heading">Check your email</h2>
                <p className="auth-form__sub">We sent a 6-digit code to <strong>{otpEmail}</strong></p>

                {(error || apiError) && (
                  <div className="auth-alert auth-alert--error" role="alert">
                    <span className="auth-alert__icon">✕</span>
                    {error || apiError}
                  </div>
                )}
                {resent && (
                  <div className="auth-alert auth-alert--success" role="status">Code resent — check your inbox.</div>
                )}

                <form
                  className="auth-form"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setError('')
                    setIsSubmitting(true)
                    try {
                      const authData = await verifyOtp({ userId: otpUserId, code: otpCode })
                      await auth.login(authData.user, { accessToken: authData.accessToken, refreshToken: authData.refreshToken })
                      try {
                        const profile = await onboardingApi.getProfile()
                        navigate(profile?.displayName || profile?.id ? from : '/onboarding')
                      } catch {
                        navigate(from)
                      }
                    } catch (err) {
                      setError(err.message)
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                >
                  <div className="auth-field">
                    <label className="auth-field__label">Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="auth-field__input"
                      style={{ letterSpacing: '0.3em', fontSize: '1.25rem', textAlign: 'center' }}
                      autoFocus
                    />
                  </div>

                  <button type="submit" disabled={otpCode.length < 6 || isSubmitting || loading} className="auth-btn-primary">
                    {isSubmitting || loading ? <><span className="auth-spinner" aria-hidden="true" /> Verifying…</> : 'Verify & Sign in'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <p style={{ fontSize: '0.75rem', color: otpSecondsLeft < 60 ? '#dc2626' : '#94a3b8', marginBottom: '10px' }}>
                    {otpSecondsLeft > 0
                      ? `Code expires in ${Math.floor(otpSecondsLeft / 60)}:${String(otpSecondsLeft % 60).padStart(2, '0')}`
                      : 'Code expired — request a new one'}
                  </p>
                  <button
                    type="button"
                    className="auth-link-muted"
                    style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer', fontSize: '0.875rem', opacity: resendCooldown > 0 ? 0.5 : 1 }}
                    disabled={resendCooldown > 0 || loading}
                    onClick={async () => {
                      setResent(false)
                      try {
                        await resendOtp({ userId: otpUserId })
                        setResent(true)
                        setOtpSecondsLeft(600)
                        setResendCooldown(60)
                        setTimeout(() => setResent(false), 4000)
                      } catch { /* silent */ }
                    }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend code"}
                  </button>
                  <span style={{ margin: '0 8px', color: '#cbd5e1' }}>·</span>
                  <button
                    type="button"
                    className="auth-link-muted"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                    onClick={() => { setOtpStep(false); setOtpCode(''); setError('') }}
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              /* ── Password step ── */
              <>
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
            </>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
