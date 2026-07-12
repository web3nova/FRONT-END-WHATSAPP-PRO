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
  // Strip the backend origin so images load from the current origin.
  // On localhost the Vite dev proxy rewrites /assets/ to the backend;
  // on Vercel the edge middleware does the same — keeps images same-origin
  // and avoids Cross-Origin-Resource-Policy blocks.
  if (API_ORIGIN && url.startsWith(API_ORIGIN)) return url.slice(API_ORIGIN.length)
  // Strip incorrectly stored localhost:5173 prefix (old backend bug).
  if (url.startsWith('http://localhost:5173')) return url.slice(21)
  if (url.startsWith('https://localhost:5173')) return url.slice(22)
  // Already a relative path — keep as-is.
  if (url.startsWith('/')) return url
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
