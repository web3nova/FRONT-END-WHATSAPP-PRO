const MOCK_TOKEN_PATTERNS = [
  /^mock/i,
  /^undefined$/i,
  /^null$/i,
]

export function isValidAccessToken(token) {
  if (!token || typeof token !== 'string') {
    return false
  }

  const trimmed = token.trim()
  if (!trimmed) {
    return false
  }

  return !MOCK_TOKEN_PATTERNS.some((pattern) => pattern.test(trimmed))
}

export function getStoredAccessToken() {
  const token = localStorage.getItem('accessToken')
  return isValidAccessToken(token) ? token : null
}

export function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getAuthHeaders(token) {
  return {
    accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
