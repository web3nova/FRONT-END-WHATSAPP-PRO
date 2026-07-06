import { useState, useCallback } from 'react'
import { API_BASE } from '../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders, clearStoredAuth } from '../lib/auth'

const BASE = `${API_BASE}/onboarding`

function getToken() {
  const token = getStoredAccessToken()
  if (!token) {
    clearStoredAuth()
    throw new Error('Authentication token is invalid. Please sign in again.')
  }
  return token
}

export function useOnboarding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const checkStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/status`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      })
      if (!res.ok) {
        throw new Error('Failed to check onboarding status')
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

  const createProfile = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(BASE, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to create business profile')
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

  const getProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(BASE, {
        method: 'GET',
        headers: getAuthHeaders(token),
      })
      if (!res.ok) {
        throw new Error('Failed to fetch profile')
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

  const updateProfile = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await fetch(BASE, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to update profile')
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

  return {
    checkStatus,
    createProfile,
    getProfile,
    updateProfile,
    loading,
    error,
    data,
  }
}
