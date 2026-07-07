import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** GET /whatsapp/account — returns connected account or null */
export async function fetchWhatsappAccount() {
  const res = await fetch(`${API_BASE}/whatsapp/account`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  if (res.status === 404) return null
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to fetch WhatsApp account')
  return body?.data ?? null
}

/** POST /whatsapp/connect — exchange OAuth code for long-lived token */
export async function connectWhatsapp({ code, redirectUri, wabaId, phoneNumberId }) {
  const res = await fetch(`${API_BASE}/whatsapp/connect`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ code, redirectUri, wabaId, phoneNumberId }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to connect WhatsApp')
  return body?.data ?? body
}
