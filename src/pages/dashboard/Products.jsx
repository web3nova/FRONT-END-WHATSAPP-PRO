import { useState } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, MoreHorizontal, Package, Tag } from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const products = [
  { id: 1, name: 'Corset Dress', category: 'Dresses', price: 80000, stock: 12, status: 'active', orders: 52, sku: 'CD-001' },
  { id: 2, name: 'Bridal Gown', category: 'Bridal', price: 60000, stock: 5, status: 'active', orders: 38, sku: 'BG-002' },
  { id: 3, name: 'Native Attire', category: 'Native', price: 40000, stock: 20, status: 'active', orders: 41, sku: 'NA-003' },
  { id: 4, name: 'Senator Wear', category: 'Native', price: 50000, stock: 8, status: 'active', orders: 29, sku: 'SW-004' },
  { id: 5, name: 'Ankara Blouse', category: 'Tops', price: 25000, stock: 0, status: 'out-of-stock', orders: 17, sku: 'AB-005' },
  { id: 6, name: 'Lace Gown', category: 'Dresses', price: 75000, stock: 3, status: 'active', orders: 24, sku: 'LG-006' },
  { id: 7, name: 'Agbada Set', category: 'Native', price: 120000, stock: 4, status: 'active', orders: 11, sku: 'AG-007' },
  { id: 8, name: 'Aso-Ebi Dress', category: 'Dresses', price: 55000, stock: 0, status: 'draft', orders: 0, sku: 'AE-008' },
]

const categories = ['All', 'Dresses', 'Bridal', 'Native', 'Tops']

const statusStyle = {
  active: { bg: '#dce5fd', color: PRIMARY, label: 'Active' },
  'out-of-stock': { bg: CREAM, color: '#92400e', label: 'Out of Stock' },
  draft: { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
}

const placeholderColors = [PRIMARY, '#1e3fc2', '#7b96f8', '#2952d9', '#3457e8', '#4166F5', '#1a35c8', '#5577f6']

export default function Products() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [view, setView] = useState('grid')

  const filtered = products.filter(p =>
    (cat === 'All' || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products in your catalog</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition w-full sm:w-auto" style={{ background: PRIMARY }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length },
          { label: 'Active', value: products.filter(p => p.status === 'active').length },
          { label: 'Out of Stock', value: products.filter(p => p.status === 'out-of-stock').length },
          { label: 'Draft', value: products.filter(p => p.status === 'draft').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 flex-nowrap w-full sm:w-auto scrollbar-none">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="flex-shrink-0 px-3.5 py-1.5 text-sm font-medium rounded-xl transition"
              style={cat === c ? { background: PRIMARY, color: '#fff' } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl w-full sm:w-52 focus:outline-none"
              placeholder="Search products..."
            />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            {['grid', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-2 text-sm transition cursor-pointer"
                style={view === v ? { background: PRIMARY, color: '#fff' } : { color: '#9ca3af' }}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const s = statusStyle[p.status]
            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition group">
                {/* Image placeholder */}
                <div className="h-44 flex items-center justify-center relative" style={{ background: CREAM }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: placeholderColors[i % placeholderColors.length] }}>
                    <Package size={28} className="text-white" />
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500 hover:text-blue-600">
                      <Edit2 size={13} />
                    </button>
                    <button className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Tag size={11} className="text-gray-300" />
                        <span className="text-xs text-gray-400">{p.category} · {p.sku}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-bold text-gray-900">₦{p.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{p.stock > 0 ? `${p.stock} in stock` : 'No stock'}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{p.orders} orders</span>
                    <button className="text-xs font-semibold hover:opacity-70 transition" style={{ color: PRIMARY }}>Edit</button>
                  </div>
                </div>
              </div>
            )
          })}
          {/* Add new card */}
          <button className="bg-white rounded-2xl border-2 border-dashed border-gray-200 h-72 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-blue-300 hover:text-blue-400 transition">
            <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-sm font-medium">Add Product</span>
          </button>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: CREAM }}>
                {['Product', 'Category', 'Price', 'Stock', 'Orders', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => {
                const s = statusStyle[p.status]
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: placeholderColors[i % placeholderColors.length] }}>
                          <Package size={15} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.category}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">₦{p.price.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.stock}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{p.orders}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span>
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
      )}
    </div>
  )
}
