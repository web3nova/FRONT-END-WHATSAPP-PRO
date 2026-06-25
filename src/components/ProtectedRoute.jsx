import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Requires the user to be logged in
export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="auth-loading">Loading…</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Requires an active subscription after login
export function RequireSubscription({ children }) {
  const { isAuthenticated, hasSubscription, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="auth-loading">Loading…</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasSubscription) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  return children
}