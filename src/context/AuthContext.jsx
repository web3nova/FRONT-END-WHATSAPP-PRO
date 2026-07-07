import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { fetchSubscription } from '../api/billingApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  // Fetch the real subscription from the backend and update state
  const refreshSubscription = useCallback(async () => {
    setSubscriptionLoading(true)
    try {
      const sub = await fetchSubscription()
      setSubscription(sub)
      if (sub) {
        localStorage.setItem('subscription', JSON.stringify(sub))
      } else {
        localStorage.removeItem('subscription')
      }
    } catch {
      // non-fatal — leave existing subscription state as-is
    } finally {
      setSubscriptionLoading(false)
    }
  }, [])

  // Restore session on mount, then fetch real subscription from backend
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const accessToken = localStorage.getItem('accessToken')

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser))
      } else {
        setLoading(false)
        return
      }
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('subscription')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setLoading(false)
      return
    }

    setLoading(false)
    // Fetch real subscription state from backend (replaces stale localStorage value)
    refreshSubscription()
  }, [refreshSubscription])

  // Store authenticated user + tokens, then immediately fetch real subscription
  const login = useCallback(async (userData, tokens = {}) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))

    const resolvedAccessToken = tokens.accessToken || tokens.token || tokens.access_token || tokens.jwt
    const resolvedRefreshToken = tokens.refreshToken || tokens.refresh_token

    if (resolvedAccessToken) localStorage.setItem('accessToken', resolvedAccessToken)
    if (resolvedRefreshToken) localStorage.setItem('refreshToken', resolvedRefreshToken)

    // Fetch real subscription immediately after login
    await refreshSubscription()
  }, [refreshSubscription])

  const updateUser = useCallback((updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [user])

  const logout = useCallback(() => {
    setUser(null)
    setSubscription(null)
    localStorage.removeItem('user')
    localStorage.removeItem('subscription')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }, [])

  // Keep selectPlan for after a successful Monnify payment — refreshes from backend
  const selectPlan = useCallback(async () => {
    await refreshSubscription()
  }, [refreshSubscription])

  // startFreeTrial is now a no-op alias for refreshSubscription.
  // The backend already created the trial on register — just sync state.
  const startFreeTrial = useCallback(async () => {
    await refreshSubscription()
    return subscription
  }, [refreshSubscription, subscription])

  const isActive = subscription?.isActive === true

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        subscriptionLoading,

        login,
        logout,
        updateUser,
        selectPlan,
        startFreeTrial,
        refreshSubscription,

        isAuthenticated: !!user,
        hasSubscription: isActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}
