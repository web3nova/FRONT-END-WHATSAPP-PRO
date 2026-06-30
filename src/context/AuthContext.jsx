import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext = createContext(null)

const TRIAL_DAYS = 14

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    try {
      // Restore user session
      const storedUser =
        localStorage.getItem('user')

      const storedSubscription =
        localStorage.getItem(
          'subscription'
        )

      const accessToken =
        localStorage.getItem(
          'accessToken'
        )

      if (
        storedUser &&
        accessToken
      ) {
        setUser(
          JSON.parse(
            storedUser
          )
        )
      }

      if (
        storedSubscription
      ) {
        setSubscription(
          JSON.parse(
            storedSubscription
          )
        )
      }
    } catch (error) {
      console.error(
        'Error restoring session:',
        error
      )

      // Clear corrupted storage
      localStorage.removeItem(
        'user'
      )

      localStorage.removeItem(
        'subscription'
      )

      localStorage.removeItem(
        'accessToken'
      )

      localStorage.removeItem(
        'refreshToken'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Store authenticated user + tokens.
  // `tokens` is optional so existing callers that only pass userData don't break,
  // but the billing API requires accessToken to be set or every authenticated
  // request (including initializePayment) will go out unauthenticated/fail.
  const login = (userData, tokens = {}) => {
    setUser(userData)

    localStorage.setItem(
      'user',
      JSON.stringify(
        userData
      )
    )

    if (tokens.accessToken) {
      localStorage.setItem('accessToken', tokens.accessToken)
    }

    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }
  }

  // Update user data later if needed
  const updateUser = (
    updatedData
  ) => {
    const updatedUser = {
      ...user,
      ...updatedData,
    }

    setUser(updatedUser)

    localStorage.setItem(
      'user',
      JSON.stringify(
        updatedUser
      )
    )
  }

  // Logout user
  const logout = () => {
    setUser(null)
    setSubscription(null)

    localStorage.removeItem(
      'user'
    )

    localStorage.removeItem(
      'subscription'
    )

    localStorage.removeItem(
      'accessToken'
    )

    localStorage.removeItem(
      'refreshToken'
    )
  }

  // Subscription management (paid plan, confirmed via checkout + webhook)
  const selectPlan = (
    plan
  ) => {
    const sub = {
      plan,
      startDate:
        new Date().toISOString(),
      status: 'active',
    }

    setSubscription(sub)

    localStorage.setItem(
      'subscription',
      JSON.stringify(sub)
    )
  }

  // ⚠️ CLIENT-ONLY TRIAL — there is no backend trial endpoint yet.
  // This only sets local/localStorage state. It is NOT enforced server-side,
  // so anyone who edits localStorage can grant themselves a trial or extend
  // an expired one, and a trial started here is invisible to the backend
  // (e.g. it won't show up if you build an admin view of subscriptions later).
  // Replace the body of this function with a real API call as soon as a
  // POST /billing/trial (or similar) endpoint exists, and keep the local
  // state update for instant UI feedback.
  const startFreeTrial = async () => {
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + TRIAL_DAYS)

    const sub = {
      plan: 'trial',
      status: 'trial',
      startDate: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }

    setSubscription(sub)

    localStorage.setItem(
      'subscription',
      JSON.stringify(sub)
    )

    return sub
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,

        login,
        logout,
        updateUser,
        selectPlan,
        startFreeTrial,

        isAuthenticated:
          !!user,

        hasSubscription:
          !!subscription,
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