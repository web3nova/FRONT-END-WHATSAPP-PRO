import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /customers?page=&limit=
 * Returns { data: Customer[], meta: { page, limit, total } }
 */
export async function listCustomers({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit })
  const res = await fetch(`${API_BASE}/customers?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load customers (${res.status})`)
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { page, limit, total: 0 },
  }
}

/**
 * GET /customers/:id
 * Returns Customer
 */
export async function getCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(id)}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Customer not found (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /customers/:id
 * Accepts { name?, meta? }
 * Returns updated Customer
 */
export async function updateCustomer(id, data) {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update customer (${res.status})`)
  return body?.data ?? body
}

/**
 * DELETE /customers/:id
 * Returns 204 No Content on success
 */
export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  if (res.status === 204) return true
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to delete customer (${res.status})`)
  return true
}

/**
 * POST /customers/:id/message
 * Sends a WhatsApp message to this customer and persists it in their
 * conversation thread (unlike a bare notification, this shows up in the
 * WhatsApp inbox afterward).
 */
export async function sendCustomerMessage(id, text) {
  const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(id)}/message`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ text }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to send message (${res.status})`)
  return body?.data ?? body
}
