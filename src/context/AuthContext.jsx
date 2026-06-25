import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'

const AuthContext = createContext(null)

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

  // Store authenticated user
  const login = (userData) => {
    setUser(userData)

    localStorage.setItem(
      'user',
      JSON.stringify(
        userData
      )
    )
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

  // Subscription management
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