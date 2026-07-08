import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', accept: 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`)
  return data?.data ?? data
}

export const getTeamMembers = () => request('GET', '/team/members')

export const inviteMember = (email, role = 'member') =>
  request('POST', '/team/invites', { email, role })

export const cancelInvite = (inviteId) =>
  request('DELETE', `/team/invites/${inviteId}`)

export const removeMember = (userId) =>
  request('DELETE', `/team/members/${userId}`)

export const acceptInvite = (token, name, password) =>
  request('POST', '/auth/accept-invite', { token, name, password })
