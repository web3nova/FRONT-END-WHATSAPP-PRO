import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import {
  Users, ShoppingBag, DollarSign, Globe, MessageCircle,
  TrendingUp, Package, ArrowRight, Bot, FileText
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listCustomers } from '../../api/customersApi'
import { listOrders } from '../../api/ordersApi'
import { listConversations } from '../../api/conversationsApi'
import { listQuotes } from '../../api/quotesApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'
const BLUE_LIGHT = '#dce5fd'

// Charts stay illustrative — backend has no time-series analytics endpoint
const monthlyData = [
  { month: 'Jan', revenue: 1800, orders: 42 },
  { month: 'Feb', revenue: 2400, orders: 58 },
  { month: 'Mar', revenue: 3100, orders: 71 },
  { month: 'Apr', revenue: 2800, orders: 65 },
  { month: 'May', revenue: 4200, orders: 98 },
  { month: 'Jun', revenue: 5100, orders: 112 },
]

const customerSources = [
  { name: 'WhatsApp', value: 64, color: PRIMARY },
  { name: 'Website',  value: 22, color: '#7b96f8' },
  { name: 'Referral', value: 9,  color: '#1e3fc2' },
  { name: 'Direct',   value: 5,  color: '#c7d2fb' },
]

const topProducts = [
  { name: 'Corset Dress',  sales: 52, revenue: 4160000 },
  { name: 'Bridal Gown',   sales: 38, revenue: 2280000 },
  { name: 'Native Attire', sales: 41, revenue: 1640000 },
  { name: 'Senator Wear',  sales: 29, revenue: 1450000 },
]

const ORDER_STATUS = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#D97706' },
  confirmed: { label: 'Confirmed', bg: BLUE_LIGHT,  color: PRIMARY },
  paid:      { label: 'Paid',      bg: BLUE_LIGHT,  color: '#1e3fc2' },
  fulfilled: { label: 'Fulfilled', bg: '#D1FAE5',   color: '#059669' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2',   color: '#DC2626' },
}

