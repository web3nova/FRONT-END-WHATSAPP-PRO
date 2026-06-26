import { useState } from 'react'

const API_URL =
`${import.meta.env.VITE_API_URL}/auth/reset-password`

export function useResetPassword() {
  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [success, setSuccess] =
    useState(null)

  const resetPassword = async ({
    token,
    password,
  }) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL is not defined. Falling back to mock reset password.')
        await new Promise(r => setTimeout(r, 600))
        setSuccess('Password reset successful (mock).')
        return { message: 'Password reset successful (mock)' }
      }

      const response =
        await fetch(API_URL, {
          method: 'POST',
          headers: {
            Accept:
              'application/json',
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        })

      let result
      try {
        result = await response.json()
      } catch (err) {
        throw new Error('API server returned a non-JSON response. Please check if your backend server is running.')
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Password reset failed'
        )
      }

      setSuccess(
        result.message ||
        'Password reset successful'
      )

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    resetPassword,
    loading,
    error,
    success,
  }
}