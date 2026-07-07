import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import onboardingApi from '../services/onboardingService'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ShoppingBag, Package, Users, MessageCircle,
  Globe, BarChart3, BookOpen, Settings, Bell, Search, Zap, ExternalLink, Menu, X, CreditCard
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard', end: true },
  { label: 'Orders', icon: ShoppingBag, path: '/dashboard/orders' },
  { label: 'Products', icon: Package, path: '/dashboard/products' },
  { label: 'Customers', icon: Users, path: '/dashboard/customers' },
  { label: 'WhatsApp AI', icon: MessageCircle, path: '/dashboard/whatsapp' },
  { label: 'Website', icon: Globe, path: '/dashboard/website' },
  { label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
  { label: 'Knowledge Base', icon: BookOpen, path: '/dashboard/knowledge' },
  { label: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
]

const ORDER_PAGES = ['/dashboard', '/dashboard/orders', '/dashboard/products']

function userInitials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (email || '?').slice(0, 2).toUpperCase()
}

export default function BusinessLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)
  const [businessName, setBusinessName] = useState('')

  const showNewOrder = ORDER_PAGES.includes(location.pathname)
  const initials = userInitials(user?.name, user?.email)
  const displayName = user?.name || user?.email || 'Account'
  const displayEmail = user?.email || ''

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const profile = await onboardingApi.getProfile()
        if (!cancelled) {
          setBusinessName(profile?.displayName || profile?.businessName || '')
          setChecking(false)
        }
        return
      } catch {
        // No business profile yet
      }

      try {
        const statusData = await onboardingApi.checkStatus()
        const onboardingDone = statusData?.allPanelsDone === true
        if (!cancelled) {
          navigate(onboardingDone ? '/business-profile' : '/onboarding', { replace: true })
        }
      } catch {
        if (!cancelled) setChecking(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [navigate])

  if (checking) return null

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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: PRIMARY }}>
              <Zap size={16} className="text-white" />
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
          {navItems.map(item => (
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
            {showNewOrder && (
              <button
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90"
                style={{ background: PRIMARY }}
              >
                <Zap size={14} />
                New Order
              </button>
            )}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"></span>
            </button>
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
