import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Users, ShoppingBag, MessageCircle, Globe, BarChart2 } from 'lucide-react'
import { listOrders } from '../../api/ordersApi'
import { listCustomers } from '../../api/customersApi'
import { listConversations } from '../../api/conversationsApi'
import { API_BASE } from '../../lib/apiConfig'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

function formatRevenue(minor = 0) {
  const val = minor / 100
  if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`
  return `₦${val.toLocaleString()}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
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

function EmptyChart({ title, subtitle, height = 190 }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center"
      style={{ height }}
    >
      <BarChart2 size={22} className="text-gray-200 mb-2" />
      <div className="text-xs font-medium text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-300 mt-0.5">{subtitle}</div>}
    </div>
  )
}

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '3 months', days: 90 },
  { label: '1 year', days: 365 },
]

const SOURCE_COLORS = { whatsapp: '#25D366', website: PRIMARY, referral: '#f59e0b', direct: '#94a3b8' }
const SOURCE_LABELS = { whatsapp: 'WhatsApp', website: 'Website', referral: 'Referral', direct: 'Direct' }

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [kpis, setKpis] = useState({ revenue: null, orders: null, customers: null, messages: null })
  const [dailyRevenue, setDailyRevenue] = useState([])
  const [productData, setProductData] = useState([])
  const [websiteVisits, setWebsiteVisits] = useState(null)
  const [trafficSources, setTrafficSources] = useState(null)
  const [customerGrowth, setCustomerGrowth] = useState([])
  const [messagesBySender, setMessagesBySender] = useState(null)

  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem('accessToken')
    const headers = { accept: 'application/json', Authorization: `Bearer ${token}` }
    const now = new Date()
    const rangeAgo = new Date(now)
    rangeAgo.setDate(now.getDate() - (days - 1))

    Promise.all([
      listOrders({ limit: 200 }),
      listCustomers({ limit: 1 }),
      listConversations({ limit: 1 }),
      fetch(`${API_BASE}/products?limit=100`, { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${API_BASE}/analytics/overview?days=${days}`, { headers }).then(r => r.json()).catch(() => ({ data: null })),
    ]).then(([ordRes, custRes, convRes, prodRes, analyticsRes]) => {
      const allOrders = ordRes.data ?? []
      const rangeOrders = allOrders.filter(o => new Date(o.createdAt) >= rangeAgo)
      const rangeRevenue = rangeOrders.reduce((s, o) => s + (o.totalMinor || 0), 0)

      setKpis({
        revenue: rangeRevenue,
        orders: rangeOrders.length,
        customers: custRes.meta?.total ?? 0,
        messages: convRes.meta?.total ?? 0,
      })

      // Build daily revenue for the selected range from real orders
      const dayList = Array.from({ length: days }, (_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (days - 1 - i))
        return d
      })
      const daily = dayList.map(d => {
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        const dayOrders = allOrders.filter(o => {
          const od = new Date(o.createdAt)
          return od.toDateString() === d.toDateString()
        })
        return {
          day: label,
          revenue: Math.round(dayOrders.reduce((s, o) => s + (o.totalMinor || 0), 0) / 100),
          orders: dayOrders.length,
        }
      })
      setDailyRevenue(daily)

      // Product order counts from orders
      const prodCounts = {}
      allOrders.forEach(o => {
        (o.items || []).forEach(item => {
          const name = item.name || item.productName || 'Unknown'
          prodCounts[name] = (prodCounts[name] || 0) + (item.quantity || 1)
        })
      })
      const sorted = Object.entries(prodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, orders]) => ({ name: name.length > 14 ? name.slice(0, 13) + '…' : name, orders }))
      setProductData(sorted)

      const a = analyticsRes?.data
      setWebsiteVisits(a?.websiteVisits ?? null)
      setTrafficSources(a?.trafficSources ?? null)
      setCustomerGrowth(a?.customerGrowth ?? [])
      setMessagesBySender(a?.messagesBySender ?? null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [days])

  const hasActivity = kpis.orders !== null && (kpis.orders > 0 || kpis.messages > 0)
  const trafficSourceRows = trafficSources
    ? Object.entries(trafficSources).map(([key, value]) => ({ key, value, label: SOURCE_LABELS[key], color: SOURCE_COLORS[key] }))
    : []
  const trafficPieData = trafficSourceRows.filter(r => r.value > 0)
  let runningTotal = 0
  const customerGrowthCumulative = customerGrowth.map(d => {
    runningTotal += d.count
    return { day: d.day, count: runningTotal }
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Performance insights for your business</p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 flex-nowrap w-full sm:w-auto scrollbar-none">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-xl transition"
              style={days === r.days ? { background: PRIMARY, color: '#fff' } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: `Revenue (${days}d)`, value: loading ? '…' : kpis.revenue !== null ? formatRevenue(kpis.revenue * 100) : '—', icon: TrendingUp },
          { label: `Orders (${days}d)`,  value: loading ? '…' : kpis.orders ?? '—',     icon: ShoppingBag },
          { label: 'Customers',   value: loading ? '…' : kpis.customers ?? '—',   icon: Users },
          { label: 'Conversations', value: loading ? '…' : kpis.messages ?? '—',  icon: MessageCircle },
          { label: 'Website Visits', value: loading ? '…' : websiteVisits ? websiteVisits.total : '—', icon: Globe },
        ].map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${idx === 4 ? 'col-span-2 md:col-span-1 lg:col-span-1' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: CREAM }}>
                <kpi.icon size={16} style={{ color: PRIMARY }} />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Daily Revenue (This Week)</h2>
              <p className="text-xs text-gray-400 mt-0.5">Revenue in ₦ · Orders count</p>
            </div>
          </div>
          {loading ? (
            <EmptyChart title="Loading…" height={200} />
          ) : dailyRevenue.every(d => d.revenue === 0 && d.orders === 0) ? (
            <EmptyChart title="No orders yet this week" subtitle="Revenue will appear as orders come in" height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₦)" stroke={PRIMARY} strokeWidth={2.5} fill="url(#dayGrad)" dot={false} activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">Traffic Sources</h2>
          <p className="text-xs text-gray-400 mb-4">Where customers find you</p>
          {loading ? (
            <EmptyChart title="Loading…" height={145} />
          ) : trafficPieData.length === 0 ? (
            <EmptyChart title="No storefront visits yet" subtitle="Sources appear once your site gets traffic" height={145} />
          ) : (
            <ResponsiveContainer width="100%" height={145}>
              <PieChart>
                <Pie data={trafficPieData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2}>
                  {trafficPieData.map(r => <Cell key={r.key} fill={r.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-4">
            {trafficSourceRows.map(r => (
              <div key={r.key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ background: r.color }}></div>
                  <span className="text-gray-500">{r.label}</span>
                </div>
                <span className="text-xs text-gray-400">{loading ? '…' : r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">Top Products</h2>
          <p className="text-xs text-gray-400 mb-4">Orders by product</p>
          {loading ? (
            <EmptyChart title="Loading…" />
          ) : productData.length === 0 ? (
            <EmptyChart title="No orders yet" subtitle="Top products will appear once you have orders" />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={productData} layout="vertical" barSize={18} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => [v, 'Orders']} />
                <Bar dataKey="orders" fill={PRIMARY} radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Customer growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">Customer Growth</h2>
          <p className="text-xs text-gray-400 mb-4">New customers over the selected range</p>
          {loading ? (
            <EmptyChart title="Loading…" height={190} />
          ) : customerGrowthCumulative.every(d => d.count === 0) ? (
            <EmptyChart title="No new customers yet" subtitle="Growth will appear as customers sign up" height={190} />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={customerGrowthCumulative} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Customers" stroke={PRIMARY} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* WhatsApp breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">WhatsApp Messages</h2>
          <p className="text-xs text-gray-400 mb-4">AI vs Staff handled</p>
          {loading ? (
            <EmptyChart title="Loading…" height={190} />
          ) : !messagesBySender || (messagesBySender.ai === 0 && messagesBySender.staff === 0) ? (
            <EmptyChart title="No messages yet" subtitle="Breakdown appears once conversations happen" height={190} />
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={[{ name: 'AI', count: messagesBySender.ai }, { name: 'Staff', count: messagesBySender.staff }]} barSize={36} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip formatter={v => [v, 'Messages']} />
                <Bar dataKey="count" fill={PRIMARY} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
