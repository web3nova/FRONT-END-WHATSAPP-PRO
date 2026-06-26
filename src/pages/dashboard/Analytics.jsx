import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Users, ShoppingBag, MessageCircle, Globe } from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const dailyRevenue = [
  { day: 'Jun 18', revenue: 240, orders: 6 },
  { day: 'Jun 19', revenue: 180, orders: 4 },
  { day: 'Jun 20', revenue: 320, orders: 8 },
  { day: 'Jun 21', revenue: 410, orders: 10 },
  { day: 'Jun 22', revenue: 290, orders: 7 },
  { day: 'Jun 23', revenue: 510, orders: 13 },
  { day: 'Jun 24', revenue: 380, orders: 9 },
]

const monthlyRevenue = [
  { month: 'Jan', revenue: 1800 }, { month: 'Feb', revenue: 2400 },
  { month: 'Mar', revenue: 3100 }, { month: 'Apr', revenue: 2800 },
  { month: 'May', revenue: 4200 }, { month: 'Jun', revenue: 5100 },
]

const productData = [
  { name: 'Corset Dress', orders: 52 },
  { name: 'Bridal Gown', orders: 38 },
  { name: 'Native Attire', orders: 41 },
  { name: 'Senator Wear', orders: 29 },
  { name: 'Lace Gown', orders: 24 },
]

const customerGrowth = [
  { month: 'Jan', customers: 2800 }, { month: 'Feb', customers: 2960 },
  { month: 'Mar', customers: 3080 }, { month: 'Apr', customers: 3190 },
  { month: 'May', customers: 3320 }, { month: 'Jun', customers: 3481 },
]

const trafficSources = [
  { name: 'WhatsApp', value: 64, color: PRIMARY },
  { name: 'Website', value: 22, color: '#7b96f8' },
  { name: 'Referral', value: 9, color: '#1e3fc2' },
  { name: 'Direct', value: 5, color: '#c7d2fb' },
]

const whatsappData = [
  { day: 'Mon', ai: 420, staff: 18 }, { day: 'Tue', ai: 380, staff: 22 },
  { day: 'Wed', ai: 510, staff: 15 }, { day: 'Thu', ai: 460, staff: 20 },
  { day: 'Fri', ai: 590, staff: 28 }, { day: 'Sat', ai: 710, staff: 35 },
  { day: 'Sun', ai: 340, staff: 12 },
]

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

export default function Analytics() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Performance insights for your business</p>
        </div>
        <div className="flex items-center gap-2">
          {['7 days', '30 days', '3 months', '1 year'].map((r, i) => (
            <button
              key={r}
              className="px-3 py-1.5 text-xs font-medium rounded-xl transition"
              style={i === 0 ? { background: PRIMARY, color: '#fff' } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Revenue (7d)', value: '₦2.33M', change: '+14%', icon: TrendingUp },
          { label: 'Orders (7d)', value: '57', change: '+21%', icon: ShoppingBag },
          { label: 'New Customers', value: '34', change: '+8%', icon: Users },
          { label: 'WhatsApp Msgs', value: '3,409', change: '+32%', icon: MessageCircle },
          { label: 'Website Visits', value: '2,840', change: '+11%', icon: Globe },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: CREAM }}>
                <kpi.icon size={16} style={{ color: PRIMARY }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{kpi.change}</span>
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
              <p className="text-xs text-gray-400 mt-0.5">Revenue in ₦ thousands · Orders count</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 inline-block rounded" style={{ background: PRIMARY }}></span>Revenue</span>
              <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 inline-block rounded bg-blue-200"></span>Orders</span>
            </div>
          </div>
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
              <Area type="monotone" dataKey="revenue" name="Revenue (₦K)" stroke={PRIMARY} strokeWidth={2.5} fill="url(#dayGrad)" dot={false} activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">Traffic Sources</h2>
          <p className="text-xs text-gray-400 mb-4">Where customers find you</p>
          <ResponsiveContainer width="100%" height={145}>
            <PieChart>
              <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {trafficSources.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {trafficSources.map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ background: s.color }}></div>
                  <span className="text-gray-500">{s.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{s.value}%</span>
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
          <p className="text-xs text-gray-400 mb-4">Orders this month</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={productData} layout="vertical" barSize={18} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={v => [v, 'Orders']} />
              <Bar dataKey="orders" fill={PRIMARY} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">Customer Growth</h2>
          <p className="text-xs text-gray-400 mb-4">Total customers over time</p>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={customerGrowth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[2600, 3600]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="customers" name="Customers" stroke={PRIMARY} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* WhatsApp breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-w-0 overflow-hidden">
          <h2 className="font-semibold text-gray-900 mb-1">WhatsApp Messages</h2>
          <p className="text-xs text-gray-400 mb-4">AI vs Staff handled (this week)</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={whatsappData} barSize={14} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ai" name="AI Handled" fill={PRIMARY} radius={[3, 3, 0, 0]} />
              <Bar dataKey="staff" name="Staff Handled" fill="#c7d2fb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
