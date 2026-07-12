import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_ORIGIN = (() => {
  try {
    const raw = (import.meta.env.VITE_API_URL || '').trim()
    const url = new URL(raw.startsWith('http') ? raw : `http://${raw}`)
    return url.origin
  } catch {
    return ''
  }
})()

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export function resolveImageUrl(url) {
  if (!url) return ''
  // Strip incorrectly stored localhost:5173 prefix (old bug).
  // These become relative paths; Vite proxy rewrites them in dev.
  if (url.startsWith('http://localhost:5173')) return url.slice(21)
  if (url.startsWith('https://localhost:5173')) return url.slice(22)

  // On localhost, strip the backend origin so Vite proxy handles
  // Cross-Origin-Resource-Policy. On production, keep the full URL.
  if (isLocalhost && API_ORIGIN && url.startsWith(API_ORIGIN)) {
    return url.slice(API_ORIGIN.length)
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`
  return url
}

export function slugify(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
