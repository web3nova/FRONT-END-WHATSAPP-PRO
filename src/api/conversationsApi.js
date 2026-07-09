import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /conversations?page=&limit=
 * Returns { data: Conversation[], meta: { page, limit, total } }
 */
export async function listConversations({ page = 1, limit = 25 } = {}) {
  const params = new URLSearchParams({ page, limit })
  const res = await fetch(`${API_BASE}/conversations?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load conversations (${res.status})`)
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { page, limit, total: 0 },
  }
}

/**
 * GET /conversations/:id/messages?page=&limit=
 * Returns { data: Message[], meta }
 */
export async function getConversationMessages(id, { page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit })
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(id)}/messages?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to load messages (${res.status})`)
  return {
    data: body?.data ?? [],
    meta: body?.meta ?? { page, limit, total: 0 },
  }
}

/**
 * PATCH /conversations/:id/take-over — staff takes over, AI paused
 */
export async function takeOverConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(id)}/take-over`, {
    method: 'PATCH',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to take over (${res.status})`)
  return body?.data ?? body
}

/**
 * PATCH /conversations/:id/release — release back to AI
 */
export async function releaseConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(id)}/release`, {
    method: 'PATCH',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to release (${res.status})`)
  return body?.data ?? body
}

/**
 * POST /conversations/:id/messages — staff sends a message (saved to DB)
 */
export async function sendStaffMessage(id, text) {
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', ...authHeaders() },
    body: JSON.stringify({ text }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to send message (${res.status})`)
  return body?.data ?? body
}

/**
 * Subscribe to real-time conversation events via SSE.
 * Returns a cleanup function — call it to close the stream.
 * @param {{ onMessage: (event, data) => void }} handlers
 */
export function subscribeToEvents({ onMessage }) {
  let es = null
  let destroyed = false

  function connect() {
    const token = localStorage.getItem('accessToken')
    if (!token || destroyed) return

    const url = `${API_BASE}/conversations/events?token=${encodeURIComponent(token)}`
    es = new EventSource(url)

    es.addEventListener('new_message', (e) => {
      try { onMessage('new_message', JSON.parse(e.data)) } catch {}
    })
    es.addEventListener('ai_message', (e) => {
      try { onMessage('ai_message', JSON.parse(e.data)) } catch {}
    })
    es.addEventListener('conversation_updated', (e) => {
      try { onMessage('conversation_updated', JSON.parse(e.data)) } catch {}
    })
    es.addEventListener('staff_message', (e) => {
      try { onMessage('staff_message', JSON.parse(e.data)) } catch {}
    })

    es.onerror = () => {
      if (destroyed) return
      if (es.readyState === EventSource.CLOSED) {
        es = null
        // Reconnect in 3s with whatever token is in storage.
        // If the token expired, apiFetch will have already refreshed it (or
        // redirected to /login), so we just pick up the latest value.
        setTimeout(() => { if (!destroyed) connect() }, 3000)
      }
    }
  }

  connect()
  return () => { destroyed = true; es?.close(); es = null }
}

/**
 * PATCH /conversations/:id/resolve
 * Returns { resolved: true, conversation }
 */
export async function resolveConversation(id) {
  const res = await fetch(`${API_BASE}/conversations/${encodeURIComponent(id)}/resolve`, {
    method: 'PATCH',
    headers: { accept: 'application/json', ...authHeaders() },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Failed to resolve conversation (${res.status})`)
  return body?.data ?? body
}
