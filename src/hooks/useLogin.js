import { useState } from 'react'
import { API_BASE } from '../lib/apiConfig'

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let result
  try { result = await res.json() } catch { throw new Error('Server returned an unexpected response.') }
  if (!res.ok) throw new Error(result.message || 'Request failed')
  return result.data || result
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 1: email + password → OTP sent
  const login = async ({ email, password }) => {
    try {
      setLoading(true)
      setError(null)
      const data = await post('/auth/login', { email, password })
      // Returns { requiresOtp: true, userId, email }
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Step 2: userId + 6-digit code → tokens
  const verifyOtp = async ({ userId, code }) => {
    try {
      setLoading(true)
      setError(null)
      const authData = await post('/auth/verify-otp', { userId, code })

      const accessToken = authData.accessToken || authData.token
      const refreshToken = authData.refreshToken

      if (!accessToken) throw new Error('Verification failed — no token returned.')

      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      else localStorage.removeItem('refreshToken')

      return { ...authData, accessToken, refreshToken, user: authData.user }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async ({ userId }) => {
    try {
      setLoading(true)
      setError(null)
      await post('/auth/resend-otp', { userId })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, verifyOtp, resendOtp, loading, error }
}