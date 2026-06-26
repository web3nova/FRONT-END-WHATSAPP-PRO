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

      if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL is not defined. Falling back to mock authentication.')
        await new Promise(r => setTimeout(r, 600))
        const mockAuthData = {
          user: {
            email,
            name: email.split('@')[0] || 'User',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }
        localStorage.setItem('accessToken', mockAuthData.accessToken)
        localStorage.setItem('refreshToken', mockAuthData.refreshToken)
        return mockAuthData
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
            email,
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