import { useState } from 'react'

const API_URL =
  `${import.meta.env.VITE_API_URL}/auth/register`

export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signup = async ({
    name,
    email,
    password,
    tenantName,
  }) => {
    try {
      setLoading(true)
      setError(null)

      if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL is not defined. Falling back to mock signup.')
        await new Promise(r => setTimeout(r, 600))
        return {
          message: 'Signup successful (mock)',
          data: {
            user: {
              email,
              name: name || email.split('@')[0],
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          }
        }
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          tenantName,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (err) {
        throw new Error('API server returned a non-JSON response. Please check if your backend server is running.')
      }

      if (!response.ok) {
        throw new Error(
          data.message || 'Signup failed'
        )
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    signup,
    loading,
    error,
  }
}