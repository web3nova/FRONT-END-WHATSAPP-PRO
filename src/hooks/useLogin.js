import { useState } from 'react'
import { API_BASE } from '../lib/apiConfig'

const API_URL = `${API_BASE}/auth/login`

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

      const authData = result.data || result
      const accessToken = authData.accessToken || authData.token || authData.access_token || authData.tokens?.accessToken || authData.tokens?.access_token || authData.tokens?.token
      const refreshToken = authData.refreshToken || authData.refresh_token || authData.tokens?.refreshToken || authData.tokens?.refresh_token
      const user = authData.user || authData.profile || authData

      if (!accessToken) {
        throw new Error('Login response did not include an access token.')
      }

      // Save tokens
      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      return {
        ...authData,
        user,
        accessToken,
        refreshToken,
      }

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