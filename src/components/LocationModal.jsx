import { useState, useEffect } from 'react'
import Modal from './Modal'

export default function LocationModal({ open, onClose, country, initialState, initialCity, onApply }) {
  const [state, setState] = useState(initialState || '')
  const [city, setCity] = useState(initialCity || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setState(initialState || '')
      setCity(initialCity || '')
      setError('')
    }
  }, [open, initialState, initialCity])

  const hasStateList = country?.states?.length > 0

  const handleApply = () => {
    if (!state.trim()) {
      setError(hasStateList ? 'Please select a state/province.' : 'Please enter a state/province.')
      return
    }
    if (!city.trim()) {
      setError('Please enter a city or town.')
      return
    }
    onApply(state.trim(), city.trim())
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Business location">
      <div className="ob-modal-field">
        <label className="ob-label" htmlFor="loc-state">
          State / Province
        </label>
        {hasStateList ? (
          <select id="loc-state" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select a state…</option>
            {country.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="loc-state"
            type="text"
            placeholder="e.g. California"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        )}
      </div>

      <div className="ob-modal-field">
        <label className="ob-label" htmlFor="loc-city">
          City / Town
        </label>
        <input
          id="loc-city"
          type="text"
          placeholder="e.g. Ikeja"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoFocus={!hasStateList}
        />
      </div>

      {error && <p className="ob-error-msg ob-modal-error">{error}</p>}

      <button type="button" className="ob-btn-next ob-modal-apply" onClick={handleApply}>
        Confirm location
      </button>
    </Modal>
  )
}