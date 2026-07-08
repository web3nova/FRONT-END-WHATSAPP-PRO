import { useState, useEffect } from 'react'

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function initials(name, email) {
  const src = name || email || '?'
  return src.split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase()
}

/**
 * Shows a Gravatar if the user has one, otherwise shows coloured initials.
 * Uses the SHA-256 Gravatar API (d=404 so we fallback on missing avatars).
 */
export default function GravatarAvatar({ email, name, size = 36, background = '#4166F5', className = '' }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!email) return
    let cancelled = false
    sha256Hex(email.trim().toLowerCase()).then(hash => {
      if (!cancelled) setSrc(`https://gravatar.com/avatar/${hash}?s=${size * 2}&d=404`)
    })
    return () => { cancelled = true }
  }, [email, size])

  const label = initials(name, email)
  const px = `${size}px`

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ width: px, height: px, background, fontSize: size * 0.35 }}
    >
      {label}
    </div>
  )
}
