import { useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useResetPassword }
from '../../hooks/useResetPassword'

import './Auth.css'

export default function ResetPasswordPage() {
  const navigate =
    useNavigate()

  const [searchParams] =
    useSearchParams()

  /*
    Gets token from URL:

    /reset-password?token=abc123
  */

  const token =
    searchParams.get(
      'token'
    ) || ''

  const {
    resetPassword,
    loading,
    error: apiError,
    success,
  } = useResetPassword()

  const [form, setForm] =
    useState({
      password: '',
      confirmPassword: '',
    })

  const [error, setError] =
    useState('')

  const handleChange =
    (e) => {
      setForm({
        ...form,
        [e.target.name]:
          e.target.value,
      })
    }

  const handleSubmit =
    async (e) => {
      e.preventDefault()

      setError('')

      if (!token) {
        setError(
          'Invalid reset token.'
        )
        return
      }

      if (
        !form.password
      ) {
        setError(
          'Password is required.'
        )
        return
      }

      if (
        form.password.length < 8
      ) {
        setError(
          'Password must be at least 8 characters.'
        )
        return
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError(
          'Passwords do not match.'
        )
        return
      }

      try {

        await resetPassword({
          token,
          password:
            form.password,
        })

        setTimeout(() => {
          navigate('/login', {
            state: {
              notice:
              'Password reset successful. Please login.'
            }
          })
        }, 2000)

      } catch (err) {
        setError(
          err.message
        )
      }
    }

  return (
    <div className="auth-split">

      <div className="auth-panel auth-panel--form">

        <div className="auth-form-inner">

          <h2 className="auth-form__heading">
            Reset password
          </h2>

          <p className="auth-form__sub">
            Enter a new password
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
            onSubmit={
              handleSubmit
            }
            className="auth-form"
          >

            <div className="auth-field">

              <label className="auth-field__label">
                New Password
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
                className="auth-field__input"
              />

            </div>

            <div className="auth-field">

              <label className="auth-field__label">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={
                  handleChange
                }
                className="auth-field__input"
              />

            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              className="auth-btn-primary"
            >
              {loading
                ? 'Updating...'
                : 'Reset Password'}
            </button>

          </form>

          <p className="auth-switch">
            <Link
              to="/login"
              className="auth-switch__link"
            >
              Back to login
            </Link>
          </p>

        </div>

      </div>

    </div>
  )
}