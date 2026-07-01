import { useState } from 'react'
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useLogin } from '../../hooks/useLogin'

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

export default function LoginPage() {
  const auth = useAuth()

  const {
    login: loginRequest,
    loading,
    error: apiError,
  } = useLogin()

  const navigate = useNavigate()
  const location = useLocation()

  const fromSignup =
    location.state?.fromSignup ?? false

  const prefillEmail =
    location.state?.email ?? ''

  const notice =
    location.state?.notice ?? ''

  const [form, setForm] = useState({
    email: prefillEmail,
    password: '',
  })

  const [error, setError] =
    useState('')

  const [tIdx, setTIdx] =
    useState(0)

  const from = fromSignup
    ? '/subscribe'
    : location.state?.from
        ?.pathname ||
      '/dashboard'

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    })
  }

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault()

    setError('')

    if (
      !form.email ||
      !form.password
    ) {
      setError(
        'Email and password are required.'
      )
      return
    }

    try {
      const authData =
        await loginRequest({
          email: form.email,
          password:
            form.password,
        })

      // Save user and tokens in AuthContext
      auth.login(
        authData.user,
        {
          accessToken:
            authData.accessToken,
          refreshToken:
            authData.refreshToken,
        }
      )

      navigate(from, {
        replace: true,
      })
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
              Sign in
            </p>

            <h1 className="auth-panel__headline">
              Welcome
              <br />
              back.
            </h1>

            <p className="auth-panel__body">
              Your AI agents have
              been busy. Sign in to
              continue.
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
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">
          <h2 className="auth-form__heading">
            Sign in
          </h2>

          <p className="auth-form__sub">
            Access your business
            dashboard
          </p>

          {notice && (
            <p className="auth-success">
              {notice}
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
            onSubmit={
              handleSubmit
            }
            className="auth-form"
          >
            <div className="auth-field">
              <label className="auth-field__label">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="you@example.com"
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Your password"
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
              disabled={
                loading
              }
              className="auth-btn-primary"
            >
              {loading
                ? 'Signing in...'
                : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            New here?{' '}
            <Link
              to="/signup"
              className="auth-switch__link"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}