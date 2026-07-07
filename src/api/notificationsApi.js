import { apiFetch } from '../lib/apiFetch'
import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function sendNotification({ channel, to, text, subject, html }) {
  const res = await fetch(`${API_BASE}/notifications/send`, {
    method: 'POST',
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ channel, to, text, ...(subject ? { subject } : {}), ...(html ? { html } : {}) }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to send notification (${res.status})`)
  return body?.data ?? body
}

export async function listNotifications() {
  const res = await apiFetch('/notifications')
  const body = await res.json().catch(() => null)
  return body?.data ?? { items: [], unread: 0 }
}

export async function markAllRead() {
  await apiFetch('/notifications/read-all', { method: 'PATCH' })
}

export async function markOneRead(id) {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
}

export async function getNotificationPrefs() {
  const res = await apiFetch('/notifications/preferences')
  const body = await res.json().catch(() => null)
  return body?.data ?? {}
}

export async function patchNotificationPrefs(prefs) {
  const res = await apiFetch('/notifications/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })
  const body = await res.json().catch(() => null)
  return body?.data ?? prefs
}
