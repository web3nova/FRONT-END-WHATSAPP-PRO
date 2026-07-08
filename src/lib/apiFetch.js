import { API_BASE } from './apiConfig'
import { clearStoredAuth } from './auth'

function clearAuthAndRedirect() {
  clearStoredAuth()
  localStorage.removeItem('user')
  localStorage.removeItem('subscription')
  window.location.replace('/login')
}

// Single in-flight refresh promise — prevents stampede when multiple requests 401 simultaneously
let refreshPromise = null

async function tryRefresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newToken = data?.data?.accessToken || data?.accessToken
    if (!newToken) return null
    localStorage.setItem('accessToken', newToken)
    return newToken
  } catch {
    return null
  }
}

/**
 * Thin fetch wrapper that:
 * - Prepends API_BASE to relative paths
 * - Injects Authorization header from localStorage
 * - On 401 → tries to refresh the access token silently, retries once
 * - If refresh fails → clears auth and redirects to /login
 * - noRedirect option: swallows 401 silently (for background polls)
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')

  if (!token) return new Response(JSON.stringify({}), { status: 401 })

  const { noRedirect, ...fetchOptions } = options

  const makeRequest = (accessToken) => {
    const headers = {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(fetchOptions.headers || {}),
    }
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`
    return fetch(url, { ...fetchOptions, headers })
  }

  let res = await makeRequest(token)

  if (res.status === 401) {
    if (noRedirect) return res

    // Try to refresh — deduplicate concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => { refreshPromise = null })
    }
    const newToken = await refreshPromise

    if (newToken) {
      // Retry the original request with the fresh token
      res = await makeRequest(newToken)
      if (res.status !== 401) return res
    }

    // Refresh failed or retry still 401 — log out
    clearAuthAndRedirect()
    return new Promise(() => {})
  }

  return res
}
