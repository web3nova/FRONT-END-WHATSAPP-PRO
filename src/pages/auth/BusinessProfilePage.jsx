import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders, clearStoredAuth } from '../../lib/auth'
import { Camera, Building2, Mail, MessageCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const CATEGORIES = [
  'Fashion & Apparel', 'Food & Beverage', 'Electronics', 'Beauty & Wellness',
  'Home & Furniture', 'Health & Fitness', 'Education', 'Logistics',
  'Retail & E-commerce', 'Professional Services', 'Other',
]

const FLOW_STEPS = ['Account', 'Plan', 'Onboarding', 'Profile']

export default function BusinessProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [logoPreview, setLogoPreview] = useState(null)
  const [subStep, setSubStep] = useState(0)
  const [form, setForm] = useState({
    category: '',
    tagline: '',
    description: '',
    email: '',
    whatsapp: '',
  })
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    setSubmitError('')

    const token = getStoredAccessToken() || user?.accessToken
    if (!token) {
      clearStoredAuth()
      setSubmitError('Authentication token is invalid. Please sign in again.')
      setSaving(false)
      return
    }

    const payload = {
      category: form.category,
      tagline: form.tagline,
      description: form.description,
      email: form.email,
      whatsapp: form.whatsapp,
      logo: logoPreview,
    }

    try {
      const response = await fetch(`${API_BASE}/business`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        const message = result?.message || result?.error || `Request failed (${response.status})`
        throw new Error(message)
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('Business profile save failed:', error)
      setSubmitError(error.message || 'Failed to save business profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isFieldEmpty = () => {
    if (subStep === 0) return !logoPreview
    if (subStep === 1) return !form.category
    if (subStep === 2) return !form.tagline.trim()
    if (subStep === 3) return !form.description.trim()
    if (subStep === 4) return !form.email.trim()
    if (subStep === 5) return !form.whatsapp.trim()
    return true
  }

  const handleNext = () => {
    if (subStep === 5) {
      handleComplete()
    } else {
      setSubStep(s => s + 1)
    }
  }

  const renderSubStep = () => {
    switch (subStep) {
      case 0:
        return (
          <div className="flex flex-col items-center gap-4 py-2">
            <label className="cursor-pointer group">
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center border-2 border-dashed transition overflow-hidden shadow-sm"
                style={{ borderColor: logoPreview ? 'transparent' : '#d1d5db', background: logoPreview ? 'transparent' : '#fff' }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-gray-300 group-hover:text-gray-400 transition" />
                )}
              </div>
            </label>
            <div className="text-center">
              <label className="cursor-pointer text-sm font-semibold" style={{ color: PRIMARY }}>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                {logoPreview ? 'Change logo' : 'Upload business logo'}
              </label>
              <p className="text-xs text-gray-400 mt-1.5 max-w-[240px] mx-auto">
                PNG or JPG · Max 2 MB · Recommended square format
              </p>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Category <span style={{ color: PRIMARY }}>*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">Select the industry that best describes your business.</p>
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {CATEGORIES.map(c => {
                const isSelected = form.category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      set('category', c)
                      setTimeout(() => setSubStep(2), 250)
                    }}
                    className={`p-3 rounded-2xl border text-left text-sm font-medium transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Tagline
            </label>
            <p className="text-sm text-gray-500">A short phrase that sums up what your business does.</p>
            <input
              type="text"
              value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="e.g. Custom Made & Ready To Wear Fashion"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 focus:bg-white transition"
              autoFocus
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Description
            </label>
            <p className="text-sm text-gray-500">Tell customers what makes your business unique. Your AI assistant will use this information.</p>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. We design high-quality, bespoke traditional and modern clothing for men and women. Family owned since 2018."
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 focus:bg-white transition resize-none"
              autoFocus
            />
          </div>
        )
      case 4:
        return (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Business Email
            </label>
            <p className="text-sm text-gray-500">The primary email address where customers can contact you.</p>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="hello@yourbusiness.com"
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 focus:bg-white transition"
                autoFocus
              />
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              WhatsApp Business Number
            </label>
            <p className="text-sm text-gray-500">Your AI agent will receive and respond to customer messages on this number.</p>
            <div className="relative">
              <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 focus:bg-white transition"
                autoFocus
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: CREAM, fontFamily: "'Inter', sans-serif" }}>

      {/* Flow progress indicator */}
      <div className="flex items-center gap-1 mb-8">
        {FLOW_STEPS.map((label, i) => {
          const done = i < 3
          const active = i === 3
          return (
            <div key={label} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    done ? { background: PRIMARY, color: '#fff' }
                    : active ? { background: PRIMARY, color: '#fff' }
                    : { background: '#e5e7eb', color: '#9ca3af' }
                  }
                >
                  {done ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className="text-xs font-semibold hidden sm:block"
                  style={{ color: active ? PRIMARY : done ? '#6b7280' : '#d1d5db' }}
                >
                  {label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="w-6 h-px mx-1" style={{ background: i < 3 ? PRIMARY : '#e5e7eb' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
          style={{ background: PRIMARY }}
        >
          <Building2 size={22} className="text-white" />
        </div>
        <h1 className="text-gray-900" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.2, margin: '0 0 6px' }}>Set up your business profile</h1>
        <p className="text-gray-500 mt-1.5 max-w-sm mx-auto" style={{ fontSize: 16, lineHeight: 1.6 }}>
          This is how your business appears to customers on your AI-powered website and WhatsApp.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Questionnaire Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5 flex">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((subStep + 1) / 6) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400 px-8 pt-3">
          <span>Questionnaire Progress</span>
          <span>Step {subStep + 1} of 6</span>
        </div>

        {/* Dynamic Card Content with Animation */}
        <div className="px-8 py-6 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={subStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              {renderSubStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {submitError ? (
          <div className="px-8 pb-2 text-sm text-red-600">
            {submitError}
          </div>
        ) : null}

        {/* Navigation Actions */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {subStep > 0 ? (
            <button
              type="button"
              onClick={() => setSubStep(s => s - 1)}
              className="py-2.5 px-4 text-sm font-semibold text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={subStep === 1 && !form.category}
            className="py-2.5 px-6 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition disabled:opacity-50"
            style={{ background: PRIMARY }}
          >
            {subStep === 5 ? (
              saving ? 'Saving...' : 'Complete Setup'
            ) : (
              isFieldEmpty() && subStep !== 1 ? 'Skip' : 'Continue'
            )}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        You can update your business profile anytime from <span className="font-medium">Settings → Business Profile</span>.
      </p>
    </div>
  )
}
