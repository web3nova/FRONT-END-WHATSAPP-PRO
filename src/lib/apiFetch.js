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

  // Skip the request entirely if there's no token (background polls shouldn't create noise)
  if (!token) return new Response(JSON.stringify({}), { status: 401 })

  const { noRedirect, ...fetchOptions } = options

  const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(fetchOptions.headers || {}),
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`

  const res = await fetch(url, { ...fetchOptions, headers })

  if (res.status === 401 && !noRedirect) {
    clearAuthAndRedirect()
    return new Promise(() => {})
  }

  return res
}
