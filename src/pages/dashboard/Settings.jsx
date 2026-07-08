import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isOwner } from '../../utils/permissions'
import { getTeamMembers, inviteMember, cancelInvite, removeMember } from '../../api/teamApi'
import {
  User, MessageCircle, Bot, Bell, Users, CreditCard, Check, Plus, Trash2,
  ToggleLeft, ToggleRight, Eye, EyeOff, Loader2, Upload, AlertCircle, X, Save
} from 'lucide-react'
import { useBusinessProfile } from '../../hooks/useBusinessProfile'
import { useAuth } from '../../context/AuthContext'
import { fetchWhatsappBusinessProfile, updateWhatsappBusinessProfile, disconnectWhatsapp } from '../../api/whatsappApi'
import { getNotificationPrefs, patchNotificationPrefs } from '../../api/notificationsApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const ALL_TABS = [
  { id: 'profile',       label: 'Business Profile', icon: User },
  { id: 'whatsapp',      label: 'WhatsApp',         icon: MessageCircle },
  { id: 'ai',            label: 'AI Settings',      icon: Bot },
  { id: 'notifications', label: 'Notifications',    icon: Bell },
  { id: 'team',          label: 'Team',             icon: Users,      ownerOnly: true },
  { id: 'billing',       label: 'Billing & Plan',   icon: CreditCard, ownerOnly: true },
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
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ about: '', address: '', description: '', email: '', website: '' })

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await disconnectWhatsapp()
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Failed to disconnect')
      setDisconnecting(false)
      setShowDisconnectModal(false)
    }
  }

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
        <button
          onClick={() => setShowDisconnectModal(true)}
          disabled={disconnecting}
          className="text-sm font-semibold text-red-400 border border-red-200 bg-white px-3 py-2.5 sm:py-1.5 rounded-lg hover:bg-red-50 transition w-full sm:w-auto flex-shrink-0 disabled:opacity-50"
        >
          {disconnecting ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>

      <div>
        <SettingRow label="AI Auto-Reply" desc="Let AI respond to customer messages automatically. Configure in AI Settings.">
          <span className="text-xs text-gray-400 font-medium">→ AI Settings tab</span>
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

      {/* Disconnect WhatsApp confirmation modal */}
      {showDisconnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
          onClick={() => !disconnecting && setShowDisconnectModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <MessageCircle size={18} className="text-red-500" />
              </div>
              <button
                onClick={() => !disconnecting && setShowDisconnectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-sm font-semibold text-gray-900">Disconnect WhatsApp?</div>
            <p className="text-sm text-gray-500 mt-1">
              Your AI will stop responding to customer messages until you reconnect.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={disconnecting}
                className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function memberInitials(name, email) {
  const n = name || email || '?'
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', member: 'Member' }
const ROLE_COLORS = { owner: '#4f46e5', admin: '#0891b2', member: '#6b7280' }

function TeamTab({ currentUser }) {
  const [members, setMembers] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTeamMembers()
      setMembers(data.members || [])
      setPending(data.pendingInvites || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    try {
      await inviteMember(inviteEmail, inviteRole)
      setInviteSent(true)
      setInviteEmail('')
      setInviteRole('member')
      setTimeout(() => { setInviteSent(false); setShowInvite(false) }, 2000)
      load()
    } catch (err) {
      setInviteError(err.message || 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  async function handleCancel(inviteId) {
    try { await cancelInvite(inviteId); load() } catch { /* silent */ }
  }

  async function handleRemove() {
    if (!removeTarget) return
    setRemoving(true)
    try { await removeMember(removeTarget.id); setRemoveTarget(null); load() } catch { /* silent */ }
    setRemoving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">Team Members</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl w-full sm:w-auto"
          style={{ background: PRIMARY }}
        >
          <Plus size={14} /> Invite Member
        </button>
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-400">Loading…</div>
        ) : members.map(m => (
          <div key={m.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: ROLE_COLORS[m.teamRole] || PRIMARY }}>
                {memberInitials(m.name, m.email)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{m.name || m.email}</div>
                <div className="text-xs text-gray-400 truncate">{m.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pl-12 sm:pl-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#f1f5f9', color: ROLE_COLORS[m.teamRole] || PRIMARY }}>
                {ROLE_LABELS[m.teamRole] || m.teamRole}
              </span>
              {m.id !== currentUser?.id && m.teamRole !== 'owner' && (
                <button
                  onClick={() => setRemoveTarget(m)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pending invites */}
      {pending.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending Invites</div>
          <div className="space-y-2">
            {pending.map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                <div className="min-w-0">
                  <div className="text-sm text-gray-700 truncate">{inv.email}</div>
                  <div className="text-xs text-gray-400">{ROLE_LABELS[inv.role] || inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => handleCancel(inv.id)}
                  className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Invite Team Member</h3>
            <p className="text-xs text-gray-400 mb-4">They'll receive an email to set up their account.</p>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email address"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none"
              >
                <option value="member">Member — orders & conversations only</option>
                <option value="admin">Admin — full access except billing & team</option>
              </select>
              {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
              {inviteSent && <p className="text-xs text-green-600">Invite sent!</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50" style={{ background: PRIMARY }}>
                  {inviting ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirmation modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">Remove {removeTarget.name || removeTarget.email}?</h3>
            <p className="text-sm text-gray-500 mb-4">They'll lose access immediately. You can invite them again later.</p>
            <div className="flex gap-2">
              <button onClick={() => setRemoveTarget(null)} disabled={removing} className="flex-1 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600">Cancel</button>
              <button onClick={handleRemove} disabled={removing} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const { getProfile, saveProfile, updateProfile, uploadLogo } = useBusinessProfile()
  const { user, subscription } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')
  const [showKey, setShowKey] = useState(false)
  const [toggles, setToggles] = useState({
    orderNotif: true, whatsappNotif: true, emailNotif: false, weeklyReport: true,
    aiReply: true,
  })
  const [aiSettings, setAiSettings] = useState({
    autoReply: true,
    collectMeasurements: true,
    generateQuotes: true,
    persona: '',
    tone: 'Friendly',
  })
  const [savedAiSettings, setSavedAiSettings] = useState(null)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaved, setAiSaved] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [savedForm, setSavedForm] = useState(INITIAL_FORM)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [profileExists, setProfileExists] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [profile, setProfile] = useState(null)
  const fileRef = useRef(null)

  const NOTIF_PREF_KEYS = ['orderNotif', 'whatsappNotif', 'emailNotif', 'weeklyReport']

  // Load notification preferences from backend on mount
  useEffect(() => {
    getNotificationPrefs().then(prefs => {
      if (prefs && Object.keys(prefs).length) {
        setToggles(p => ({ ...p, ...prefs }))
      }
    }).catch(() => {})
  }, [])

  function tog(key) {
    setToggles(p => {
      const next = { ...p, [key]: !p[key] }
      // Persist notification prefs to backend immediately
      if (NOTIF_PREF_KEYS.includes(key)) {
        const prefsToSave = {}
        NOTIF_PREF_KEYS.forEach(k => { prefsToSave[k] = next[k] })
        patchNotificationPrefs(prefsToSave).catch(() => {})
      }
      return next
    })
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
          const loadedForm = {
            displayName: data.displayName || '',
            tagline: data.tagline || '',
            description: data.description || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
          }
          setForm(loadedForm)
          setSavedForm(loadedForm)
          const ai = data.settings?.ai || {}
          const loadedAi = {
            autoReply: ai.autoReply !== false,
            collectMeasurements: ai.collectMeasurements !== false,
            generateQuotes: ai.generateQuotes !== false,
            persona: ai.persona || '',
            tone: ai.tone || 'Friendly',
          }
          setAiSettings(loadedAi)
          setSavedAiSettings(loadedAi)
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

  const aiSettingsDirty = savedAiSettings !== null &&
    JSON.stringify(aiSettings) !== JSON.stringify(savedAiSettings)

  async function handleSaveAiSettings() {
    setAiSaving(true)
    setAiSaved(false)
    try {
      await updateProfile({ settings: { ...(profile?.settings || {}), ai: aiSettings } })
      setSavedAiSettings({ ...aiSettings })
      setAiSaved(true)
      setTimeout(() => setAiSaved(false), 3000)
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save AI settings' })
    } finally {
      setAiSaving(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setToast(null)
    try {
      // Strip empty strings — backend schema rejects '' for optional fields with min(1)
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => typeof v !== 'string' || v.trim() !== '')
      )
      const result = profileExists
        ? await updateProfile(payload)
        : await saveProfile(payload)
      setProfile(result)
      setProfileExists(true)
      setSavedForm({ ...form })
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
          {ALL_TABS.filter(t => !t.ownerOnly || isOwner(user)).map(t => (
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

                  {(saving || JSON.stringify(form) !== JSON.stringify(savedForm)) && (
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.displayName.trim()}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                      style={{ background: PRIMARY }}
                    >
                      {saving && <Loader2 size={14} className="animate-spin" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'whatsapp' && <WhatsAppSettingsTab profile={profile} toggles={toggles} tog={tog} />}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">AI Settings</h2>
                <div className="flex items-center gap-2">
                  {aiSaved && <span className="text-xs text-green-600 font-medium">Saved</span>}
                  {aiSettingsDirty && (
                    <button
                      onClick={handleSaveAiSettings}
                      disabled={aiSaving}
                      className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
                      style={{ background: PRIMARY }}
                    >
                      {aiSaving ? 'Saving…' : 'Save'}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <SettingRow label="AI Auto-Reply" desc="AI handles customer conversations automatically">
                  <Toggle on={aiSettings.autoReply} onToggle={() => setAiSettings(p => ({ ...p, autoReply: !p.autoReply }))} label="Toggle AI auto-reply" />
                </SettingRow>
                <SettingRow label="Collect Measurements" desc="AI asks for body measurements when needed">
                  <Toggle on={aiSettings.collectMeasurements} onToggle={() => setAiSettings(p => ({ ...p, collectMeasurements: !p.collectMeasurements }))} label="Toggle collect measurements" />
                </SettingRow>
                <SettingRow label="Generate Quotations" desc="AI automatically generates price quotes">
                  <Toggle on={aiSettings.generateQuotes} onToggle={() => setAiSettings(p => ({ ...p, generateQuotes: !p.generateQuotes }))} label="Toggle generate quotations" />
                </SettingRow>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">AI Persona Name</label>
                <input
                  value={aiSettings.persona}
                  onChange={e => setAiSettings(p => ({ ...p, persona: e.target.value }))}
                  placeholder="e.g. Sales Assistant"
                  className="w-full px-4 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tone of Voice</label>
                <div className="grid grid-cols-2 sm:flex gap-2">
                  {['Friendly', 'Professional', 'Casual', 'Formal'].map(t => (
                    <button
                      key={t}
                      onClick={() => setAiSettings(p => ({ ...p, tone: t }))}
                      className="sm:flex-1 py-2.5 sm:py-2 text-xs font-medium rounded-xl border transition"
                      style={aiSettings.tone === t
                        ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY }
                        : { borderColor: '#e5e7eb', color: '#6b7280' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400 text-center">
                Custom AI API key configuration coming soon
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <TeamTab currentUser={user} />
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
                {(!isActive || isTrial) && (
                  <div className="rounded-2xl p-4 border border-gray-100 bg-gray-50">
                    <div className="font-semibold text-gray-900 mb-0.5">
                      {isTrial ? 'Upgrade before your trial ends' : 'Choose a plan to get started'}
                    </div>
                    <div className="text-xs text-gray-400 mb-3">Unlimited AI messages · Multiple WhatsApp numbers · Priority support</div>
                    <button
                      onClick={() => navigate('/subscribe?upgrade=1')}
                      className="text-sm font-semibold text-white px-4 py-2.5 sm:py-2 rounded-xl hover:opacity-90 w-full sm:w-auto"
                      style={{ background: PRIMARY }}
                    >
                      {isTrial ? 'Upgrade Now' : 'View Plans'}
                    </button>
                  </div>
                )}
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