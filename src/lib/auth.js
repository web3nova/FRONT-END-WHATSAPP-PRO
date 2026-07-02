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

function parseStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') || {}
  } catch {
    return {}
  }
}

export function getStoredAccessToken() {
  const candidates = [
    localStorage.getItem('accessToken'),
    localStorage.getItem('token'),
    localStorage.getItem('access_token'),
    localStorage.getItem('authToken'),
    localStorage.getItem('jwt'),
    parseStoredUser()?.accessToken,
    parseStoredUser()?.token,
    parseStoredUser()?.access_token,
    parseStoredUser()?.tokens?.accessToken,
    parseStoredUser()?.tokens?.token,
    parseStoredUser()?.tokens?.access_token,
  ]

  const token = candidates.find((candidate) => isValidAccessToken(candidate))
  return token || null
}

export function clearStoredAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('authToken')
  localStorage.removeItem('jwt')
}

export function getAuthHeaders(token) {
  return {
    accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? {
      Authorization: `Bearer ${token}`,
      'x-access-token': token,
      'x-auth-token': token,
    } : {}),
  }
}
