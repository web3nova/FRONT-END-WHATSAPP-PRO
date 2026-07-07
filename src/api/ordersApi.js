import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /orders?status=&customerId=&page=&limit=
 * Returns { data: Order[], meta }
 *
 * status: pending | confirmed | paid | fulfilled | cancelled
 */
export async function listOrders({ status, customerId, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  if (customerId) params.set('customerId', customerId)

  const res = await fetch(`${API_BASE}/orders?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load orders (${res.status})`)
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { page, limit, total: 0 },
  }
}

/**
 * GET /orders/:id
 * Returns Order
 */
export async function getOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Order not found (${res.status})`)
  return body?.data ?? body
}

/**
 * POST /orders
 * Accepts { customerId?, status?, totalMinor?, currency?, items?, measurements? }
 * Returns created Order
 */
export async function createOrder(data) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to create order (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /orders/:id/status
 * Accepts { status: 'pending' | 'confirmed' | 'paid' | 'fulfilled' | 'cancelled' }
 * Returns updated Order
 */
export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update order status (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /orders/:id
 * Accepts any subset of order fields
 * Returns updated Order
 */
export async function updateOrder(id, data) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update order (${res.status})`)
  return body?.data ?? body
}
