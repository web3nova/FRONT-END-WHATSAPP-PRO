import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react'

const PRIMARY = '#4166F5'

const orders = [
  { id: '#ORD-1047', customer: 'Amara Johnson', phone: '+234 801 234 5678', product: 'Bridal Gown', size: 'M', amount: '₦60,000', status: 'pending', date: 'Jun 24, 2026' },
  { id: '#ORD-1046', customer: 'Chioma Obi', phone: '+234 802 345 6789', product: 'Corset Dress', size: 'L', amount: '₦80,000', status: 'in-progress', date: 'Jun 23, 2026' },
  { id: '#ORD-1045', customer: 'Fatima Bello', phone: '+234 803 456 7890', product: 'Native Attire', size: 'XL', amount: '₦40,000', status: 'completed', date: 'Jun 23, 2026' },
  { id: '#ORD-1044', customer: 'Ngozi Peters', phone: '+234 804 567 8901', product: 'Senator Wear', size: 'M', amount: '₦50,000', status: 'completed', date: 'Jun 22, 2026' },
  { id: '#ORD-1043', customer: 'Aisha Mohammed', phone: '+234 805 678 9012', product: 'Corset Dress', size: 'S', amount: '₦80,000', status: 'completed', date: 'Jun 21, 2026' },
  { id: '#ORD-1042', customer: 'Blessing Osei', phone: '+234 806 789 0123', product: 'Bridal Gown', size: 'XL', amount: '₦60,000', status: 'pending', date: 'Jun 21, 2026' },
  { id: '#ORD-1041', customer: 'Kemi Lawson', phone: '+234 807 890 1234', product: 'Native Attire', size: 'M', amount: '₦40,000', status: 'in-progress', date: 'Jun 20, 2026' },
]

const statusConfig = {
  pending: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
  'in-progress': { label: 'In Progress', bg: '#EEF2FF', color: PRIMARY },
  completed: { label: 'Completed', bg: '#D1FAE5', color: '#059669' },
}

export default function BusinessOrders() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">186 orders this month</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition" style={{ background: PRIMARY }}>
          <Plus size={15} />
          New Order
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2">
        {['All Orders', 'Pending', 'In Progress', 'Completed'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${i === 0 ? 'text-white' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            style={i === 0 ? { background: PRIMARY } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-full focus:outline-none"
              placeholder="Search orders..."
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <Filter size={14} />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Order ID', 'Customer', 'Product', 'Size', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => {
                const s = statusConfig[order.status]
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-400">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: PRIMARY }}>
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                          <div className="text-xs text-gray-400">{order.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{order.product}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg">{order.size}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{order.date}</td>
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
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Showing 7 of 186 orders</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 27].map((p, i) => (
              <button
                key={i}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition ${p === 1 ? 'text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                style={p === 1 ? { background: PRIMARY } : {}}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
