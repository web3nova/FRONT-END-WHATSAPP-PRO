const API_BASE = 'https://back-end-whatsapp-pro.onrender.com/api/v1'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Fetch all available billing plans.
 * GET /billing/plans
 */
export async function fetchPlans() {
  const res = await fetch(`${API_BASE}/billing/plans`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Failed to load plans. Please try again.')
  }

  const data = await res.json()

  // Backend may return either a bare array or { data: [...] } / { plans: [...] }
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.plans)) return data.plans

  return []
}

/**
 * Initialize a Monnify checkout for a given plan.
 * POST /billing/initialize
 *
 * Requires auth — the curl example confirms this endpoint expects
 * Authorization: Bearer <accessToken>. Without it this will 401, or
 * (worse) succeed against the wrong tenant if the backend doesn't
 * reject missing auth strictly.
 *
 * Confirmed response shape:
 * {
 *   "success": true,
 *   "data": {
 *     "checkoutUrl": "https://sdk.monnify.com/checkout/...",
 *     "reference": "SUB-..."
 *   }
 * }
 */
export async function initializePayment(planId) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    throw new Error('You need to be signed in to start checkout.')
  }

  const res = await fetch(`${API_BASE}/billing/initialize`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ planId }),
  })

  let body = null
  try {
    body = await res.json()
  } catch {
    // non-JSON response
  }

  if (!res.ok || body?.success === false) {
    const message = body?.message || 'Could not start checkout. Please try again.'
    throw new Error(message)
  }

  const { checkoutUrl, reference } = body?.data || {}

  if (!checkoutUrl) {
    throw new Error('Checkout could not be started. Please try again.')
  }

  // Stash the reference so the callback page can verify status after redirect back
  sessionStorage.setItem('pendingPaymentReference', reference || '')

  return { checkoutUrl, reference }
}

/**
 * ⚠️ NOT YET BACKED BY A REAL ENDPOINT.
 *
 * There is currently no confirmed GET /billing/status/:reference (or
 * equivalent "what's my current subscription" route) on the backend.
 * The webhook (POST /billing/webhook) updates payment status server-side,
 * but the frontend has no confirmed way to read that result back yet.
 *
 * DO NOT wire this into the callback page until one of these exists and
 * you've confirmed its real path + response shape:
 *   - GET /billing/status/:reference  -> { status: 'paid' | 'pending' | 'failed', ... }
 *   - GET /billing/subscription       -> { plan, status, expiresAt, ... } for the logged-in tenant
 *
 * Once confirmed, update the path below and adjust the returned field
 * names to match the real response.
 */
export async function getPaymentStatus(reference) {
  const res = await fetch(`${API_BASE}/billing/status/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: { accept: 'application/json', ...authHeaders() },
  })

  if (!res.ok) {
    throw new Error('Could not check payment status.')
  }

  const body = await res.json()
  return body?.data || body
}