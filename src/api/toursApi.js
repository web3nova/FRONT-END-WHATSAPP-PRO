import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getTours() {
  const res = await fetch(`${API_BASE}/users/me/tours`, { headers: { accept: 'application/json', ...authHeaders() } })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to load tour progress')
  return body?.data ?? {}
}

export async function updateTours({ tourId, completedChapters, done }) {
  const res = await fetch(`${API_BASE}/users/me/tours`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ tourId, completedChapters, done }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to save tour progress')
  return body?.data ?? {}
}
