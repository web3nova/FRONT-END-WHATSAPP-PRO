import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getStoredAccessToken, getAuthHeaders, clearStoredAuth } from '../../lib/auth'
import { Zap } from 'lucide-react'
import './Onboarding.css'

const API_BASE = 'https://back-end-whatsapp-pro.onrender.com/api/v1'

const STEPS = [
  { id: 'identity',      label: 'Business identity' },
  { id: 'compliance',    label: 'Compliance' },
  { id: 'operations',    label: 'Operations' },
  { id: 'presence',      label: 'Presence & hours' },
]

const DELIVERY_OPTIONS = [
  { value: 'self',      label: 'We deliver ourselves' },
  { value: 'third',     label: 'Third-party logistics' },
  { value: 'pickup',    label: 'Customer pickup only' },
  { value: 'hybrid',    label: 'Mixed — delivery + pickup' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const empty = {
  // Step 1 — identity
  businessName: '',
  phone: '',
  location: '',

  // Step 2 — compliance
  cacRegNo: '',
  taxId: '',

  // Step 3 — operations
  numClients: '',
  numStaff: '',
  avgMonthlyIncome: '',
  deliveryStructure: '',

  // Step 4 — presence & hours
  instagram: '',
  twitter: '',
  facebook: '',
  tiktok: '',
  availableDays: [],
  openTime: '08:00',
  closeTime: '18:00',
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(true)

  // On load: check onboarding status, skip this page if already onboarded.
  useEffect(() => {
    let cancelled = false

    async function checkStatus() {
      const token = getStoredAccessToken() || user?.accessToken
      if (!token) {
        clearStoredAuth()
        if (!cancelled) setCheckingStatus(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/onboarding/status`, {
          method: 'GET',
          headers: getAuthHeaders(token),
        })

        if (!res.ok) {
          // If the status check fails (e.g. 401), just let the user
          // go through onboarding rather than blocking them.
          if (!cancelled) setCheckingStatus(false)
          return
        }

        const data = await res.json()

        // Adjust this condition to match whatever shape the API actually
        // returns, e.g. { onboarded: true } or { status: 'completed' }.
        const isOnboarded =
          data?.onboarded === true ||
          data?.isOnboarded === true ||
          data?.status === 'completed' ||
          data?.data?.onboarded === true

        if (!cancelled) {
          if (isOnboarded) {
            navigate('/business-profile')
          } else {
            setCheckingStatus(false)
          }
        }
      } catch (err) {
        console.error('Failed to check onboarding status:', err)
        if (!cancelled) setCheckingStatus(false)
      }
    }

    checkStatus()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  // Per-step validation
  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required.'
      if (!form.phone.trim()) e.phone = 'Phone number is required.'
      if (!form.location.trim()) e.location = 'Location is required.'
    }
    if (step === 1) {
      if (!form.cacRegNo.trim()) e.cacRegNo = 'CAC registration number is required.'
      // TAX ID optional but validated if present
      if (form.taxId && !/^[A-Z0-9-]{6,}$/i.test(form.taxId)) {
        e.taxId = 'Enter a valid Tax ID.'
      }
    }
    if (step === 2) {
      if (!form.numClients) e.numClients = 'Required.'
      if (!form.numStaff) e.numStaff = 'Required.'
      if (!form.avgMonthlyIncome) e.avgMonthlyIncome = 'Required.'
      if (!form.deliveryStructure) e.deliveryStructure = 'Select a delivery structure.'
    }
    if (step === 3) {
      if (form.availableDays.length === 0) e.availableDays = 'Select at least one day.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => {
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')

    const token = getStoredAccessToken() || user?.accessToken
    if (!token) {
      clearStoredAuth()
      setSubmitError('Authentication token is invalid. Please sign in again.')
      setSubmitting(false)
      return
    }

    try {
      // Sent exactly as the form state is shaped, per your instruction.
      const res = await fetch(`${API_BASE}/onboarding`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        let message = `Request failed (${res.status})`
        try {
          const errData = await res.json()
          message = errData?.message || errData?.error || message
        } catch {
          // response wasn't JSON — keep default message
        }
        throw new Error(message)
      }

      navigate('/business-profile')
    } catch (err) {
      console.error('Onboarding submit failed:', err)
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  if (checkingStatus) {
    return (
      <div className="ob-page">
        <main className="ob-main">
          <div className="ob-form-wrap">
            <p>Loading…</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="ob-page">
      {/* ── Left rail ── */}
      <aside className="ob-rail">
        <div className="ob-rail-logo">
          <div className="ob-rail-logo-mark"><Zap size={16} /></div>
          Biz AI
        </div>
        <p className="ob-rail-tagline">
          A few details and your business is live on the platform.
        </p>
        <nav className="ob-steps-nav">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`ob-step-item ${i === step ? 'ob-step-item--active' : ''} ${i < step ? 'ob-step-item--done' : ''}`}
            >
              <span className="ob-step-dot">
                {i < step ? '✓' : i + 1}
              </span>
              <span className="ob-step-label">{s.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main form ── */}
      <main className="ob-main">
        {/* Progress bar */}
        <div className="ob-progress-bar">
          <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="ob-form-wrap">
          {/* ── Step 1: Business identity ── */}
          {step === 0 && (
            <section className="ob-section">
              <h1 className="ob-heading">Tell us about your business</h1>
              <p className="ob-sub">
                {/* TODO: Update once you know your exact onboarding message */}
                This helps us set up your dashboard and verify your account.
              </p>

              <Field label="Business name" error={errors.businessName} required>
                <input
                  type="text"
                  placeholder="e.g. Chukwu Logistics Ltd"
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                />
              </Field>

              <Field label="Phone number" error={errors.phone} required>
                <input
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </Field>

              <Field label="Business location" hint="City, state — e.g. Ikeja, Lagos" error={errors.location} required>
                <input
                  type="text"
                  placeholder="Ikeja, Lagos"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                />
              </Field>
            </section>
          )}

          {/* ── Step 2: Compliance ── */}
          {step === 1 && (
            <section className="ob-section">
              <h1 className="ob-heading">Compliance details</h1>
              <p className="ob-sub">
                We use these to verify your business registration. Your data is encrypted and never shared.
              </p>

              <Field label="CAC registration number" error={errors.cacRegNo} required>
                <input
                  type="text"
                  placeholder="RC 1234567"
                  value={form.cacRegNo}
                  onChange={e => set('cacRegNo', e.target.value)}
                />
              </Field>

              <Field
                label="Tax identification number (TIN)"
                hint="Optional — include if your business is tax-registered"
                error={errors.taxId}
              >
                <input
                  type="text"
                  placeholder="e.g. 1234567-0001"
                  value={form.taxId}
                  onChange={e => set('taxId', e.target.value)}
                />
              </Field>

              <p className="ob-notice">
                {/* TODO: Link to your actual privacy policy */}
                Your compliance documents are stored securely and used only for account verification.{' '}
                <a href="/privacy">Privacy policy →</a>
              </p>
            </section>
          )}

          {/* ── Step 3: Operations ── */}
          {step === 2 && (
            <section className="ob-section">
              <h1 className="ob-heading">How does your business operate?</h1>
              <p className="ob-sub">
                This helps us tailor your dashboard to match your actual workload.
              </p>

              <div className="ob-row-2">
                <Field label="Number of active clients" error={errors.numClients} required>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 120"
                    value={form.numClients}
                    onChange={e => set('numClients', e.target.value)}
                  />
                </Field>

                <Field label="Number of staff" error={errors.numStaff} required>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 8"
                    value={form.numStaff}
                    onChange={e => set('numStaff', e.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Average monthly revenue"
                hint="Approximate figure in Naira — used to recommend the right plan"
                error={errors.avgMonthlyIncome}
                required
              >
                <div className="ob-input-prefix">
                  <span className="ob-prefix">₦</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="500,000"
                    value={form.avgMonthlyIncome}
                    onChange={e => set('avgMonthlyIncome', e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </Field>

              <Field label="Delivery structure" error={errors.deliveryStructure} required>
                <div className="ob-radio-group">
                  {DELIVERY_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`ob-radio-card ${form.deliveryStructure === opt.value ? 'ob-radio-card--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="deliveryStructure"
                        value={opt.value}
                        checked={form.deliveryStructure === opt.value}
                        onChange={() => set('deliveryStructure', opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </Field>
            </section>
          )}

          {/* ── Step 4: Presence & hours ── */}
          {step === 3 && (
            <section className="ob-section">
              <h1 className="ob-heading">Where can customers find you?</h1>
              <p className="ob-sub">
                Add your social handles and set when you're open. All fields below are optional except availability.
              </p>

              <div className="ob-social-grid">
                <Field label="Instagram">
                  <div className="ob-input-prefix">
                    <span className="ob-prefix">@</span>
                    <input
                      type="text"
                      placeholder="yourbusiness"
                      value={form.instagram}
                      onChange={e => set('instagram', e.target.value)}
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                </Field>

                <Field label="X / Twitter">
                  <div className="ob-input-prefix">
                    <span className="ob-prefix">@</span>
                    <input
                      type="text"
                      placeholder="yourbusiness"
                      value={form.twitter}
                      onChange={e => set('twitter', e.target.value)}
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                </Field>

                <Field label="Facebook page">
                  <input
                    type="text"
                    placeholder="facebook.com/yourbusiness"
                    value={form.facebook}
                    onChange={e => set('facebook', e.target.value)}
                  />
                </Field>

                <Field label="TikTok">
                  <div className="ob-input-prefix">
                    <span className="ob-prefix">@</span>
                    <input
                      type="text"
                      placeholder="yourbusiness"
                      value={form.tiktok}
                      onChange={e => set('tiktok', e.target.value)}
                      style={{ paddingLeft: '2rem' }}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Days you're available" error={errors.availableDays} required>
                <div className="ob-day-picker">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`ob-day-btn ${form.availableDays.includes(day) ? 'ob-day-btn--on' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="ob-row-2">
                <Field label="Opening time">
                  <input
                    type="time"
                    value={form.openTime}
                    onChange={e => set('openTime', e.target.value)}
                  />
                </Field>

                <Field label="Closing time">
                  <input
                    type="time"
                    value={form.closeTime}
                    onChange={e => set('closeTime', e.target.value)}
                  />
                </Field>
              </div>
            </section>
          )}

          {submitError && (
            <p className="ob-error-msg" role="alert" style={{ marginTop: '1rem' }}>
              {submitError}
            </p>
          )}

          {/* ── Navigation ── */}
          <div className="ob-nav">
            {step > 0 && (
              <button type="button" className="ob-btn-back" onClick={back}>
                ← Back
              </button>
            )}
            <div className="ob-nav-right">
              <span className="ob-step-count">{step + 1} of {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <button type="button" className="ob-btn-next" onClick={next}>
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  className="ob-btn-next"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Saving…' : 'Continue to profile setup →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Reusable field wrapper ── */
function Field({ label, hint, error, required, children }) {
  return (
    <div className={`ob-field ${error ? 'ob-field--error' : ''}`}>
      <label className="ob-label">
        {label}
        {required && <span className="ob-required" aria-hidden="true"> *</span>}
      </label>
      {hint && <p className="ob-hint">{hint}</p>}
      {children}
      {error && <p className="ob-error-msg">{error}</p>}
    </div>
  )
}