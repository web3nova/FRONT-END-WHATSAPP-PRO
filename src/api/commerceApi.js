import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function api(url, opts = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { accept: 'application/json', 'Content-Type': 'application/json', ...authHeaders() },
    ...opts,
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`)
  return body?.data ?? body
}

// ── Commerce Setup ──
export const getCommerceStatus = () => api('/whatsapp/commerce')

export const setupCommerce = (businessManagerId) =>
  api('/whatsapp/commerce/setup', { method: 'POST', body: JSON.stringify({ businessManagerId }) })

export const enableCommerce = () =>
  api('/whatsapp/commerce/enable', { method: 'POST' })

export const syncArrangement = (arrangementId) =>
  api('/whatsapp/commerce/sync', { method: 'POST', body: JSON.stringify({ arrangementId }) })

// ── Arrangements ──
export const listArrangements = () => api('/whatsapp/catalog/arrangements')

export const getArrangement = (id) => api(`/whatsapp/catalog/arrangements/${id}`)

export const createArrangement = (data) =>
  api('/whatsapp/catalog/arrangements', { method: 'POST', body: JSON.stringify(data) })

export const updateArrangement = (id, data) =>
  api(`/whatsapp/catalog/arrangements/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteArrangement = (id) =>
  api(`/whatsapp/catalog/arrangements/${id}`, { method: 'DELETE' })

export const setDefaultArrangement = (id) =>
  api(`/whatsapp/catalog/arrangements/${id}/set-default`, { method: 'POST' })

// ── Sections ──
export const listSections = (arrangementId) =>
  api(`/whatsapp/catalog/arrangements/${arrangementId}/sections`)

export const createSection = (data) =>
  api('/whatsapp/catalog/sections', { method: 'POST', body: JSON.stringify(data) })

export const updateSection = (id, data) =>
  api(`/whatsapp/catalog/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteSection = (id) =>
  api(`/whatsapp/catalog/sections/${id}`, { method: 'DELETE' })

export const reorderSections = (items) =>
  api('/whatsapp/catalog/sections/reorder', { method: 'PUT', body: JSON.stringify({ items }) })

// ── Items ──
export const listItems = (sectionId) =>
  api(`/whatsapp/catalog/sections/${sectionId}/items`)

export const addItemToSection = (data) =>
  api('/whatsapp/catalog/items', { method: 'POST', body: JSON.stringify(data) })

export const removeItemFromSection = (id) =>
  api(`/whatsapp/catalog/items/${id}`, { method: 'DELETE' })

export const reorderItems = (items) =>
  api('/whatsapp/catalog/items/reorder', { method: 'PUT', body: JSON.stringify({ items }) })

// ── Products (for adding to catalog) ──
export const listProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api(`/products${qs ? `?${qs}` : ''}`)
}
