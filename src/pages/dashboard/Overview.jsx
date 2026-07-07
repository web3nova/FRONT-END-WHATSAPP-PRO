import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, ShoppingBag, DollarSign, Globe, MessageCircle, TrendingUp, Package, ArrowRight, Bot, FileText, BarChart2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listCustomers } from '../../api/customersApi'
import { listOrders } from '../../api/ordersApi'
import { listConversations } from '../../api/conversationsApi'
import { listQuotes } from '../../api/quotesApi'
import { API_BASE } from '../../lib/apiConfig'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'
const BLUE_LIGHT = '#dce5fd'

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

function EmptyPanel({ title, subtitle, height = 210 }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center" style={{ height }}>
      <BarChart2 size={22} className="text-gray-200 mb-2" />
      <div className="text-xs font-medium text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-300 mt-0.5">{subtitle}</div>}
    </div>
  )
}

export default function BusinessOverview() {
  const { user } = useAuth()
  const businessName = user?.businessName || user?.name || user?.email || 'your business'

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, conversations: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentChats, setRecentChats] = useState([])
  const [recentQuotes, setRecentQuotes] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [topProductChart, setTopProductChart] = useState([])

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('accessToken')
    const headers = { accept: 'application/json', Authorization: `Bearer ${token}` }
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    Promise.all([
      listCustomers({ limit: 1 }),
      listOrders({ limit: 200 }),
      listConversations({ limit: 4 }),
      listQuotes({ limit: 3 }),
      fetch(`${API_BASE}/products?limit=100&sort=sortOrder`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([custRes, ordRes, convRes, quoteRes, prodRes]) => {
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

      // Compute top products by order frequency
      const prodCounts = {}
      allOrders.forEach(o => {
        (o.items || []).forEach(item => {
          const id = item.productId || item.name || 'unknown'
          const name = item.name || item.productName || 'Unknown'
          if (!prodCounts[id]) prodCounts[id] = { name, sales: 0, revenue: 0 }
          prodCounts[id].sales += item.quantity || 1
          prodCounts[id].revenue += (item.priceMinor || 0) * (item.quantity || 1)
        })
      })

      // If no order-derived product data, fall back to catalog
      const sortedByOrders = Object.values(prodCounts).sort((a, b) => b.sales - a.sales).slice(0, 4)
      if (sortedByOrders.length > 0) {
        setTopProducts(sortedByOrders)
        setTopProductChart(sortedByOrders.map(p => ({
          name: p.name.length > 12 ? p.name.slice(0, 11) + '…' : p.name,
          revenue: Math.round(p.revenue / 100),
        })))
      } else {
        // fall back to catalog products (no sales data yet)
        const catalog = (prodRes.data ?? []).slice(0, 4).map(p => ({
          name: p.name,
          sales: 0,
          revenue: 0,
        }))
        setTopProducts(catalog)
        setTopProductChart([])
      }
    }).catch(() => {}).finally(() => {
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
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900">Revenue & Orders Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly time-series data coming soon</p>
          </div>
          <EmptyPanel title="Revenue trend will appear here" subtitle="Requires time-series analytics endpoint" height={210} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Customer Sources</h2>
            <p className="text-xs text-gray-400 mt-0.5">Where your customers come from</p>
          </div>
          <EmptyPanel title="Source analytics coming soon" height={155} />
          <div className="space-y-2 mt-3">
            {['WhatsApp', 'Website', 'Referral', 'Direct'].map(s => (
              <div key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gray-200"></div>
                  <span className="text-sm text-gray-400">{s}</span>
                </div>
                <span className="text-sm text-gray-300">—</span>
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
              <p className="text-xs text-gray-400 mt-0.5">Based on your order history</p>
            </div>
          </div>
          {loading ? (
            <EmptyPanel title="Loading…" height={160} />
          ) : topProductChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topProductChart} barSize={32} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v.toLocaleString()}`} />
                <Tooltip formatter={v => [`₦${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill={PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPanel title="No sales data yet" subtitle="Revenue will appear as orders come in" height={160} />
          )}
          {topProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {topProducts.map(p => (
                <div key={p.name} className="rounded-xl p-3 border border-gray-100 hover:border-blue-100 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: CREAM }}>
                    <Package size={14} style={{ color: PRIMARY }} />
                  </div>
                  <div className="text-xs font-semibold text-gray-800 mb-0.5 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.sales > 0 ? `${p.sales} sold` : 'No sales yet'}</div>
                </div>
              ))}
            </div>
          ) : !loading && (
            <p className="text-xs text-gray-400 text-center mt-4">Add products to your catalog to see them here</p>
          )}
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
