import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Building2, Mail, MessageCircle, ArrowRight, Check } from 'lucide-react'

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
  const [logoPreview, setLogoPreview] = useState(null)
  const [form, setForm] = useState({
    category: '',
    tagline: '',
    description: '',
    email: '',
    whatsapp: '',
  })
  const [saving, setSaving] = useState(false)

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
    // TODO: POST form data to API
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: CREAM }}>

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
        <h1 className="text-2xl font-bold text-gray-900">Set up your business profile</h1>
        <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
          This is how your business appears to customers on your AI-powered website and WhatsApp.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg overflow-hidden">

        {/* Logo section */}
        <div className="flex flex-col items-center gap-3 px-8 py-6 border-b border-gray-100" style={{ background: CREAM }}>
          <label className="cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed transition overflow-hidden"
              style={{ borderColor: logoPreview ? 'transparent' : '#d1d5db', background: logoPreview ? 'transparent' : '#fff' }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera size={22} className="text-gray-300 group-hover:text-gray-400 transition" />
              )}
            </div>
          </label>
          <div className="text-center">
            <label className="cursor-pointer text-sm font-semibold" style={{ color: PRIMARY }}>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              {logoPreview ? 'Change logo' : 'Upload business logo'}
            </label>
            <p className="text-xs text-gray-400 mt-0.5">PNG or JPG · Max 2 MB · Recommended 400×400px</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="px-8 py-6 space-y-5">

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Business Category <span style={{ color: PRIMARY }}>*</span>
            </label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 transition"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Business Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="e.g. Custom Made & Ready To Wear Fashion"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 transition"
            />
            <p className="text-xs text-gray-400 mt-1">A short phrase that describes what you do.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Business Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Tell customers what makes your business unique — your story, specialities, and what you offer."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Your AI agent uses this to introduce your business to customers.</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Business Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="hello@yourbusiness.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 transition"
              />
            </div>
          </div>

          {/* WhatsApp number */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              WhatsApp Business Number
            </label>
            <div className="relative">
              <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-300 transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Your AI agent will receive customer messages on this number.</p>
          </div>

          {/* CTA */}
          <button
            onClick={handleComplete}
            disabled={saving}
            className="w-full py-3 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60 mt-2"
            style={{ background: PRIMARY }}
          >
            {saving ? 'Saving your profile…' : (
              <>Complete Setup <ArrowRight size={15} /></>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition text-center"
          >
            Skip for now — I'll complete this later
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        You can update your business profile anytime from <span className="font-medium">Settings → Business Profile</span>.
      </p>
    </div>
  )
}
