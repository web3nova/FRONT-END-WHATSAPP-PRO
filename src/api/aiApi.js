import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * POST /ai/chat
 * Sends a message and returns { reply, steps, truncated? }
 */
export async function sendChatMessage({ conversationId, message, customerId }) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ conversationId, message, customerId }),
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(body?.message || `AI request failed (${res.status})`)
  }

  return body?.data ?? body
}

/**
 * DELETE /ai/memory/:conversationId
 * Clears the short-term memory for a conversation.
 */
export async function clearMemory(conversationId) {
  const res = await fetch(`${API_BASE}/ai/memory/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
    headers: { accept: 'application/json', ...authHeaders() },
  })

  if (!res.ok) throw new Error('Failed to clear memory')
  const body = await res.json().catch(() => null)
  return body?.data ?? body
}
