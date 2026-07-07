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
