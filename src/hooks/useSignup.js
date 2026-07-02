import { useState } from 'react'
import { API_BASE } from '../lib/apiConfig'

const API_URL = `${API_BASE}/auth/register`

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

      let data
      const responseText = await response.text()
      
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response:', responseText)
        throw new Error('Server returned invalid response format. Please try again.')
      }

      if (!response.ok) {
        // Extract error message from various possible formats
        let errorMessage = 'Signup failed'
        
        if (data) {
          // Handle different API error response formats
          if (typeof data === 'string') {
            errorMessage = data
          } else if (data.message) {
            errorMessage = data.message
          } else if (data.error) {
            errorMessage = data.error
          } else if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors[0]?.msg || data.errors[0]?.message || 'Validation failed'
          } else if (data.detail) {
            errorMessage = data.detail
          } else {
            // If we can't find a message, create one from the status
            errorMessage = `Server error (${response.status}): ${response.statusText}`
          }
        }
        
        throw new Error(errorMessage)
      }

      return data
    } catch (err) {
      // Handle network errors specifically
      let errorMessage = err.message
      
      if (err.message === 'Failed to fetch' || err.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (err.message === 'Unexpected end of JSON input' || err.message.includes('JSON')) {
        errorMessage = 'Server returned an invalid response. Please try again.'
      } else if (err.message.includes('timeout') || err.message.includes('abort')) {
        errorMessage = 'Request timed out. Please try again.'
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
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