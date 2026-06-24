import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import {
  Users, ShoppingBag, DollarSign, Globe, MessageCircle,
  TrendingUp, Package, ArrowRight, Bot, FileText
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'
const BLUE_LIGHT = '#dce5fd'

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
  { name: 'Website', value: 22, color: '#7b96f8' },
  { name: 'Referral', value: 9, color: '#1e3fc2' },
  { name: 'Direct', value: 5, color: '#c7d2fb' },
]

const topProducts = [
  { name: 'Corset Dress', sales: 52, revenue: 4160000 },
  { name: 'Bridal Gown', sales: 38, revenue: 2280000 },
  { name: 'Native Attire', sales: 41, revenue: 1640000 },
  { name: 'Senator Wear', sales: 29, revenue: 1450000 },
]

const recentOrders = [
  { id: '#ORD-1047', customer: 'Amara Johnson', product: 'Bridal Gown', amount: '₦60,000', status: 'pending', date: 'Jun 24' },
  { id: '#ORD-1046', customer: 'Chioma Obi', product: 'Corset Dress', amount: '₦80,000', status: 'in-progress', date: 'Jun 23' },
  { id: '#ORD-1045', customer: 'Fatima Bello', product: 'Native Attire', amount: '₦40,000', status: 'completed', date: 'Jun 23' },
  { id: '#ORD-1044', customer: 'Ngozi Peters', product: 'Senator Wear', amount: '₦50,000', status: 'completed', date: 'Jun 22' },
  { id: '#ORD-1043', customer: 'Aisha Mohammed', product: 'Corset Dress', amount: '₦80,000', status: 'completed', date: 'Jun 21' },
]

const recentChats = [
  { customer: 'Emeka Nwosu', avatar: 'EN', message: "I need a corset dress for my wife's birthday", time: '2m ago', unread: true, aiHandled: true },
  { customer: 'Sarah Adeyemi', avatar: 'SA', message: 'What sizes are available for the bridal gown?', time: '15m ago', unread: true, aiHandled: true },
  { customer: 'David Okonkwo', avatar: 'DO', message: 'Can I get a quote for a native attire?', time: '1h ago', unread: false, aiHandled: false },
  { customer: 'Grace Eze', avatar: 'GE', message: 'Is my order #ORD-1043 ready for pickup?', time: '2h ago', unread: false, aiHandled: true },
]

const recentQuotes = [
  { id: '#QT-0089', customer: 'Mrs Adaeze', item: 'Bridal Gown', amount: '₦120,000', status: 'awaiting' },
  { id: '#QT-0088', customer: 'Tolu Bakare', item: 'Corset Dress', amount: '₦80,000', status: 'accepted' },
  { id: '#QT-0087', customer: 'Kemi Lawson', item: 'Senator Wear x2', amount: '₦95,000', status: 'rejected' },
]

const statusConfig = {
  pending: { label: 'Pending', bg: CREAM, color: '#92400e' },
  'in-progress': { label: 'In Progress', bg: BLUE_LIGHT, color: PRIMARY },
  completed: { label: 'Completed', bg: BLUE_LIGHT, color: '#1e3fc2' },
  awaiting: { label: 'Awaiting', bg: CREAM, color: '#78350f' },
  accepted: { label: 'Accepted', bg: BLUE_LIGHT, color: PRIMARY },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#dc2626' },
}

function StatCard({ label, value, sub, positive, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Welcome back, Perfect Style Edits</h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your business today · June 24, 2026</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Customers" value="3,481" sub="+23 this week" positive icon={Users} />
        <StatCard label="Orders This Month" value="186" sub="+18% vs last month" positive icon={ShoppingBag} />
        <StatCard label="Monthly Revenue" value="₦14.8M" sub="+22% growth" positive icon={DollarSign} />
        <StatCard label="Website Visits" value="12,400" sub="this month" positive={false} icon={Globe} />
        <StatCard label="WhatsApp Messages" value="2,847" sub="AI handled 94%" positive icon={MessageCircle} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue + Orders */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue & Orders Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly performance overview</p>
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
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₦K)" stroke={PRIMARY} strokeWidth={2.5} fill="url(#revGrad2)" dot={false} activeDot={{ r: 5, fill: PRIMARY, strokeWidth: 0 }} />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#7b96f8" strokeWidth={2} fill="url(#ordGrad)" dot={false} activeDot={{ r: 4, fill: '#7b96f8', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer sources */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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

      {/* Orders + Chats row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
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
            {recentOrders.map(order => {
              const s = statusConfig[order.status]
              return (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: PRIMARY }}
                  >
                    {order.customer.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                    <div className="text-xs text-gray-400">{order.product} · {order.date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">{order.amount}</div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* WhatsApp Chats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">WhatsApp Conversations</h2>
              <p className="text-xs text-gray-400 mt-0.5">Recent AI-handled chats</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }}></div>
              AI Online
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentChats.map((chat, i) => (
              <div key={chat.customer} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: avatarColors[i % avatarColors.length] }}
                >
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{chat.customer}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{chat.message}</div>
                  {chat.aiHandled && (
                    <div className="flex items-center gap-1 mt-1">
                      <Bot size={10} style={{ color: PRIMARY }} />
                      <span className="text-xs" style={{ color: PRIMARY }}>AI responding</span>
                    </div>
                  )}
                </div>
                {chat.unread && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: PRIMARY }}></div>
                )}
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>AI auto-handled: <span className="font-semibold text-gray-700">94%</span></span>
              <button className="font-semibold hover:opacity-70 transition" style={{ color: PRIMARY }}>Open inbox →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Products + Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Top Products by Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">This month's performance</p>
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

        {/* Recent Quotations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Quotations</h2>
              <p className="text-xs text-gray-400 mt-0.5">AI-generated quotes</p>
            </div>
            <FileText size={15} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {recentQuotes.map(q => {
              const s = statusConfig[q.status]
              return (
                <div key={q.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{q.customer}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{q.item}</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{q.id}</span>
                    <span className="text-sm font-bold text-gray-900">{q.amount}</span>
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
