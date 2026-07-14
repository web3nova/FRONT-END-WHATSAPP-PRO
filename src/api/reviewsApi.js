import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /reviews?status=pending|approved|rejected
 * Returns { items: Review[], total: number }
 */
export async function listReviews(status = 'pending') {
  const res = await fetch(`${API_BASE}/reviews?status=${encodeURIComponent(status)}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load reviews (${res.status})`)
  return body?.data ?? { items: [], total: 0 }
}

/**
 * PATCH /reviews/:id
 * Accepts { status: 'approved' | 'rejected' }
 * Returns updated Review
 */
export async function updateReviewStatus(id, status) {
  const res = await fetch(`${API_BASE}/reviews/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update review (${res.status})`)
  return body?.data ?? body
}
