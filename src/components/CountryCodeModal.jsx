import { useState, useMemo, useEffect } from 'react'
import Modal from './Modal'

export default function CountryCodeModal({ open, onClose, countries, selected, onSelect }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase().includes(q)
    )
  }, [countries, query])

  return (
    <Modal open={open} onClose={onClose} title="Select country code">
      <input
        type="text"
        className="ob-modal-search"
        placeholder="Search country or code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <ul className="ob-country-list">
        {filtered.map((c) => (
          <li key={c.iso2}>
            <button
              type="button"
              className={`ob-country-option ${selected.iso2 === c.iso2 ? 'ob-country-option--selected' : ''}`}
              onClick={() => {
                onSelect(c)
                onClose()
              }}
            >
              <span className="ob-country-flag" aria-hidden="true">
                {c.flag}
              </span>
              <span className="ob-country-name">{c.name}</span>
              <span className="ob-country-dial">{c.dialCode}</span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="ob-country-empty">No countries match "{query}".</li>
        )}
      </ul>
    </Modal>
  )
}