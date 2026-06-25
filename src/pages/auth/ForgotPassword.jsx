import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../../hooks/useForgotPassword'
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
      'Our WhatsApp response time dropped from 4 hours to instant.',
    name: 'Emeka O.',
    role: 'Founder, TechVault NG',
  },
  {
    quote:
      'Setup was effortless.',
    name: 'Fatima I.',
    role: 'Head of Sales, Kaira Foods',
  },
]

export default function ForgotPasswordPage() {
  const {
    forgotPassword,
    loading,
    error: apiError,
    success,
  } = useForgotPassword()

  const [email, setEmail] =
    useState('')

  const [error, setError] =
    useState('')

  const [tIdx, setTIdx] =
    useState(0)

  const handleSubmit =
    async (e) => {
      e.preventDefault()

      setError('')

      if (!email.trim()) {
        setError(
          'Email is required.'
        )
        return
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (
        !emailRegex.test(
          email
        )
      ) {
        setError(
          'Please enter a valid email address.'
        )
        return
      }

      try {
        await forgotPassword(
          email
        )
      } catch (err) {
        setError(
          err.message
        )
      }
    }

  const t =
    TESTIMONIALS[tIdx]

  return (
    <div className="auth-split">

      {/* Left panel */}

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
              Password Recovery
            </p>

            <h1 className="auth-panel__headline">
              Recover your
              <br />
              account
            </h1>

            <p className="auth-panel__body">
              Enter your email and
              we'll send instructions
              to reset your password.
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

              {TESTIMONIALS.map(
                (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`auth-testimonial__dot ${
                      i === tIdx
                        ? 'auth-testimonial__dot--active'
                        : ''
                    }`}
                    onClick={() =>
                      setTIdx(i)
                    }
                  />
                )
              )}

            </div>

          </div>

          <p className="auth-panel__footer">
            © 2026 BizAI · Powering Nigerian businesses with AI
          </p>

        </div>

        <span className="auth-ring auth-ring--tl" />
        <span className="auth-ring auth-ring--br" />

      </div>

      {/* Right panel */}

      <div className="auth-panel auth-panel--form">

        <div className="auth-form-inner">

          <h2 className="auth-form__heading">
            Forgot password
          </h2>

          <p className="auth-form__sub">
            Enter your email to receive
            reset instructions.
          </p>

          {success && (
            <p className="auth-success">
              {success}
            </p>
          )}

          {(error ||
            apiError) && (
            <p className="auth-error">
              {error ||
                apiError}
            </p>
          )}

          <form
            className="auth-form"
            onSubmit={
              handleSubmit
            }
            noValidate
          >

            <div className="auth-field">

              <label
                htmlFor="fp-email"
                className="auth-field__label"
              >
                Email Address
              </label>

              <input
                id="fp-email"
                type="email"
                value={email}
                placeholder="you@business.com"
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="auth-field__input"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {
                loading
                  ? 'Sending...'
                  : 'Send reset email'
              }
            </button>

          </form>

          <p className="auth-switch">

            Remembered your password?{' '}

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