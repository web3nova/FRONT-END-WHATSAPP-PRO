import { useState, useCallback } from 'react'
import onboardingApi from '../services/onboardingService'

export function useOnboarding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const checkStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await onboardingApi.checkStatus()
      setData(result)
      return result
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
      const result = await onboardingApi.submitWizard(payload)
      setData(result)
      return result
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
      const result = await onboardingApi.getWizard()
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
      const result = await onboardingApi.updateWizard(payload)
      setData(result)
      return result
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
