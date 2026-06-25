import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    // TODO: call your registration API here before navigating
    // persist a flag that the user just signed up
    localStorage.setItem('hasSignedUp', 'true')
    navigate('/login', {
      state: {
        notice: 'Account created! Please sign in to continue.',
        email: form.email,
        fromSignup: true,
      },
    })
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div className="auth-split">
      {/* ── LEFT PANEL ── */}
      <div className="auth-panel auth-panel--brand">
        <div className="auth-panel__inner">
          <div className="auth-logo">
            <span className="auth-logo__mark">B</span>
            <span className="auth-logo__wordmark">BizAI</span>
          </div>

          <div className="auth-panel__copy">
            <p className="auth-panel__eyebrow">Get started</p>
            <h1 className="auth-panel__headline">Automate your<br />business today.</h1>
            <p className="auth-panel__body">
              Join 500+ Nigerian businesses using AI to handle
              customer service, orders and more.
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
                  className={`auth-testimonial__dot${i === tIdx ? ' auth-testimonial__dot--active' : ''}`}
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

      {/* ── RIGHT PANEL ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">
          <h2 className="auth-form__heading">Create your account</h2>
          <p className="auth-form__sub">Free for 14 days — no card required</p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="name" className="auth-field__label">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Ada Okonkwo"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="auth-field__input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-field__label">Email</label>
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
              <label htmlFor="password" className="auth-field__label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="auth-field__input"
              />
            </div>

            <p className="auth-terms">
              By signing up, you agree to our{' '}
              <a href="#" className="auth-terms__link">Terms</a> and{' '}
              <a href="#" className="auth-terms__link">Privacy Policy</a>.
            </p>

            <button type="submit" className="auth-btn-primary">
              Create account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Sign in</Link>
          </p>

          <div className="auth-divider">
            <span className="auth-divider__line" />
            <span className="auth-divider__label">trusted by 500+ businesses</span>
            <span className="auth-divider__line" />
          </div>

          <div className="auth-sectors">
            {['Retail', 'Healthcare', 'Logistics'].map((s) => (
              <span key={s} className="auth-sector">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}