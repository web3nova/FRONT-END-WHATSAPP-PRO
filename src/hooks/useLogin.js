import { useState } from 'react'

const API_URL =
`${import.meta.env.VITE_API_URL}/auth/login`

export function useLogin() {
  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const login = async ({
    email,
    password,
  }) => {
    try {
      setLoading(true)
      setError(null)

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
            email,
            password,
          }),
        })

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Login failed'
        )
      }

      const authData =
        result.data

      // Save tokens
      localStorage.setItem(
        'accessToken',
        authData.accessToken
      )

      localStorage.setItem(
        'refreshToken',
        authData.refreshToken
      )

      return authData

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    loading,
    error,
  }
}