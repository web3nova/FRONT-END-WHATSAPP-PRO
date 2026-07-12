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

export function resolveImageUrl(url) {
  if (!url) return ''
  // Strip known backend origins so images load from the current origin
  // (bypasses Cross-Origin-Resource-Policy issues via Vite proxy in dev)
  const KNOWN_ORIGINS = [
    API_ORIGIN,
    'http://localhost:5173',
    'https://localhost:5173',
  ]
  for (const origin of KNOWN_ORIGINS) {
    if (origin && url.startsWith(origin)) return url.slice(origin.length)
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
