import { useState, useCallback } from 'react'
import { getStoredAccessToken, clearStoredAuth } from '../lib/auth'

const BASE = `${import.meta.env.VITE_API_URL || 'https://back-end-whatsapp-pro.onrender.com/api/v1'}/business`

function getToken() {
  const token = getStoredAccessToken()
  if (!token) {
    clearStoredAuth()
    throw new Error('Authentication token is invalid. Please sign in again.')
  }
  return token
}

function authHeaders(token) {
  return {
    accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export function useBusinessProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(BASE, {
        method: 'GET',
        headers: authHeaders(token),
      })
      if (!res.ok) {
        throw new Error('Failed to fetch business profile')
      }
      const json = await res.json()
      setData(json.data)
      return json.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const saveProfile = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(BASE, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          clearStoredAuth()
          throw new Error('Your session has expired. Please sign in again.')
        }
        throw new Error(json.error || json.message || `Request failed (${res.status})`)
      }
      setData(json.data)
      return json.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadLogo = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`${BASE}/logo`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || `Logo upload failed (${res.status})`)
      }
      return json.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getProfile,
    saveProfile,
    uploadLogo,
    loading,
    error,
    data,
  }
}
