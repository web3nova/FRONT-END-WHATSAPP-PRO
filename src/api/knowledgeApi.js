import { API_BASE } from '../lib/apiConfig'

function authHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** GET /knowledge/documents — list all uploaded documents for the tenant */
export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/knowledge/documents`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  if (!res.ok) throw new Error('Failed to load documents')
  const body = await res.json()
  return body?.data ?? []
}

/** POST /knowledge/upload — upload a file (multipart/form-data, field: file) */
export async function uploadDocument(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/knowledge/upload`)

    const token = localStorage.getItem('accessToken')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body?.data ?? body)
        } else {
          reject(new Error(body?.message || `Upload failed (${xhr.status})`))
        }
      } catch {
        reject(new Error('Invalid server response'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}

/** GET /knowledge/search?q=...&topK=5 — semantic search */
export async function searchKnowledge(query, topK = 5) {
  const params = new URLSearchParams({ q: query, topK })
  const res = await fetch(`${API_BASE}/knowledge/search?${params}`, {
    headers: { accept: 'application/json', ...authHeaders() },
  })
  if (!res.ok) throw new Error('Search failed')
  const body = await res.json()
  return body?.data ?? []
}
