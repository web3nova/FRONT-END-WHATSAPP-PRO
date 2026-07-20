import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken } from '../../lib/auth'

const PRIMARY = '#4166F5'

/**
 * Drop-in "AI Suggest" button for any form field group. Points at a given
 * backend endpoint, sends `payload`, and calls `onResult(data)` on success.
 * Deliberately fails silent — no error banner/toast — since a missed
 * suggestion on a convenience feature shouldn't clutter the form; the
 * merchant just fills the field manually like they would have anyway.
 */
export default function AiSuggestButton({ endpoint, payload, onResult, disabled, label = 'AI Suggest' }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading || disabled) return
    setLoading(true)
    try {
      const token = getStoredAccessToken()
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return // silent — see doc comment above
      const body = await res.json().catch(() => null)
      const data = body?.data ?? body
      if (data) onResult(data)
    } catch {
      // silent — see doc comment above
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: PRIMARY, background: '#eef1fe' }}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
      {loading ? 'Thinking…' : label}
    </button>
  )
}
