import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * POST /payments/initialize
 * Accepts { orderId, email, provider? }
 * Returns { authorizationUrl, reference }
 */
export async function initializeOrderPayment({ orderId, email, provider }) {
  const res = await fetch(`${API_BASE}/payments/initialize`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ orderId, email, ...(provider ? { provider } : {}) }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to initialize payment (${res.status})`)
  return body?.data ?? body
}

/**
 * GET /payments/:id
 * Returns Payment record
 */
export async function getPayment(id) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(id)}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Payment not found (${res.status})`)
  return body?.data ?? body
}
