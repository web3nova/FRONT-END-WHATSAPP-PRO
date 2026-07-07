import { API_BASE } from './apiConfig'
import { clearStoredAuth } from './auth'

function clearAuthAndRedirect() {
  clearStoredAuth()
  localStorage.removeItem('user')
  localStorage.removeItem('subscription')
  // Use location.replace so the login page isn't in the back-stack
  window.location.replace('/login')
}

/**
 * Thin fetch wrapper that:
 * - Prepends API_BASE to relative paths
 * - Injects Authorization header from localStorage
 * - On 401 → clears auth state and redirects to /login
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')

  const headers = {
    accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    clearAuthAndRedirect()
    // Return a never-resolving promise — the redirect is happening
    return new Promise(() => {})
  }

  return res
}
