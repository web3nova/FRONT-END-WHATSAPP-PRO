import { useState } from 'react'
import { API_BASE } from '../lib/apiConfig'

const API_URL = `${API_BASE}/auth/forgot-password`

export function useForgotPassword() {
  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [success, setSuccess] =
    useState(null)

  const forgotPassword =
    async (email) => {
      try {
        setLoading(true)
        setError(null)
        setSuccess(null)

        const response =
          await fetch(API_URL,{
            method:'POST',
            headers:{
              Accept:'application/json',
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              email
            })
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
            'Failed to send reset email'
          )
        }

        setSuccess(
          result.message ||
          'Reset email sent successfully.'
        )

        return result

      } catch(err){
        setError(err.message)
        throw err
      } finally{
        setLoading(false)
      }
    }

  return {
    forgotPassword,
    loading,
    error,
    success,
  }
}