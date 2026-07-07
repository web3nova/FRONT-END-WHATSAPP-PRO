import { useState, useEffect, useRef } from 'react'
import {
  User, MessageCircle, Bot, Bell, Users, CreditCard, Check, Plus, Trash2,
  ToggleLeft, ToggleRight, Eye, EyeOff, Loader2, Upload, AlertCircle, X, Save
} from 'lucide-react'
import { useBusinessProfile } from '../../hooks/useBusinessProfile'
import { useAuth } from '../../context/AuthContext'
import { fetchWhatsappBusinessProfile, updateWhatsappBusinessProfile } from '../../api/whatsappApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const tabs = [
  { id: 'profile', label: 'Business Profile', icon: User },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'ai', label: 'AI Settings', icon: Bot },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
]


function Toggle({ on, onToggle, label }) {
  return (
    <button onClick={onToggle} aria-label={label} className="p-1.5 -m-1.5">
      {on
        ? <ToggleRight size={26} style={{ color: PRIMARY }} />
        : <ToggleLeft size={26} className="text-gray-300" />}
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toast({ type, message, onDismiss }) {
  const bg = type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
  const Icon = type === 'success' ? Check : AlertCircle
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm mb-4 ${bg}`}>
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1 min-w-0">{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100 p-1 -m-1 flex-shrink-0"><X size={14} /></button>
    </div>
  )
}

const INITIAL_FORM = {
  displayName: '',
  tagline: '',
  description: '',
  email: '',
  phone: '',
  location: '',
}

function WhatsAppSettingsTab({ profile, toggles, tog }) {
  const [waProfile, setWaProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ about: '', address: '', description: '', email: '', website: '' })

  useEffect(() => {
    fetchWhatsappBusinessProfile()
      .then(p => {
        if (p) {
          setWaProfile(p)
          setForm({
            about: p.about || '',
            address: p.address || '',
            description: p.description || '',
            email: p.email || '',
            website: p.websites?.[0] || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateWhatsappBusinessProfile({
        about: form.about || undefined,
        address: form.address || undefined,
        description: form.description || undefined,
        email: form.email || undefined,
        websites: form.website ? [form.website] : undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-gray-900">WhatsApp Connection</h2>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 gap-3" style={{ background: CREAM }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dce5fd' }}>
            <MessageCircle size={18} style={{ color: PRIMARY }} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{profile?.whatsappNumber || 'WhatsApp Business'}</div>
            <div className="text-xs font-medium" style={{ color: PRIMARY }}>● Connected via WhatsApp Business API</div>
          </div>
        </div>
        <button className="text-sm font-semibold text-red-400 border border-red-200 bg-white px-3 py-2.5 sm:py-1.5 rounded-lg hover:bg-red-50 transition w-full sm:w-auto flex-shrink-0">
          Disconnect
        </button>
      </div>

      <div>
        <SettingRow label="AI Auto-Reply" desc="Let AI respond to customer messages automatically">
          <Toggle on={toggles.aiReply} onToggle={() => tog('aiReply')} label="Toggle AI auto-reply" />
        </SettingRow>
      </div>

      {/* WhatsApp Business Profile Editor */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">WhatsApp Business Profile</h3>
          <p className="text-xs text-gray-400 mt-0.5">This is what customers see when they view your WhatsApp number</p>
        </div>

        {loading ? (
          <div className="px-5 py-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Loading profile…
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">About <span className="text-gray-400 font-normal">(139 chars max)</span></label>
              <input
                value={form.about}
                onChange={set('about')}
                maxLength={139}
                placeholder="e.g. We sell quality fashion items and deliver fast"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={3}
                placeholder="Tell customers what your business does…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <input
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Lagos, Nigeria"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  value={form.email}
                  onChange={set('email')}
                  type="email"
                  placeholder="hello@yourbusiness.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Website</label>
              <input
                value={form.website}
                onChange={set('website')}
                type="url"
                placeholder="https://www.yourbusiness.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                <Check size={14} /> WhatsApp Business Profile updated successfully
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Profile</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const { getProfile, saveProfile, updateProfile, uploadLogo } = useBusinessProfile()
  const { user, subscription } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [showKey, setShowKey] = useState(false)
  const [toggles, setToggles] = useState({
    aiAutoReply: true, collectMeasurements: true, generateQuotes: true,
    orderNotif: true, whatsappNotif: true, emailNotif: false, weeklyReport: true,
    aiReply: true,
  })
  const [form, setForm] = useState(INITIAL_FORM)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [profileExists, setProfileExists] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [profile, setProfile] = useState(null)
  const fileRef = useRef(null)

  function tog(key) {
    setToggles(p => ({ ...p, [key]: !p[key] }))
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      setFetchLoading(true)
      try {
        const data = await getProfile()
        if (ignore) return
        if (data) {
          setProfile(data)
          setProfileExists(true)
          setForm({
            displayName: data.displayName || '',
            tagline: data.tagline || '',
            description: data.description || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
          })
        }
      } catch (err) {
        if (ignore) return
        if (err.status !== 404) {
          setToast({ type: 'error', message: err.message || 'Failed to load profile' })
        }
      } finally {
        if (!ignore) setFetchLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setToast(null)
    try {
      const result = profileExists
        ? await updateProfile(form)
        : await saveProfile(form)
      setProfile(result)
      setProfileExists(true)
      setToast({ type: 'success', message: 'Business profile saved successfully.' })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
  }

  async function handleLogoUpload() {
    if (!logoFile) return
    setLogoUploading(true)
    setToast(null)
    try {
      const result = await uploadLogo(logoFile)
      setProfile(result)
      setLogoFile(null)
      setToast({ type: 'success', message: 'Logo uploaded successfully.' })
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to upload logo' })
    } finally {
      setLogoUploading(false)
    }
  }

  const logoUrl = logoFile ? URL.createObjectURL(logoFile) : profile?.logoUrl || null
  const initials = (form.displayName || 'PS').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your business profile and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Tab bar — on mobile this wraps into a 3-column grid so every destination is
            visible and tappable at once (no hidden-scrollbar gesture to discover).
            On md+ it becomes a vertical sidebar list as before. */}
        <div className="w-full md:w-52 flex-shrink-0 grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1.5 md:gap-2.5 px-2 py-3 md:px-3.5 md:py-2.5 rounded-xl text-[11px] md:text-sm font-medium transition text-center md:text-left"
              style={activeTab === t.id
                ? { background: PRIMARY, color: '#fff' }
                : { color: '#6b7280', background: '#f9fafb' }}
            >
              <t.icon size={18} className="flex-shrink-0" />
              <span className="leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">

          {/* Business Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Business Profile</h2>

              {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}

              {fetchLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin" style={{ color: PRIMARY }} />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden bg-cover bg-center flex-shrink-0"
                      style={logoUrl ? { backgroundImage: `url(${logoUrl})` } : { background: PRIMARY }}
                    >
                      {!logoUrl && initials}
                    </div>
                    <div className="min-w-0 w-full sm:w-auto">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleLogoSelect}
                      />
                      {logoFile ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <span className="text-xs text-gray-500 truncate max-w-full sm:max-w-[140px]">{logoFile.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleLogoUpload}
                              disabled={logoUploading}
                              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60"
                              style={{ background: PRIMARY }}
                            >
                              {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                              Upload
                            </button>
                            <button
                              onClick={() => setLogoFile(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 p-2 -m-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl hover:opacity-90 transition mx-auto sm:mx-0"
                          style={{ background: PRIMARY }}
                          >
                            <Upload size={14} />
                            Upload Logo
                          </button>
                          <div className="text-xs text-gray-400 mt-1.5">PNG or JPG · Max 5MB · Recommended 400×400px</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Business Name', name: 'displayName', full: true, required: true },
                      { label: 'Tagline', name: 'tagline', full: true },
                      { label: 'Phone Number', name: 'phone' },
                      { label: 'Email', name: 'email' },
                      { label: 'Location', name: 'location' },
                    ].map(f => (
                      <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                          {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                        </label>
                        <input
                          name={f.name}
                          value={form[f.name]}
                          onChange={handleChange}
                          className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 bg-gray-50"
                          style={{ '--tw-ring-color': PRIMARY }}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Business Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none bg-gray-50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || !form.displayName.trim()}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    style={{ background: PRIMARY }}
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'whatsapp' && <WhatsAppSettingsTab profile={profile} toggles={toggles} tog={tog} />}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">AI Settings</h2>
              <div>
                <SettingRow label="AI Auto-Reply" desc="AI handles customer conversations automatically">
                  <Toggle on={toggles.aiAutoReply} onToggle={() => tog('aiAutoReply')} label="Toggle AI auto-reply" />
                </SettingRow>
                <SettingRow label="Collect Measurements" desc="AI asks for body measurements when needed">
                  <Toggle on={toggles.collectMeasurements} onToggle={() => tog('collectMeasurements')} label="Toggle collect measurements" />
                </SettingRow>
                <SettingRow label="Generate Quotations" desc="AI automatically generates price quotes">
                  <Toggle on={toggles.generateQuotes} onToggle={() => tog('generateQuotes')} label="Toggle generate quotations" />
                </SettingRow>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">AI Persona Name</label>
                <input placeholder="e.g. Sales Assistant" className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tone of Voice</label>
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {['Friendly', 'Professional', 'Casual', 'Formal'].map((t, i) => (
                    <button key={t} className="sm:flex-1 py-2.5 sm:py-2 text-xs font-medium rounded-xl border transition"
                      style={i === 0 ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Language</label>
                <select className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
                  <option>English</option>
                  <option>Pidgin English</option>
                  <option>Yoruba</option>
                  <option>Igbo</option>
                  <option>Hausa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">API Key</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="Enter your API key"
                      className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none pr-10"
                    />
                    <button onClick={() => setShowKey(v => !v)} aria-label={showKey ? 'Hide API key' : 'Show API key'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <button className="px-4 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 flex-shrink-0" style={{ background: PRIMARY }}>Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">Team Members</h2>
                <button
                  disabled
                  title="Team invitations coming soon"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl opacity-50 cursor-not-allowed w-full sm:w-auto"
                  style={{ background: PRIMARY }}
                >
                  <Plus size={14} /> Invite Member
                </button>
              </div>
              <div className="space-y-3">
                {/* Only the account owner — team management coming soon */}
                {user && (() => {
                  const name = user.name || user.email || 'Account Owner'
                  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: PRIMARY }}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 pl-12 sm:pl-0">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500">Owner</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <p className="text-xs text-gray-400 text-center pt-2">Team invitations and role management coming soon</p>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-1">
              <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <SettingRow label="New Order" desc="Get notified when a customer places an order">
                <Toggle on={toggles.orderNotif} onToggle={() => tog('orderNotif')} label="Toggle new order notifications" />
              </SettingRow>
              <SettingRow label="WhatsApp Escalations" desc="Notify when AI can't handle a customer">
                <Toggle on={toggles.whatsappNotif} onToggle={() => tog('whatsappNotif')} label="Toggle WhatsApp escalation notifications" />
              </SettingRow>
              <SettingRow label="Email Notifications" desc="Receive email summaries">
                <Toggle on={toggles.emailNotif} onToggle={() => tog('emailNotif')} label="Toggle email notifications" />
              </SettingRow>
              <SettingRow label="Weekly Report" desc="Summary of your weekly business performance">
                <Toggle on={toggles.weeklyReport} onToggle={() => tog('weeklyReport')} label="Toggle weekly report" />
              </SettingRow>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (() => {
            const isTrial = subscription?.status === 'TRIAL'
            const isActive = subscription?.isActive === true
            const planLabel = isTrial ? 'Free Trial' : isActive ? 'Active Plan' : subscription?.status || 'No active plan'
            const trialEnd = subscription?.trialEndsAt
              ? new Date(subscription.trialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : null
            return (
              <div className="space-y-5">
                <h2 className="font-semibold text-gray-900">Billing & Plan</h2>
                <div className="rounded-2xl p-4 sm:p-5 border-2" style={{ borderColor: PRIMARY, background: '#dce5fd' }}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{planLabel}</div>
                      {isTrial && trialEnd && (
                        <div className="text-sm text-gray-500">Free trial · Expires {trialEnd}</div>
                      )}
                      {!isTrial && !isActive && (
                        <div className="text-sm text-red-500">No active subscription</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: isActive ? PRIMARY : '#9ca3af' }}>
                      <Check size={14} /> {isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {['AI-powered WhatsApp replies', '1 WhatsApp number', 'Custom website builder', 'Order & quote management'].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check size={13} className="flex-shrink-0" style={{ color: PRIMARY }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-4 border border-gray-100 bg-gray-50">
                  <div className="font-semibold text-gray-900 mb-0.5">Upgrade to Pro</div>
                  <div className="text-xs text-gray-400 mb-3">Unlimited AI messages · Multiple WhatsApp numbers · Priority support</div>
                  <button className="text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl hover:opacity-90 w-full sm:w-auto" style={{ background: PRIMARY }}>
                    View Plans
                  </button>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment History</div>
                  <div className="py-6 text-center text-sm text-gray-400">No payment history yet</div>
                </div>
              </div>
            )
          })()}

        </div>
      </div>
    </div>
  )
}