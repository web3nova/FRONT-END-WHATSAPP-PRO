import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import onboardingApi from '../services/onboardingService'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/apiFetch'
import { isOwner, isAdmin } from '../utils/permissions'
import {
  LayoutDashboard, ShoppingBag, Package, Users, MessageCircle,
  Globe, BarChart3, BookOpen, Settings, Bell, Search, ExternalLink, Menu, X, CreditCard,
  MessageSquare, ShoppingCart, CheckCircle, Wifi, CreditCard as CardIcon, AlertCircle, LogOut
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

// minRole: minimum role required to see this nav item (default: member = everyone)
const navItems = [
  { label: 'Overview',      icon: LayoutDashboard, path: '/dashboard',            end: true },
  { label: 'Orders',        icon: ShoppingBag,     path: '/dashboard/orders' },
  { label: 'Products',      icon: Package,         path: '/dashboard/products' },
  { label: 'Customers',     icon: Users,           path: '/dashboard/customers' },
  { label: 'WhatsApp',      icon: MessageCircle,   path: '/dashboard/whatsapp' },
  { label: 'Website',       icon: Globe,           path: '/dashboard/website',    minRole: 'admin' },
  { label: 'Analytics',     icon: BarChart3,       path: '/dashboard/analytics' },
  { label: 'Knowledge Base',icon: BookOpen,        path: '/dashboard/knowledge',  minRole: 'admin' },
  { label: 'Payments',      icon: CreditCard,      path: '/dashboard/payments',   minRole: 'admin' },
  { label: 'Settings',      icon: Settings,        path: '/dashboard/settings',   minRole: 'admin' },
]


function userInitials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (email || '?').slice(0, 2).toUpperCase()
}

const NOTIF_ICONS = {
  new_message:       { icon: MessageSquare, color: '#4166F5' },
  new_order:         { icon: ShoppingCart,  color: '#059669' },
  whatsapp_connected:{ icon: Wifi,          color: '#16a34a' },
  trial_started:     { icon: CheckCircle,   color: '#4166F5' },
  payment_received:  { icon: CardIcon,      color: '#059669' },
  default:           { icon: AlertCircle,   color: '#9ca3af' },
}

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function NotificationPanel({ onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/notifications', { noRedirect: true })
      const body = await res.json().catch(() => null)
      setItems(body?.data?.items ?? [])
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    apiFetch('/notifications/read-all', { method: 'PATCH', noRedirect: true }).catch(() => {})
  }, [load])

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Notifications</span>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X size={14} /></button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
        ) : items.map(n => {
          const cfg = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.default
          const Icon = cfg.icon
          return (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition ${!n.read ? 'bg-blue-50/40' : ''}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}18` }}>
                <Icon size={14} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 leading-tight">{n.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{n.body}</div>
                <div className="text-[10px] text-gray-400 mt-1">{relTime(n.createdAt)}</div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#4166F5' }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrialBanner({ subscription }) {
  if (!subscription || subscription.status !== 'TRIAL' || !subscription.trialEndsAt) return null
  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - Date.now()) / 86400000))
  const color = daysLeft <= 2 ? '#dc2626' : daysLeft <= 5 ? '#d97706' : PRIMARY
  const bg = daysLeft <= 2 ? '#fee2e2' : daysLeft <= 5 ? '#fef3c7' : '#dce5fd'
  return (
    <div className="mx-3 mb-3 rounded-xl px-3 py-2.5 flex-shrink-0" style={{ background: bg }}>
      <div className="text-xs font-semibold" style={{ color }}>
        {daysLeft === 0 ? 'Trial expires today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left on trial`}
      </div>
      <div className="text-xs mt-0.5" style={{ color, opacity: 0.75 }}>Upgrade to keep access</div>
    </div>
  )
}

export default function BusinessLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, subscription, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const initials = userInitials(user?.name, user?.email)
  const displayName = user?.name || user?.email || 'Account'
  const displayEmail = user?.email || ''
  const [unread, setUnread] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  // Poll unread count every 30s
  useEffect(() => {
    const fetchUnread = () =>
      apiFetch('/notifications', { noRedirect: true }).then(r => r.json()).then(b => setUnread(b?.data?.unread ?? 0)).catch(() => {})
    fetchUnread()
    const t = setInterval(fetchUnread, 30000)
    return () => clearInterval(t)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const profile = await onboardingApi.getProfile()
        if (!cancelled) {
          setBusinessName(profile?.displayName || profile?.businessName || '')
          setLogoUrl(profile?.logoUrl || '')
        }
      } catch {
        // No business profile yet — still let them into the dashboard
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [navigate])

  if (checking) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm">Loading dashboard…</span>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col border-r border-gray-200 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: CREAM }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: PRIMARY }}>
              {logoUrl
                ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                : <Zap size={16} className="text-white" />}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-900 text-sm leading-tight truncate">
                {businessName || 'BizAI'}
              </div>
              <div className="text-xs text-gray-400">Business Dashboard</div>
            </div>
          </div>
          <button
            className="ml-auto lg:hidden p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav — min-h-0 ensures it shrinks so bottom sections stay visible */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => !item.minRole || isAdmin(user)).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`
              }
              style={({ isActive }) => isActive ? { background: PRIMARY } : {}}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <TrialBanner subscription={subscription} />

        {/* User + logout at bottom */}
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: PRIMARY }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
              <div className="text-xs text-gray-400 truncate">{displayEmail}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0">
          <button
            className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 rounded-xl"
            onClick={() => setSidebarOpen(v => !v)}
          >
            <Menu size={20} />
          </button>
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-52 lg:w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition"
              placeholder="Search orders, customers..."
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); if (!notifOpen) setUnread(0) }}
                className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
