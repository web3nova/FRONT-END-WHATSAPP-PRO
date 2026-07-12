const raw = (import.meta.env.VITE_API_URL || '').trim()
console.log('[apiConfig] VITE_API_URL raw:', JSON.stringify(import.meta.env.VITE_API_URL))
console.log('[apiConfig] API_BASE:', raw)
export const API_BASE = raw
