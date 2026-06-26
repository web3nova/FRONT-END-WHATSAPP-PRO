import { useState } from 'react'
import { User, MessageCircle, Bot, Bell, Users, CreditCard, Check, Plus, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react'

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

const teamMembers = [
  { name: 'Adaeze Okafor', email: 'adaeze@styleedits.com', role: 'Owner', avatar: 'AO' },
  { name: 'Tunde Bakare', email: 'tunde@styleedits.com', role: 'Staff', avatar: 'TB' },
  { name: 'Ngozi Eze', email: 'ngozi@styleedits.com', role: 'Staff', avatar: 'NE' },
]

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}>
      {on
        ? <ToggleRight size={26} style={{ color: PRIMARY }} />
        : <ToggleLeft size={26} className="text-gray-300" />}
    </button>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showKey, setShowKey] = useState(false)
  const [toggles, setToggles] = useState({
    aiAutoReply: true, collectMeasurements: true, generateQuotes: true,
    orderNotif: true, whatsappNotif: true, emailNotif: false, weeklyReport: true,
    aiReply: true,
  })

  const tog = key => setToggles(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your business profile and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar tabs */}
        <div className="w-full md:w-52 flex-shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none flex-nowrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition"
              style={activeTab === t.id
                ? { background: PRIMARY, color: '#fff' }
                : { color: '#6b7280', background: 'transparent' }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Business Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Business Profile</h2>
              {/* Logo */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: PRIMARY }}>PS</div>
                <div>
                  <button className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
                    Upload Logo
                  </button>
                  <div className="text-xs text-gray-400 mt-1">PNG or JPG · Max 2MB · Recommended 400×400px</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Business Name', value: 'Perfect Style Edits', full: true },
                  { label: 'Tagline', value: 'Custom Made & Ready To Wear Fashion', full: true },
                  { label: 'Phone Number', value: '+234 801 234 5678' },
                  { label: 'Email', value: 'hello@perfectstyleedits.com' },
                  { label: 'City', value: 'Lagos' },
                  { label: 'Country', value: 'Nigeria' },
                ].map(f => (
                  <div key={f.label} className={f.full ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 bg-gray-50"
                      style={{ '--tw-ring-color': PRIMARY }}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Business Description</label>
                  <textarea
                    rows={3}
                    defaultValue="We create beautiful custom-made and ready-to-wear fashion for all occasions. Specialising in bridal gowns, native attire, and contemporary styles."
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none resize-none bg-gray-50"
                  />
                </div>
              </div>
              <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
                Save Changes
              </button>
            </div>
          )}

          {/* WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">WhatsApp Connection</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 gap-3" style={{ background: CREAM }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dce5fd' }}>
                    <MessageCircle size={18} style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">+234 801 234 5678</div>
                    <div className="text-xs font-medium" style={{ color: PRIMARY }}>● Connected via WhatsApp Business API</div>
                  </div>
                </div>
                <button className="text-sm font-semibold text-red-400 border border-red-200 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 transition w-full sm:w-auto">
                  Disconnect
                </button>
              </div>
              <div>
                <SettingRow label="AI Auto-Reply" desc="Let AI respond to customer messages automatically">
                  <Toggle on={toggles.aiReply} onToggle={() => tog('aiReply')} />
                </SettingRow>
                <SettingRow label="Welcome Message" desc="Sent when a new customer messages you">
                  <button className="text-xs font-semibold" style={{ color: PRIMARY }}>Edit</button>
                </SettingRow>
                <SettingRow label="Business Hours" desc="Only respond during these hours">
                  <button className="text-xs font-semibold" style={{ color: PRIMARY }}>Configure</button>
                </SettingRow>
                <SettingRow label="Away Message" desc="Sent outside business hours">
                  <button className="text-xs font-semibold" style={{ color: PRIMARY }}>Edit</button>
                </SettingRow>
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">AI Settings</h2>
              <div>
                <SettingRow label="AI Auto-Reply" desc="AI handles customer conversations automatically">
                  <Toggle on={toggles.aiAutoReply} onToggle={() => tog('aiAutoReply')} />
                </SettingRow>
                <SettingRow label="Collect Measurements" desc="AI asks for body measurements when needed">
                  <Toggle on={toggles.collectMeasurements} onToggle={() => tog('collectMeasurements')} />
                </SettingRow>
                <SettingRow label="Generate Quotations" desc="AI automatically generates price quotes">
                  <Toggle on={toggles.generateQuotes} onToggle={() => tog('generateQuotes')} />
                </SettingRow>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">AI Persona Name</label>
                <input defaultValue="Style Assistant" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tone of Voice</label>
                <div className="flex gap-2">
                  {['Friendly', 'Professional', 'Casual', 'Formal'].map((t, i) => (
                    <button key={t} className="flex-1 py-2 text-xs font-medium rounded-xl border transition"
                      style={i === 0 ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Language</label>
                <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none">
                  <option>English</option>
                  <option>Pidgin English</option>
                  <option>Yoruba</option>
                  <option>Igbo</option>
                  <option>Hausa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      defaultValue="sk-proj-xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none pr-10"
                    />
                    <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <button className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90" style={{ background: PRIMARY }}>Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Team Members</h2>
                <button className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90" style={{ background: PRIMARY }}>
                  <Plus size={14} /> Invite Member
                </button>
              </div>
              <div className="space-y-3">
                {teamMembers.map((m, i) => (
                  <div key={m.email} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: PRIMARY }}>
                        {m.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        defaultValue={m.role}
                        disabled={m.role === 'Owner'}
                        className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none disabled:opacity-60"
                      >
                        <option>Owner</option>
                        <option>Staff</option>
                        <option>Viewer</option>
                      </select>
                      {m.role !== 'Owner' && (
                        <button className="p-1.5 text-gray-300 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-1">
              <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <SettingRow label="New Order" desc="Get notified when a customer places an order">
                <Toggle on={toggles.orderNotif} onToggle={() => tog('orderNotif')} />
              </SettingRow>
              <SettingRow label="WhatsApp Escalations" desc="Notify when AI can't handle a customer">
                <Toggle on={toggles.whatsappNotif} onToggle={() => tog('whatsappNotif')} />
              </SettingRow>
              <SettingRow label="Email Notifications" desc="Receive email summaries">
                <Toggle on={toggles.emailNotif} onToggle={() => tog('emailNotif')} />
              </SettingRow>
              <SettingRow label="Weekly Report" desc="Summary of your weekly business performance">
                <Toggle on={toggles.weeklyReport} onToggle={() => tog('weeklyReport')} />
              </SettingRow>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Billing & Plan</h2>
              {/* Current plan */}
              <div className="rounded-2xl p-5 border-2" style={{ borderColor: PRIMARY, background: '#dce5fd' }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Pro Plan</div>
                    <div className="text-sm text-gray-500">₦15,000 / month · Renews July 24, 2026</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: PRIMARY }}>
                    <Check size={14} /> Active
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  {['5,000 AI messages/month', '1 WhatsApp number', 'Custom website', 'Priority support'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={13} style={{ color: PRIMARY }} /> {f}
                    </div>
                  ))}
                </div>
              </div>
              {/* AI Usage */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">AI Messages Used</span>
                  <span className="font-semibold text-gray-900">2,400 / 5,000</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '48%', background: PRIMARY }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">48% used · 2,600 remaining this month</div>
              </div>
              {/* Upgrade */}
              <div className="rounded-2xl p-4 border border-gray-100 bg-gray-50">
                <div className="font-semibold text-gray-900 mb-0.5">Enterprise Plan</div>
                <div className="text-xs text-gray-400 mb-3">Unlimited AI messages · Multiple WhatsApp numbers · Dedicated support</div>
                <button className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90" style={{ background: PRIMARY }}>
                  Upgrade to Enterprise
                </button>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment History</div>
                {['Jun 24, 2026', 'May 24, 2026', 'Apr 24, 2026'].map(d => (
                  <div key={d} className="flex items-center justify-between py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Pro Plan · {d}</span>
                    <span className="text-sm font-semibold text-gray-900">₦15,000</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
