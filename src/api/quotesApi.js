import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /quotes?status=&customerId=
 * Returns { data: Quote[], meta }
 *
 * status: draft | sent | accepted | rejected | cancelled
 */
export async function listQuotes({ status, customerId } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (customerId) params.set('customerId', customerId)

  const res = await fetch(`${API_BASE}/quotes?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load quotes (${res.status})`)
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { total: 0 },
  }
}

/**
 * GET /quotes/:id
 * Returns Quote
 */
export async function getQuote(id) {
  const res = await fetch(`${API_BASE}/quotes/${encodeURIComponent(id)}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Quote not found (${res.status})`)
  return body?.data ?? body
}

/**
 * POST /quotes
 * Accepts { customerId?, status?, amountMinor?, currency?, details? }
 * Returns created Quote
 */
export async function createQuote(data) {
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to create quote (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /quotes/:id/status
 * Accepts { status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled' }
 * Returns updated Quote
 */
export async function updateQuoteStatus(id, status) {
  const res = await fetch(`${API_BASE}/quotes/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update quote status (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /quotes/:id
 * Accepts any subset of quote fields
 * Returns updated Quote
 */
export async function updateQuote(id, data) {
  const res = await fetch(`${API_BASE}/quotes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update quote (${res.status})`)
  return body?.data ?? body
}
