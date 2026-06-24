import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session on mount
    const storedUser = localStorage.getItem('user')
    const storedSubscription = localStorage.getItem('subscription')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedSubscription) {
      setSubscription(JSON.parse(storedSubscription))
    }
    setLoading(false)
  }, [])

  const signup = (userData) => {
    const newUser = { ...userData, id: Date.now(), hasSignedUp: true }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('hasSignedUp', 'true')
  }

  const login = (userData) => {
    const loggedInUser = { ...userData, hasSignedUp: true }
    setUser(loggedInUser)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
  }

  const logout = () => {
    setUser(null)
    setSubscription(null)
    localStorage.removeItem('user')
    localStorage.removeItem('subscription')
  }

  const selectPlan = (plan) => {
    const sub = { plan, startDate: new Date().toISOString(), status: 'active' }
    setSubscription(sub)
    localStorage.setItem('subscription', JSON.stringify(sub))
  }

  const hasSignedUpBefore = () => {
    return localStorage.getItem('hasSignedUp') === 'true'
  }

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      loading,
      signup,
      login,
      logout,
      selectPlan,
      hasSignedUpBefore,
      isAuthenticated: !!user,
      hasSubscription: !!subscription,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}