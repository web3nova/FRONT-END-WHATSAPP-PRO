import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CreditCard, Brain, MessageCircle,
  DollarSign, BarChart3, Settings, Bell, Search, Shield, ExternalLink
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin', end: true },
  { label: 'Tenants', icon: Building2, path: '/admin/tenants' },
  { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
  { label: 'AI Usage', icon: Brain, path: '/admin/ai-usage' },
  { label: 'WhatsApp', icon: MessageCircle, path: '/admin/whatsapp' },
  { label: 'Billing', icon: DollarSign, path: '/admin/billing' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200" style={{ background: CREAM }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: PRIMARY }}>
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">Web3Nova</div>
              <div className="text-xs text-gray-400">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`
              }
              style={({ isActive }) => isActive ? { background: PRIMARY } : {}}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Switch view */}
        <div className="px-3 pb-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 border border-dashed border-gray-200 transition-colors"
          >
            <ExternalLink size={15} />
            Switch to Business View
          </Link>
        </div>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: PRIMARY }}>
              SA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">Super Admin</div>
              <div className="text-xs text-gray-400 truncate">admin@web3nova.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition"
              placeholder="Search tenants, users..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: PRIMARY }}></span>
            </button>
            <div className="h-5 w-px bg-gray-200"></div>
            <div className="text-sm text-gray-400">June 24, 2026</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
