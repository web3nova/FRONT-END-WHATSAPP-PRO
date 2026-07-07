import { useState, useCallback } from 'react'
import onboardingApi from '../services/onboardingService'

export function useBusinessProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const getProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await onboardingApi.getProfile()
      setData(result)
      return result
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
      const result = await onboardingApi.submitProfile(payload)
      setData(result)
      return result
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
      const result = await onboardingApi.updateProfile(payload)
      setData(result)
      return result
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
      const result = await onboardingApi.uploadLogo(file)
      return result
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
    updateProfile,
    uploadLogo,
    loading,
    error,
    data,
  }
}
