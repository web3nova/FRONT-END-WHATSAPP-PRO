import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from '../../hooks/useSignup'
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

const friendlyError = (err) => {
  if (!err) return ''
  
  // Handle the error object properly
  let msg = ''
  if (typeof err === 'string') {
    msg = err
  } else if (err.message) {
    msg = err.message
  } else if (err.error || err.data?.message) {
    msg = err.error || err.data.message
  } else {
    msg = JSON.stringify(err)
  }
  
  const lower = msg.toLowerCase()

  // Specific error messages
  if (lower.includes('email already in use') || lower.includes('already exists'))
    return 'An account with this email already exists. Try signing in instead.'
  
  if (lower.includes('invalid email') || lower.includes('email is required'))
    return "That email address doesn't look right. Please double-check it."
  
  if (lower.includes('weak password') || lower.includes('password too short') || lower.includes('minimum'))
    return 'Choose a stronger password — at least 8 characters with letters and numbers.'
  
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('attempts'))
    return 'Too many attempts. Please wait a moment and try again.'
  
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch'))
    return 'Network error. Please check your internet connection and try again.'
  
  if (lower.includes('server') || lower.includes('500') || lower.includes('internal server'))
    return 'Something went wrong on our end. Please try again shortly.'
  
  if (lower.includes('401') || lower.includes('unauthorized'))
    return 'Authentication failed. Please check your credentials.'
  
  if (lower.includes('403') || lower.includes('forbidden'))
    return "You don't have permission to perform this action."
  
  if (lower.includes('404'))
    return 'Service not found. Please try again later.'
  
  if (lower.includes('validation') || lower.includes('invalid'))
    return 'Please check your input and try again.'

  // Return the actual error message if it's not too long
  if (msg.length > 0 && msg.length < 150) return msg

  return 'Something went wrong. Please try again.'
}

function Spinner() {
  return (
    <svg
      className="auth-spinner"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4"
        strokeDashoffset="10"
      />
    </svg>
  )
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signup, loading, error: apiError } = useSignup()

  const [form, setForm] = useState({
    name: '',
    tenantName: '',
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [tIdx, setTIdx] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (submitError) setSubmitError('')
  }

  const validate = () => {
    const errors = {}

    if (!form.name.trim())
      errors.name = 'Full name is required.'

    if (!form.tenantName.trim())
      errors.tenantName = 'Company name is required.'

    if (!form.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
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
          notice: 'Account created! Please sign in.',
          email: form.email,
          fromSignup: true,
        },
      })
    } catch (err) {
      // The friendlyError function will handle formatting
      const errorMsg = friendlyError(err.message || err)
      setSubmitError(errorMsg)
      console.error('Signup error:', err)
    }
  }

  const displayError = friendlyError(apiError) || submitError
  const t = TESTIMONIALS[tIdx]

  return (
    <div className="auth-split">

      <div className="auth-panel auth-panel--brand">
        <div className="auth-panel__inner">

          <div className="auth-logo">
            <span className="auth-logo__mark">B</span>
            <span className="auth-logo__wordmark">BizAI</span>
          </div>

          <div className="auth-panel__copy">
            <p className="auth-panel__eyebrow">Get started</p>
            <h1 className="auth-panel__headline">
              Automate your<br />business today.
            </h1>
            <p className="auth-panel__body">
              Join 500+ Nigerian businesses using AI.
            </p>
          </div>

          <div className="auth-testimonial">
            <p className="auth-testimonial__quote">{t.quote}</p>
            <p className="auth-testimonial__name">{t.name}</p>
            <p className="auth-testimonial__role">{t.role}</p>
            <div className="auth-testimonial__dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`auth-testimonial__dot${i === tIdx ? ' auth-testimonial__dot--active' : ''}`}
                  onClick={() => setTIdx(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">

          <h2 className="auth-form__heading">Create your account</h2>
          <p className="auth-form__sub">Free for 14 days · No credit card required</p>

          {displayError && (
            <div className="auth-error" role="alert">
              <svg className="auth-error__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.875.875 0 110-1.75.875.875 0 010 1.75z" clipRule="evenodd" />
              </svg>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            <div className={`auth-field${fieldErrors.name ? ' auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="auth-field__input"
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                disabled={loading}
              />
              {fieldErrors.name && (
                <p id="name-error" className="auth-field__error">{fieldErrors.name}</p>
              )}
            </div>

            <div className={`auth-field${fieldErrors.tenantName ? ' auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="tenantName">Company Name</label>
              <input
                id="tenantName"
                name="tenantName"
                autoComplete="organization"
                value={form.tenantName}
                onChange={handleChange}
                className="auth-field__input"
                aria-describedby={fieldErrors.tenantName ? 'tenantName-error' : undefined}
                disabled={loading}
              />
              {fieldErrors.tenantName && (
                <p id="tenantName-error" className="auth-field__error">{fieldErrors.tenantName}</p>
              )}
            </div>

            <div className={`auth-field${fieldErrors.email ? ' auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="auth-field__input"
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p id="email-error" className="auth-field__error">{fieldErrors.email}</p>
              )}
            </div>

            <div className={`auth-field${fieldErrors.password ? ' auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="auth-field__input"
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                disabled={loading}
              />
              {fieldErrors.password && (
                <p id="password-error" className="auth-field__error">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <>
                  <Spinner />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Sign in</Link>
          </p>

        </div>
      </div>

    </div>
  )
}