const QUOTE_STATUS = {
  draft:     { label: 'Draft',     bg: '#f3f4f6', color: '#6b7280' },
  sent:      { label: 'Awaiting',  bg: CREAM,     color: '#78350f' },
  accepted:  { label: 'Accepted',  bg: BLUE_LIGHT, color: PRIMARY },
  rejected:  { label: 'Rejected',  bg: '#fee2e2', color: '#dc2626' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#dc2626' },
}

function formatAmount(minor = 0) {
  return `₦${(minor / 100).toLocaleString()}`
}

function shortId(uuid = '') {
  return `#${uuid.slice(0, 8).toUpperCase()}`
}

function extractProduct(items) {
  if (!Array.isArray(items) || !items.length) return '—'
  return items[0]?.name || items[0]?.productName || '—'
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function StatCard({ label, value, sub, positive, icon: Icon, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl" style={{ background: CREAM }}>
          <Icon size={19} style={{ color: PRIMARY }} />
        </div>
        {positive !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: positive ? PRIMARY : '#9ca3af' }}>
            {positive && <TrendingUp size={11} />}
            {sub}
          </div>
        )}
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

const avatarColors = [PRIMARY, '#1e3fc2', '#7b96f8', '#4166F5', '#2952d9', '#3457e8']

export default function BusinessOverview() {
  const { user } = useAuth()
  const businessName = user?.businessName || user?.name || user?.email || 'your business'

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, conversations: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [recentQuotes, setRecentQuotes] = useState([])

  useEffect(() => {
    let ignore = false
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    Promise.all([
      listCustomers({ limit: 1 }),
      listOrders({ limit: 100 }),
      listConversations({ limit: 4 }),
      listQuotes({ limit: 3 }),
    ]).then(([custRes, ordRes, convRes, quoteRes]) => {
      if (ignore) return

      const allOrders = ordRes.data
      const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart)
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalMinor || 0), 0)

      setStats({
        customers: custRes.meta?.total ?? 0,
        orders: monthOrders.length,
        revenue: monthRevenue,
        conversations: convRes.meta?.total ?? convRes.data.length,
      })
      setRecentOrders(allOrders.slice(0, 5))
      setRecentChats(convRes.data)
      setRecentQuotes(quoteRes.data.slice(0, 3))
    }).catch(() => {
      // silently fail — page renders with zeroes
    }).finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => { ignore = true }
  }, [])

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Welcome back, {businessName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your business today · {today}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:block px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition">
            Download Report
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            + New Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Customers"   value={loading ? '…' : stats.customers.toLocaleString()} sub="all time"   positive icon={Users} />
        <StatCard label="Orders This Month" value={loading ? '…' : stats.orders}                     sub="this month" positive icon={ShoppingBag} />
        <StatCard label="Monthly Revenue"   value={loading ? '…' : formatAmount(stats.revenue)}      sub="this month" positive icon={DollarSign} />
        <StatCard label="Website Visits"    value="—"                                                 sub="no data"    positive={false} icon={Globe} />
        <StatCard label="Conversations"     value={loading ? '…' : stats.conversations.toLocaleString()} sub="total"  positive icon={MessageCircle} className="col-span-2 md:col-span-1 lg:col-span-1" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue & Orders Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Illustrative monthly overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: PRIMARY }}></div>
                <span className="text-gray-400">Revenue (₦K)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: BLUE_LIGHT }}></div>
                <span className="text-gray-400">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b96f8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7b96f8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left"  type="monotone" dataKey="revenue" name="Revenue (₦K)" stroke={PRIMARY}   strokeWidth={2.5} fill="url(#revGrad2)" dot={false} activeDot={{ r: 5, fill: PRIMARY,   strokeWidth: 0 }} />
              <Area yAxisId="right" type="monotone" dataKey="orders"  name="Orders"       stroke="#7b96f8" strokeWidth={2}   fill="url(#ordGrad)"  dot={false} activeDot={{ r: 4, fill: '#7b96f8', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Customer Sources</h2>
            <p className="text-xs text-gray-400 mt-0.5">Where your customers come from</p>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <PieChart>
              <Pie data={customerSources} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                {customerSources.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {customerSources.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }}></div>
                  <span className="text-sm text-gray-500">{s.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders + Chats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest customer orders</p>
            </div>
            <button className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition" style={{ color: PRIMARY }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No orders yet.</div>
            ) : recentOrders.map(order => {
              const s = ORDER_STATUS[order.status] || { label: order.status, bg: '#f3f4f6', color: '#6b7280' }
              const name = order.customer?.name || 'Unknown'
              const product = extractProduct(order.items)
              const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              return (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: PRIMARY }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400">{product} · {date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">{formatAmount(order.totalMinor)}</div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">WhatsApp Conversations</h2>
              <p className="text-xs text-gray-400 mt-0.5">Recent conversations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }}></div>
              AI Online
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
            ) : recentChats.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No conversations yet.</div>
            ) : recentChats.map((conv, i) => {
              const name = conv.customer?.name || conv.customer?.phone || 'Unknown'
              const av = name.slice(0, 2).toUpperCase()
              return (
                <div key={conv.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: avatarColors[i % avatarColors.length] }}
                  >
                    {av}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{relativeTime(conv.updatedAt)}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.status === 'open' ? 'Active conversation' : 'Resolved'}
                    </div>
                    {conv.status === 'open' && (
                      <div className="flex items-center gap-1 mt-1">
                        <Bot size={10} style={{ color: PRIMARY }} />
                        <span className="text-xs" style={{ color: PRIMARY }}>AI responding</span>
                      </div>
                    )}
                  </div>
                  {conv.status === 'open' && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: PRIMARY }}></div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Total: <span className="font-semibold text-gray-700">{stats.conversations}</span> conversations</span>
              <button className="font-semibold hover:opacity-70 transition" style={{ color: PRIMARY }}>Open inbox →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products + Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Top Products by Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Illustrative monthly performance</p>
            </div>
            <button className="text-sm font-semibold flex items-center gap-1 hover:opacity-70 transition" style={{ color: PRIMARY }}>
              Manage <ArrowRight size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topProducts} barSize={32} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={v => [`₦${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill={PRIMARY} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {topProducts.map(p => (
              <div key={p.name} className="rounded-xl p-3 border border-gray-100 hover:border-blue-100 transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: CREAM }}>
                  <Package size={14} style={{ color: PRIMARY }} />
                </div>
                <div className="text-xs font-semibold text-gray-800 mb-0.5">{p.name}</div>
                <div className="text-xs text-gray-400">{p.sales} sold</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Quotations</h2>
              <p className="text-xs text-gray-400 mt-0.5">AI-generated quotes</p>
            </div>
            <FileText size={15} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
            ) : recentQuotes.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No quotes yet.</div>
            ) : recentQuotes.map(q => {
              const s = QUOTE_STATUS[q.status] || { label: q.status, bg: '#f3f4f6', color: '#6b7280' }
              const customer = q.customer?.name || 'Unknown'
              const item = q.details?.item || q.details?.description || '—'
              return (
                <div key={q.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{item}</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{shortId(q.id)}</span>
                    <span className="text-sm font-bold text-gray-900">{formatAmount(q.amountMinor)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <button className="w-full text-center text-sm font-semibold hover:opacity-70 transition" style={{ color: PRIMARY }}>
              View all quotations →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
