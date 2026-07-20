import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Package, Tag, Star, X } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, clearStoredAuth } from '../../lib/auth'
import { resolveImageUrl } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const statusStyle = {
  active: { bg: '#dce5fd', color: PRIMARY, label: 'Active' },
  'out-of-stock': { bg: CREAM, color: '#92400e', label: 'Out of Stock' },
  draft: { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
}

const placeholderColors = [PRIMARY, '#1e3fc2', '#7b96f8', '#2952d9', '#3457e8', '#4166F5', '#1a35c8', '#5577f6']
const PRODUCTS_API_URL = `${API_BASE}/products`

export default function Products() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [view, setView] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [showPaymentAlert, setShowPaymentAlert] = useState(false)
  const [paymentChecked, setPaymentChecked] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        setLoading(true)
        setError('')

        const token = getStoredAccessToken() || user?.accessToken || user?.token || user?.access_token || user?.tokens?.accessToken || user?.tokens?.token || user?.tokens?.access_token || user?.jwt
        if (!token) {
          clearStoredAuth()
          throw new Error('You need to sign in before loading products.')
        }

        const headers = { accept: 'application/json', Authorization: `Bearer ${token}` }

        const [productsRes, categoriesRes, paymentRes] = await Promise.all([
          fetch(PRODUCTS_API_URL, { headers }),
          fetch(`${API_BASE}/products/categories`, { headers }),
          fetch(`${API_BASE}/payment-config`, { headers }).catch(() => null),
        ])

        if (!productsRes.ok) {
          if (productsRes.status === 401 || productsRes.status === 403) {
            clearStoredAuth()
            throw new Error('Your session is expired. Please sign in again.')
          }
          throw new Error(`Request failed (${productsRes.status})`)
        }

        const productsData = await productsRes.json().catch(() => null)
        const payload = Array.isArray(productsData) ? productsData : productsData?.data || productsData?.products || []

        const catsData = await categoriesRes.json().catch(() => null)
        const cats = Array.isArray(catsData) ? catsData : catsData?.data || []

        let hasPayment = false
        if (paymentRes?.ok) {
          const paymentBody = await paymentRes.json().catch(() => null)
          const paymentData = paymentBody?.data?.data || paymentBody?.data || paymentBody
          if (paymentData) {
            const m = paymentData.manual
            const p = paymentData.paystack
            const mn = paymentData.monnify
            const others = paymentData.otherProviders || []
            hasPayment = (m?.isActive && m?.bankAccount?.accountNumber) ||
                         (p?.isActive && p?.publicKey) ||
                         (mn?.isActive && mn?.apiKey) ||
                         others.some(o => o?.isActive && o?.name)
          }
        }

        if (!ignore) {
          setProducts(payload)
          setCategories(['All', ...cats])
          if (!paymentChecked) {
            setShowPaymentAlert(!hasPayment)
            setPaymentChecked(true)
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Could not load products.')
          setProducts([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { ignore = true }
  }, [])

  const handleDelete = async (id) => {
    const token = getStoredAccessToken()
    if (!token) return

    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => (p.id || p._id) !== id))
      }
    } catch {
      // silent
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = async () => {
    const token = getStoredAccessToken()
    if (!token) return
    setBulkDeleting(true)
    try {
      const ids = [...selectedIds]
      const results = await Promise.all(ids.map(id =>
        fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
          .then(res => ({ id, ok: res.ok }))
          .catch(() => ({ id, ok: false }))
      ))
      const deletedIds = new Set(results.filter(r => r.ok).map(r => r.id))
      setProducts(prev => prev.filter(p => !deletedIds.has(p.id || p._id)))
      setSelectedIds(prev => {
        const next = new Set(prev)
        deletedIds.forEach(id => next.delete(id))
        return next
      })
    } finally {
      setBulkDeleting(false)
      setConfirmBulkDelete(false)
    }
  }

  const normalizeProduct = (product) => {
    const name = product?.name || product?.title || product?.productName || 'Untitled product'
    const category = product?.category || product?.type || product?.productCategory || 'regular'
    const priceMinor = Number(product?.priceMinor ?? 0)
    const price = priceMinor > 0 ? priceMinor / 100 : Number(product?.price || product?.amount || product?.unitPrice || 0)
    const compareAt = product?.compareAtPrice != null ? Number(product.compareAtPrice) / 100 : null
    const stock = Number(product?.stock || product?.inventory || product?.quantity || 0)
    // "Out of stock" only means anything when the merchant is actually
    // tracking stock for this product — otherwise a brand-new product left
    // at the form's default stock of 0 shows as out of stock immediately,
    // even though nothing about availability was ever tracked or enforced.
    const status = product?.isActive === false
      ? 'draft'
      : (!product?.trackStock || stock > 0) ? 'active' : 'out-of-stock'
    const orders = Number(product?.orders || product?.sales || product?.orderCount || 0)
    const sku = product?.sku || ''
    const brand = product?.brand || ''
    const tags = product?.tags || []
    const isFeatured = !!product?.isFeatured
    const imageUrl = product?.imageUrl || ''
    const id = product?.id || product?._id || sku

    return { ...product, id, name, category, price, compareAt, stock, status, orders, sku, brand, tags, isFeatured, imageUrl }
  }

  const normalizedProducts = products.map(normalizeProduct)

  const filtered = normalizedProducts.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    return (cat === 'All' || p.category === cat) && nameMatch
  })

  const stats = [
    { label: 'Total Products', value: normalizedProducts.length },
    { label: 'Active', value: normalizedProducts.filter(p => p.status === 'active').length },
    { label: 'Featured', value: normalizedProducts.filter(p => p.isFeatured).length },
    { label: 'Out of Stock', value: normalizedProducts.filter(p => p.status === 'out-of-stock').length },
  ]

  const deleteTarget = deleteId ? normalizedProducts.find(p => p.id === deleteId) : null

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Payment alert */}
      {showPaymentAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowPaymentAlert(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Payment Setup Required</h3>
                <p className="text-sm text-gray-500 mt-1">Configure how your customers pay you before listing products.</p>
              </div>
              <button onClick={() => setShowPaymentAlert(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 text-sm text-amber-800">
              <span className="text-lg">⚠️</span>
              <span>No payment method set. Customers won't be able to complete purchases.</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowPaymentAlert(false); navigate('/dashboard/payments') }} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition" style={{ background: PRIMARY }}>
                Set Up Payment
              </button>
              <button onClick={() => setShowPaymentAlert(false)} className="px-4 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} products in your catalog</p>
        </div>
        <button
          data-tour="products-add"
          onClick={() => navigate('/dashboard/products/new')}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-white rounded-xl shadow-sm active:opacity-80 hover:opacity-90 transition w-full sm:w-auto"
          style={{ background: PRIMARY }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Bulk action bar — appears once anything is selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-blue-100 px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-700">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5">
              Clear
            </button>
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <Trash2 size={13} /> Delete selected
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading products...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Stats — horizontally scrollable on mobile so numbers stay readable, no squeezing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div data-tour="products-list" className="flex flex-col gap-3">
        {/* Search full-width on mobile, always visible and easy to tap */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 sm:py-2 text-sm bg-white border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            placeholder="Search by name, SKU, brand..."
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 flex-nowrap scrollbar-none -mx-0.5 px-0.5">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="flex-shrink-0 px-3.5 py-2 text-sm font-medium rounded-xl transition whitespace-nowrap"
                style={cat === c ? { background: PRIMARY, color: '#fff' } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            {['grid', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === 'grid' ? 'Grid view' : 'List view'}
                className="px-3 py-2.5 sm:py-2 text-sm transition cursor-pointer"
                style={view === v ? { background: PRIMARY, color: '#fff' } : { color: '#9ca3af' }}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 px-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: CREAM }}>
            <Package size={22} className="text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-700 mt-1">
            {products.length === 0 ? 'No products yet' : 'No products match your search'}
          </div>
          <p className="text-xs text-gray-400 max-w-xs">
            {products.length === 0
              ? 'Add your first product to start building your catalog.'
              : 'Try a different search term or category.'}
          </p>
          {products.length === 0 && (
            <button onClick={() => navigate('/dashboard/products/new')} className="mt-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: PRIMARY }}>
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {filtered.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {filtered.map((p, i) => {
            const s = statusStyle[p.status] || statusStyle.active
            return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:shadow-md hover:shadow-md transition group">
                {/* Image */}
                <div className="h-40 sm:h-44 flex items-center justify-center relative overflow-hidden" style={{ background: CREAM }}>
                  {p.imageUrl ? (
                    <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: placeholderColors[i % placeholderColors.length] }}>
                      <Package size={28} className="text-white" />
                    </div>
                  )}
                  <label className="absolute top-2.5 left-2.5 z-10" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4.5 h-4.5 rounded cursor-pointer shadow"
                    />
                  </label>
                  {/* Always visible on touch devices, subtle fade-in on hover for pointer devices */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                      aria-label="Edit product"
                      className="p-2 bg-white/95 backdrop-blur rounded-lg shadow-sm text-gray-600 hover:text-blue-600 active:scale-95 transition"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      aria-label="Delete product"
                      className="p-2 bg-white/95 backdrop-blur rounded-lg shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 flex gap-1">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    {p.isFeatured && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg flex items-center" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <Star size={11} className="inline mr-0.5" />Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{p.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag size={11} className="text-gray-300 flex-shrink-0" />
                      <span className="text-xs text-gray-400 truncate">
                        {p.category}
                        {p.brand ? ` · ${p.brand}` : ''}
                        {p.sku ? ` · ${p.sku}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <span className="font-bold text-gray-900">₦{p.price.toLocaleString()}</span>
                      {p.compareAt && p.compareAt > p.price && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">₦{p.compareAt.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 text-right">{p.stock > 0 ? `${p.stock} in stock` : 'No stock'}</div>
                  </div>
                  {p.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {p.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: CREAM, color: '#6b7280' }}>{t}</span>
                      ))}
                      {p.tags.length > 3 && <span className="text-[10px] text-gray-400">+{p.tags.length - 3}</span>}
                    </div>
                  )}
                  <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{p.orders} orders</span>
                    <button onClick={() => navigate(`/dashboard/products/${p.id}/edit`)} className="text-xs font-semibold hover:opacity-70 transition py-1" style={{ color: PRIMARY }}>Edit</button>
                  </div>
                </div>
              </div>
            )
          })}
          <button onClick={() => navigate('/dashboard/products/new')} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 h-44 xs:h-72 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-blue-300 hover:text-blue-400 active:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-sm font-medium">Add Product</span>
          </button>
        </div>
      )}

      {/* List View */}
      {filtered.length > 0 && view === 'list' && (
        <>
          {/* Mobile: stacked cards, no horizontal scrolling or tiny text */}
          <div className="sm:hidden space-y-2.5">
            {filtered.map((p, i) => {
              const s = statusStyle[p.status] || statusStyle.active
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="w-4.5 h-4.5 rounded cursor-pointer mt-1.5 flex-shrink-0"
                    />
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: placeholderColors[i % placeholderColors.length] }}>
                      {p.imageUrl ? (
                        <img src={resolveImageUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                            {p.name}
                            {p.isFeatured && <Star size={12} className="flex-shrink-0" style={{ color: '#d97706' }} />}
                          </div>
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {p.category}{p.brand ? ` · ${p.brand}` : ''}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-2">
                        <div>
                          <span className="text-sm font-bold text-gray-900">₦{p.price.toLocaleString()}</span>
                          {p.compareAt && p.compareAt > p.price && (
                            <span className="text-xs text-gray-400 line-through ml-1.5">₦{p.compareAt.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{p.stock} in stock · {p.orders} orders</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 active:bg-gray-50"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-red-100 text-red-500 active:bg-red-50"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop / tablet: table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: CREAM }}>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(p => selectedIds.has(p.id))}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(new Set(filtered.map(p => p.id)))
                        else setSelectedIds(new Set())
                      }}
                      className="w-4.5 h-4.5 rounded cursor-pointer"
                    />
                  </th>
                  {['Product', 'Category', 'Brand', 'Price', 'Stock', 'Orders', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p, i) => {
                  const s = statusStyle[p.status] || statusStyle.active
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="w-4.5 h-4.5 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: placeholderColors[i % placeholderColors.length] }}>
                            {p.imageUrl ? (
                              <img src={resolveImageUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={15} className="text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                              {p.name}
                              {p.isFeatured && <Star size={12} style={{ color: '#d97706' }} />}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{p.sku || p.id?.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{p.category}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{p.brand || '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ₦{p.price.toLocaleString()}
                        {p.compareAt && p.compareAt > p.price && (
                          <span className="text-xs text-gray-400 line-through ml-1">₦{p.compareAt.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{p.stock}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{p.orders}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/dashboard/products/${p.id}/edit`)} className="p-1.5 text-gray-300 hover:text-blue-600 rounded-lg">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete confirmation — modal overlay so it works no matter where in a long list you tapped */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={() => !deleting && setDeleteId(null)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <Trash2 size={18} className="text-red-500" />
              </div>
              <button onClick={() => !deleting && setDeleteId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="text-sm font-semibold text-gray-900">Delete product?</div>
            <p className="text-sm text-gray-500 mt-1">
              {deleteTarget ? `"${deleteTarget.name}" will be permanently removed from your catalog.` : 'This product will be permanently removed from your catalog.'}
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteId(null)} disabled={deleting} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 active:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl active:bg-red-600 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={() => !bulkDeleting && setConfirmBulkDelete(false)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
                <Trash2 size={18} className="text-red-500" />
              </div>
              <button onClick={() => !bulkDeleting && setConfirmBulkDelete(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="text-sm font-semibold text-gray-900">Delete {selectedIds.size} products?</div>
            <p className="text-sm text-gray-500 mt-1">
              These products will be permanently removed from your catalog. This can't be undone.
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setConfirmBulkDelete(false)} disabled={bulkDeleting} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 active:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl active:bg-red-600 disabled:opacity-50">
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}