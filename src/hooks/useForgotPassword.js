import { useState } from 'react'

const API_URL =
`${import.meta.env.VITE_API_URL}/auth/forgot-password`

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

        const result =
          await response.json()

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