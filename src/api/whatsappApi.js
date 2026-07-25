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

/** GET /whatsapp/business-profile — fetch WhatsApp Business Profile from Meta */
export async function fetchWhatsappBusinessProfile() {
  const res = await fetch(`${API_BASE}/whatsapp/business-profile`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to fetch WhatsApp Business Profile')
  return body?.data ?? null
}

/** PUT /whatsapp/business-profile — update WhatsApp Business Profile on Meta */
export async function updateWhatsappBusinessProfile(fields) {
  const res = await fetch(`${API_BASE}/whatsapp/business-profile`, {
    method: 'PUT',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(fields),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to update WhatsApp Business Profile')
  return body?.data ?? body
}

/** DELETE /whatsapp/disconnect — remove WhatsApp account */
export async function disconnectWhatsapp() {
  const res = await fetch(`${API_BASE}/whatsapp/disconnect`, {
    method: 'DELETE',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to disconnect WhatsApp')
  return body?.data ?? body
}

/** POST /whatsapp/profile-picture — upload and set WhatsApp profile picture */
export async function uploadWhatsappProfilePicture(file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${API_BASE}/whatsapp/profile-picture`, {
    method: 'POST',
    headers: { accept: 'application/json', ...authHeaders() },
    body: formData,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to upload profile picture')
  return body?.data ?? body
}

/** POST /whatsapp/display-name — request display name change (Meta must approve) */
export async function requestWhatsappDisplayNameChange(displayName) {
  const res = await fetch(`${API_BASE}/whatsapp/display-name`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ displayName }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to request display name change')
  return body?.data ?? body
}

/** POST /whatsapp/connect — exchange OAuth code for long-lived token */
export async function connectWhatsapp({ code, redirectUri, wabaId, phoneNumberId, businessManagerId, catalogId }) {
  const res = await fetch(`${API_BASE}/whatsapp/connect`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ code, redirectUri, wabaId, phoneNumberId, businessManagerId, catalogId }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || 'Failed to connect WhatsApp')
  return body?.data ?? body
}
