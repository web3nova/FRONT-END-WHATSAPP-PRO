import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../hooks/useOnboarding'
import BizBackground from '../../components/BizBackground'
import { Zap, Loader2, ChevronDown, MapPin } from 'lucide-react'
import CountryCodeModal from '../../components/CountryCodeModal'
import LocationModal from '../../components/LocationModal'
import { COUNTRIES, DEFAULT_COUNTRY } from '../../data/countries'
import './Onboarding.css'

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

export default function Onboarding() {
  const navigate = useNavigate()
  const { checkStatus, createProfile, loading: apiLoading, error: apiError } = useOnboarding()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Phone country code + location, picked via modals rather than free text
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY)
  const [phoneNational, setPhoneNational] = useState('')
  const [locationState, setLocationState] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  // On load: check onboarding status, skip this page if already onboarded.
  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const status = await checkStatus()
        if (cancelled) return
        if (status?.completed === true || status?.steps?.business === true) {
          navigate('/business-profile', { replace: true })
        } else {
          setCheckingStatus(false)
        }
      } catch {
        if (!cancelled) setCheckingStatus(false)
      }
    }

    run()
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

      const digits = phoneNational.replace(/\D/g, '')
      if (!digits) e.phone = 'Phone number is required.'
      else if (digits.length < 6) e.phone = 'Enter a valid phone number.'

      if (!locationState.trim() || !locationCity.trim()) {
        e.location = 'Select your state/province and city.'
      }
    }
    if (step === 1) {
      // Both CAC and TIN are optional
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

    const payload = {
      ...form,
      countryIso2: selectedCountry.iso2,
      phone: `${selectedCountry.dialCode} ${phoneNational}`.trim(),
      locationState,
      locationCity,
      location: `${locationCity}, ${locationState}`,
    }

    try {
      await createProfile(payload)
      navigate('/business-profile', { replace: true })
    } catch {
      // error is surfaced via apiError from the hook
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  if (checkingStatus) {
    return (
      <div className="app-bg">
        <BizBackground variant="light" />
        <div className="content-layer">
          <div className="ob-loading-screen">
            <div className="ob-loading-card">
              <div className="ob-loading-icon">
                <Loader2 size={24} />
              </div>
              <p className="ob-loading-heading">Setting things up</p>
              <p className="ob-loading-sub">Checking your account status…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-bg">
      <BizBackground variant="light" />
      <div className="content-layer">
        <div className="ob-page">
          <aside className="ob-rail">
            <div className="ob-rail-logo">
              <div className="ob-rail-logo-mark">
                <Zap size={16} />
              </div>
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

          <main className="ob-main">
            <div className="ob-progress-bar">
              <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="ob-form-wrap">
              {step === 0 && (
                <section className="ob-section">
                  <h1 className="ob-heading">Tell us about your business</h1>
                  <p className="ob-sub">
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
                    <div className="ob-phone-group">
                      <button
                        type="button"
                        className="ob-country-trigger"
                        onClick={() => setShowCountryModal(true)}
                      >
                        <span className="ob-country-flag" aria-hidden="true">{selectedCountry.flag}</span>
                        <span className="ob-country-dial">{selectedCountry.dialCode}</span>
                        <ChevronDown size={14} />
                      </button>
                      <input
                        type="tel"
                        placeholder="801 234 5678"
                        value={phoneNational}
                        onChange={e => {
                          setPhoneNational(e.target.value)
                          setErrors(prev => ({ ...prev, phone: undefined }))
                        }}
                      />
                    </div>
                  </Field>

                  <Field label="Business location" hint="State/province and city" error={errors.location} required>
                    <button
                      type="button"
                      className={`ob-location-trigger ${!(locationState && locationCity) ? 'ob-location-trigger--empty' : ''}`}
                      onClick={() => setShowLocationModal(true)}
                    >
                      <MapPin size={16} />
                      <span>
                        {locationState && locationCity ? `${locationCity}, ${locationState}` : 'Select state & city'}
                      </span>
                      <ChevronDown size={14} />
                    </button>
                  </Field>
                </section>
              )}

              {step === 1 && (
                <section className="ob-section">
                  <h1 className="ob-heading">Compliance details</h1>
                  <p className="ob-sub">
                    We use these to verify your business registration. Your data is encrypted and never shared.
                  </p>

                  <Field label="CAC registration number" hint="Optional — enter if your business is registered" error={errors.cacRegNo}>
                    <input
                      type="text"
                      placeholder="RC 1234567"
                      value={form.cacRegNo}
                      onChange={e => set('cacRegNo', e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Tax identification number (TIN)"
                    hint="Optional"
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
                    Your compliance documents are stored securely and used only for account verification.{' '}
                    <a href="/privacy">Privacy policy →</a>
                  </p>
                </section>
              )}

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

              {apiError && (
                <p className="ob-error-msg" role="alert" style={{ marginTop: '1rem' }}>
                  {apiError}
                </p>
              )}

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
                      disabled={apiLoading}
                    >
                      {apiLoading ? 'Saving…' : 'Continue to profile setup →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <CountryCodeModal
        open={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        countries={COUNTRIES}
        selected={selectedCountry}
        onSelect={setSelectedCountry}
      />

      <LocationModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        country={selectedCountry}
        initialState={locationState}
        initialCity={locationCity}
        onApply={(state, city) => {
          setLocationState(state)
          setLocationCity(city)
          setErrors(prev => ({ ...prev, location: undefined }))
        }}
      />
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