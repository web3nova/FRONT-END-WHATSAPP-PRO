import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /coupons
 * Returns Coupon[]
 */
export async function listCoupons() {
  const res = await fetch(`${API_BASE}/coupons`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load coupons (${res.status})`)
  return body?.data ?? []
}

/**
 * POST /coupons
 * Accepts { code, type: 'percent'|'fixed', value, minSubtotal?, expiresAt?, maxUses?, active? }
 * Returns created Coupon
 */
export async function createCoupon(data) {
  const res = await fetch(`${API_BASE}/coupons`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to create coupon (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /coupons/:id
 * Accepts partial coupon fields
 * Returns updated Coupon
 */
export async function updateCoupon(id, data) {
  const res = await fetch(`${API_BASE}/coupons/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to update coupon (${res.status})`)
  return body?.data ?? body
}

/**
 * DELETE /coupons/:id
 */
export async function deleteCoupon(id) {
  const res = await fetch(`${API_BASE}/coupons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || `Failed to delete coupon (${res.status})`)
  }
  return true
}
