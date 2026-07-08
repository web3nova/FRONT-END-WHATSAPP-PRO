import { useEffect } from 'react'
import { Star } from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────────────
// Fallbacks when no template theme is passed (e.g. templateId not set yet).
export const DEFAULT_INK = '#14110F'
export const DEFAULT_CREAM = '#FBF3E1'
export const DEFAULT_GOLD = '#E8A93D'
export const DEFAULT_FONT = 'Playfair Display'
export const DEFAULT_RADIUS = 16
export const BODY = "'Inter', ui-sans-serif, system-ui, sans-serif"
const DEFAULT_ACTIVE = { 1: true, 2: true, 3: true, 4: false, 5: true, 6: true }

export function isSectionActive(settings, id) {
  const found = settings?.sections?.find(s => s.id === id)
  return found ? !!found.active : (DEFAULT_ACTIVE[id] ?? true)
}

// Lighten a hex color toward white by `ratio` (0..1, higher = lighter) — used
// to derive pastel product/category tile backgrounds from the theme's accent,
// instead of a fixed palette unrelated to the chosen theme.
export function mixHexWithWhite(hex, ratio) {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  const lighten = c => Math.round(c + (255 - c) * ratio)
  return `#${[lighten(r), lighten(g), lighten(b)].map(c => c.toString(16).padStart(2, '0')).join('')}`
}

export function socialHref(platform, value) {
  if (!value) return null
  if (value.startsWith('http')) return value
  const bases = { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', twitter: 'https://x.com/', tiktok: 'https://tiktok.com/@', youtube: 'https://youtube.com/@' }
  return (bases[platform] || '') + value.replace(/^@/, '')
}

export function isSoldOut(p) {
  return typeof p.stock === 'number' && p.stock <= 0
}

// Load a template's Google Font heading face on demand — each font keys its
// own <link> so switching templates doesn't refetch a font already loaded.
export function useThemeFont(fontName) {
  useEffect(() => {
    const linkId = `sf-display-font-${fontName.replace(/\s+/g, '-')}`
    if (document.getElementById(linkId)) return
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap`
    document.head.appendChild(link)
  }, [fontName])
}

export function Stars({ value = 5, size = 12, color = DEFAULT_INK }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < value ? color : 'none'} style={{ color }} strokeWidth={1.5} />
      ))}
    </div>
  )
}

export function GoogleMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.5 30.4 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.8 6.1C12.3 13.1 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
      <path fill="#FBBC05" d="M10.3 19.3c-.5 1.4-.7 3-.7 4.7s.3 3.3.7 4.7l-7.8 6.1C.9 31.6 0 27.9 0 24s.9-7.6 2.5-10.8z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.2-8.6 2.2-6.4 0-11.7-3.6-13.7-8.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export const Facebook = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
export const Instagram = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
export const Twitter = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
export const Youtube = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)
export const TikTok = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.19 8.19 0 0 0 4.78 1.52V7.08a4.85 4.85 0 0 1-1.01-.39z"/>
  </svg>
)
