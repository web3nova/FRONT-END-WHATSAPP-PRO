import { useState } from 'react'
import { Search, Filter, Plus, MoreHorizontal, Phone, MessageCircle, ShoppingBag, TrendingUp } from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const customers = [
  { id: 1, name: 'Amara Johnson', phone: '+234 801 234 5678', channel: 'WhatsApp', orders: 4, spent: 280000, lastOrder: 'Jun 24', tag: 'VIP', joined: 'Jan 2026' },
  { id: 2, name: 'Chioma Obi', phone: '+234 802 345 6789', channel: 'WhatsApp', orders: 3, spent: 210000, lastOrder: 'Jun 23', tag: 'Regular', joined: 'Feb 2026' },
  { id: 3, name: 'Fatima Bello', phone: '+234 803 456 7890', channel: 'Website', orders: 2, spent: 95000, lastOrder: 'Jun 23', tag: 'Regular', joined: 'Mar 2026' },
  { id: 4, name: 'Ngozi Peters', phone: '+234 804 567 8901', channel: 'WhatsApp', orders: 6, spent: 420000, lastOrder: 'Jun 22', tag: 'VIP', joined: 'Dec 2025' },
  { id: 5, name: 'Aisha Mohammed', phone: '+234 805 678 9012', channel: 'WhatsApp', orders: 1, spent: 80000, lastOrder: 'Jun 21', tag: 'New', joined: 'Jun 2026' },
  { id: 6, name: 'Blessing Osei', phone: '+234 806 789 0123', channel: 'Website', orders: 2, spent: 115000, lastOrder: 'Jun 21', tag: 'Regular', joined: 'Apr 2026' },
  { id: 7, name: 'Emeka Nwosu', phone: '+234 807 890 1234', channel: 'WhatsApp', orders: 1, spent: 80000, lastOrder: 'Jun 24', tag: 'New', joined: 'Jun 2026' },
  { id: 8, name: 'Grace Eze', phone: '+234 808 901 2345', channel: 'WhatsApp', orders: 3, spent: 190000, lastOrder: 'Jun 20', tag: 'Regular', joined: 'Mar 2026' },
  { id: 9, name: 'Kemi Lawson', phone: '+234 809 012 3456', channel: 'WhatsApp', orders: 5, spent: 375000, lastOrder: 'Jun 18', tag: 'VIP', joined: 'Nov 2025' },
  { id: 10, name: 'David Okonkwo', phone: '+234 810 123 4567', channel: 'Website', orders: 1, spent: 40000, lastOrder: 'Jun 15', tag: 'New', joined: 'Jun 2026' },
]

const tagStyle = {
  VIP: { bg: PRIMARY, color: '#fff' },
  Regular: { bg: '#dce5fd', color: PRIMARY },
  New: { bg: CREAM, color: '#92400e' },
}

const avatarColors = [PRIMARY, '#1e3fc2', '#7b96f8', '#2952d9', '#3457e8', '#4166F5', '#1a35c8', '#5577f6', '#3050e0', '#4060ef']

export default function Customers() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const sel = customers.find(c => c.id === selected)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">3,481 customers tracked</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition" style={{ background: PRIMARY }}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: '3,481' },
          { label: 'New This Month', value: '142' },
          { label: 'VIP Customers', value: '284' },
          { label: 'Avg. Spend', value: '₦87,400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Customer Table */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-full focus:outline-none"
                placeholder="Search customers..."
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">
              <Filter size={14} /> Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: CREAM }}>
                  {['Customer', 'Channel', 'Orders', 'Total Spent', 'Last Order', 'Tag', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c, i) => {
                  const t = tagStyle[c.tag]
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      style={selected === c.id ? { background: '#dce5fd' } : {}}
                      onClick={() => setSelected(selected === c.id ? null : c.id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: avatarColors[i % avatarColors.length] }}>
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          {c.channel === 'WhatsApp' ? <MessageCircle size={12} style={{ color: PRIMARY }} /> : <ShoppingBag size={12} style={{ color: PRIMARY }} />}
                          {c.channel}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{c.orders}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₦{c.spent.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{c.lastOrder}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: t.bg, color: t.color }}>{c.tag}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="p-1 text-gray-300 hover:text-gray-500 rounded-lg">
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing {filtered.length} of 3,481 customers</span>
          </div>
        </div>

        {/* Customer Detail Panel */}
        {sel && (
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: PRIMARY }}>
                {sel.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{sel.name}</div>
                <div className="text-xs text-gray-400">{sel.phone}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Orders', value: sel.orders },
                { label: 'Total Spent', value: `₦${sel.spent.toLocaleString()}` },
                { label: 'Channel', value: sel.channel },
                { label: 'Joined', value: sel.joined },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 border border-gray-100">
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order History</div>
              {[...Array(Math.min(sel.orders, 3))].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-600">Order #{1040 + i}</span>
                  <span className="text-xs font-semibold text-gray-900">₦{(80000 - i * 10000).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button className="w-full py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
                Send WhatsApp Message
              </button>
              <button className="w-full py-2 text-sm font-semibold rounded-xl hover:opacity-90 transition" style={{ background: '#dce5fd', color: PRIMARY }}>
                Create Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
