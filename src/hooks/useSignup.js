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

      const data = await response.json()

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