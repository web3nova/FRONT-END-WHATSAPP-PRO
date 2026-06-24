import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import {
  Building2, CreditCard, Brain, MessageCircle, DollarSign,
  TrendingUp, TrendingDown, MoreHorizontal, Activity
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'
const BLUE_LIGHT = '#dce5fd'

const revenueData = [
  { month: 'Jan', revenue: 28.4, tenants: 980 },
  { month: 'Feb', revenue: 31.2, tenants: 1020 },
  { month: 'Mar', revenue: 35.8, tenants: 1090 },
  { month: 'Apr', revenue: 38.5, tenants: 1140 },
  { month: 'May', revenue: 44.1, tenants: 1198 },
  { month: 'Jun', revenue: 48.2, tenants: 1247 },
]

const subscriptionTiers = [
  { name: 'Pro', value: 387, color: PRIMARY },
  { name: 'Starter', value: 523, color: '#7b96f8' },
  { name: 'Enterprise', value: 179, color: '#1e3fc2' },
  { name: 'Free', value: 158, color: '#c7d2fb' },
]

const aiUsageData = [
  { tenant: 'StyleEdits', tokens: 284 },
  { tenant: 'FashionHub', tokens: 231 },
  { tenant: 'LuxeBrand', tokens: 198 },
  { tenant: 'QuickMart', tokens: 175 },
  { tenant: 'TechStore', tokens: 143 },
]

const recentTenants = [
  { name: 'Perfect Style Edits', plan: 'Pro', status: 'active', joined: 'Jun 20, 2026', revenue: '₦124,000' },
  { name: 'Lagos Fashion Hub', plan: 'Starter', status: 'active', joined: 'Jun 19, 2026', revenue: '₦48,000' },
  { name: 'Abuja Tech Store', plan: 'Enterprise', status: 'active', joined: 'Jun 18, 2026', revenue: '₦380,000' },
  { name: 'Quick Mart NG', plan: 'Starter', status: 'suspended', joined: 'Jun 17, 2026', revenue: '₦0' },
  { name: 'Luxury Brands Co.', plan: 'Pro', status: 'active', joined: 'Jun 15, 2026', revenue: '₦196,000' },
  { name: 'Naija Fabrics Ltd', plan: 'Pro', status: 'active', joined: 'Jun 14, 2026', revenue: '₦88,000' },
]

const platformHealth = [
  { label: 'API Uptime', value: '99.97%', ok: true },
  { label: 'Avg Response Time', value: '142ms', ok: true },
  { label: 'WhatsApp Gateway', value: 'Operational', ok: true },
  { label: 'Vector DB (Qdrant)', value: 'Operational', ok: true },
  { label: 'Payment Gateway', value: 'Degraded', ok: false },
]

const planColors = {
  Pro: { bg: BLUE_LIGHT, color: PRIMARY },
  Starter: { bg: CREAM, color: PRIMARY },
  Enterprise: { bg: PRIMARY, color: '#ffffff' },
  Free: { bg: '#f1f5f9', color: '#64748b' },
}

function StatCard({ label, value, change, positive, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: CREAM }}>
          <Icon size={19} style={{ color: PRIMARY }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-gray-500' : 'text-gray-400'}`}>
          {positive ? <TrendingUp size={11} style={{ color: PRIMARY }} /> : <TrendingDown size={11} />}
          <span style={positive ? { color: PRIMARY } : {}}>{change}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2.5 text-sm">
        <div className="font-medium text-gray-700 mb-1">{label}</div>
        {payload.map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }}></div>
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminOverview() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time metrics across all tenants · Updated just now</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: CREAM, color: PRIMARY }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }}></div>
            All systems operational
          </div>
          <button
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Tenants" value="1,247" change="+12% this month" positive icon={Building2} />
        <StatCard label="Active Subscriptions" value="1,089" change="87.3% retention" positive icon={CreditCard} />
        <StatCard label="Monthly Revenue" value="₦48.2M" change="+8% vs last month" positive icon={DollarSign} />
        <StatCard label="AI Messages" value="2.4M" change="+34% usage" positive icon={Brain} />
        <StatCard label="WhatsApp Convos" value="847K" change="-3% from peak" positive={false} icon={MessageCircle} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Growth</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly platform revenue (₦ millions)</p>
            </div>
            <select className="text-xs border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-gray-500 focus:outline-none">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (₦M)"
                stroke={PRIMARY}
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 5, fill: PRIMARY, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription tiers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Subscription Tiers</h2>
            <p className="text-xs text-gray-400 mt-0.5">1,247 total tenants</p>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <PieChart>
              <Pie
                data={subscriptionTiers}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {subscriptionTiers.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, 'Tenants']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {subscriptionTiers.map(tier => (
              <div key={tier.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: tier.color }}></div>
                  <span className="text-sm text-gray-500">{tier.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{tier.value}</span>
                  <span className="text-xs text-gray-400">{Math.round(tier.value / 1247 * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-4">
        {/* AI usage bar */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900">AI Token Usage</h2>
            <p className="text-xs text-gray-400 mt-0.5">Top 5 tenants by AI consumption this month (K tokens)</p>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={aiUsageData} layout="vertical" barSize={22} margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="tenant" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip formatter={(val) => [`${val}K tokens`, 'AI Usage']} />
              <Bar dataKey="tokens" fill={PRIMARY} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform health */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} style={{ color: PRIMARY }} />
            <h2 className="font-semibold text-gray-900">Platform Health</h2>
          </div>
          <div className="space-y-3.5">
            {platformHealth.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: item.ok ? PRIMARY : '#f59e0b' }}
                  ></div>
                  <span className={`text-sm font-semibold ${item.ok ? 'text-gray-900' : 'text-amber-600'}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2">Tenant growth trend</div>
            <ResponsiveContainer width="100%" height={65}>
              <AreaChart data={revenueData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="tenantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="tenants" stroke={PRIMARY} strokeWidth={2} fill="url(#tenantGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tenants table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Tenants</h2>
            <p className="text-xs text-gray-400 mt-0.5">Newest businesses on the platform</p>
          </div>
          <button className="text-sm font-semibold hover:opacity-70 transition" style={{ color: PRIMARY }}>
            View all tenants →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: CREAM }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Business</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenue (MTD)</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTenants.map(tenant => {
                const pc = planColors[tenant.plan] || planColors.Free
                return (
                  <tr key={tenant.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: PRIMARY }}
                        >
                          {tenant.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg"
                        style={{ background: pc.bg, color: pc.color }}
                      >
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tenant.status === 'active' ? '' : 'text-gray-400'}`}
                        style={tenant.status === 'active' ? { color: PRIMARY } : {}}>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: tenant.status === 'active' ? PRIMARY : '#9ca3af' }}
                        ></div>
                        {tenant.status === 'active' ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{tenant.joined}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{tenant.revenue}</td>
                    <td className="px-5 py-3.5">
                      <button className="p-1 text-gray-300 hover:text-gray-500 rounded-lg transition">
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
