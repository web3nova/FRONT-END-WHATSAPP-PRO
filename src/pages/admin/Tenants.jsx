import { Building2, Search, Filter, MoreHorizontal, Plus } from 'lucide-react'

const PRIMARY = '#4166F5'

const tenants = [
  { name: 'Perfect Style Edits', owner: 'Adaeze Okafor', plan: 'Pro', status: 'active', joined: 'Jun 20, 2026', revenue: '₦124,000', aiMessages: '2,400' },
  { name: 'Lagos Fashion Hub', owner: 'Tunde Bakare', plan: 'Starter', status: 'active', joined: 'Jun 19, 2026', revenue: '₦48,000', aiMessages: '840' },
  { name: 'Abuja Tech Store', owner: 'Emeka Nwosu', plan: 'Enterprise', status: 'active', joined: 'Jun 18, 2026', revenue: '₦380,000', aiMessages: '12,100' },
  { name: 'Quick Mart NG', owner: 'Bola Adeyemi', plan: 'Starter', status: 'suspended', joined: 'Jun 17, 2026', revenue: '₦0', aiMessages: '0' },
  { name: 'Luxury Brands Co.', owner: 'Chidinma Eze', plan: 'Pro', status: 'active', joined: 'Jun 15, 2026', revenue: '₦196,000', aiMessages: '4,800' },
  { name: 'Naija Fabrics Ltd', owner: 'Kola Omotunde', plan: 'Pro', status: 'active', joined: 'Jun 14, 2026', revenue: '₦88,000', aiMessages: '1,920' },
  { name: 'AfriStyle Boutique', owner: 'Grace Eze', plan: 'Starter', status: 'active', joined: 'Jun 12, 2026', revenue: '₦36,000', aiMessages: '620' },
  { name: 'Elegance Tailors', owner: 'Fatima Bello', plan: 'Pro', status: 'active', joined: 'Jun 10, 2026', revenue: '₦142,000', aiMessages: '3,100' },
]

const planColors = {
  Pro: { bg: '#EEF2FF', color: PRIMARY },
  Starter: { bg: '#F0FDF4', color: '#16a34a' },
  Enterprise: { bg: '#FEF3C7', color: '#d97706' },
}

export default function AdminTenants() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-400 mt-0.5">1,247 businesses registered on the platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition" style={{ background: PRIMARY }}>
          <Plus size={15} />
          Invite Tenant
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-full focus:outline-none"
              placeholder="Search tenants..."
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
                {['Business', 'Owner', 'Plan', 'Status', 'Joined', 'Revenue (MTD)', 'AI Messages', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tenants.map(t => {
                const pc = planColors[t.plan] || planColors.Starter
                return (
                  <tr key={t.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: PRIMARY }}>
                          {t.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{t.owner}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: pc.bg, color: pc.color }}>{t.plan}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${t.status === 'active' ? 'text-emerald-600' : 'text-red-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        {t.status === 'active' ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{t.joined}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{t.revenue}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{t.aiMessages}</td>
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
          <span className="text-xs text-gray-400">Showing 8 of 1,247 tenants</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 156].map((p, i) => (
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
