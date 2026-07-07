import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * POST /notifications/send
 * Accepts { channel: 'email'|'whatsapp'|'sms', to, text, subject?, html? }
 * Returns { sent: true }
 */
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
