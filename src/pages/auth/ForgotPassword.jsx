import { Link } from 'react-router-dom'
import './Auth.css'

export default function ForgotPasswordPage() {
  return (
    <div className="auth-split">
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">
          <h2 className="auth-form__heading">Forgot password</h2>
          <p className="auth-form__sub">Enter your email and we'll send password reset instructions.</p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="auth-field">
              <label htmlFor="fp-email" className="auth-field__label">Email</label>
              <input id="fp-email" name="email" type="email" placeholder="you@business.com" className="auth-field__input" />
            </div>

            <button type="submit" className="auth-btn-primary">Send reset email</button>
          </form>

          <p className="auth-switch">
            Remembered?{' '}
            <Link to="/login" className="auth-switch__link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
