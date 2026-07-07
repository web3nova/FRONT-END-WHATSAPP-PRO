import { useState, useEffect } from 'react'
import { Search, Filter, Plus, MoreHorizontal, X } from 'lucide-react'
import { listOrders, updateOrderStatus, createOrder } from '../../api/ordersApi'
import { listCustomers } from '../../api/customersApi'

const PRIMARY = '#4166F5'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#FEF3C7', color: '#D97706' },
  confirmed: { label: 'Confirmed', bg: '#EEF2FF', color: PRIMARY },
  paid:      { label: 'Paid',      bg: '#dce5fd', color: PRIMARY },
  fulfilled: { label: 'Fulfilled', bg: '#D1FAE5', color: '#059669' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#DC2626' },
}

const TABS = ['all', 'pending', 'confirmed', 'paid', 'fulfilled', 'cancelled']
const TAB_LABEL = {
  all: 'All Orders', pending: 'Pending', confirmed: 'Confirmed',
  paid: 'Paid', fulfilled: 'Fulfilled', cancelled: 'Cancelled',
}

function formatAmount(totalMinor = 0, currency = 'NGN') {
  return `₦${(totalMinor / 100).toLocaleString()}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function shortId(uuid) {
  return `#${uuid.slice(0, 8).toUpperCase()}`
}

function extractProduct(items) {
  if (!Array.isArray(items) || !items.length) return '—'
  const first = items[0]
  return first?.name || first?.productName || first?.product || '—'
}

function extractSize(items, measurements) {
  const fromItems = Array.isArray(items) && items[0]
    ? (items[0].size || items[0].Size || null)
    : null
  return fromItems || measurements?.size || measurements?.Size || null
}

export default function BusinessOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalCustomers, setModalCustomers] = useState([])
  const [modalCustLoading, setModalCustLoading] = useState(false)
  const [form, setForm] = useState({ customerId: '', product: '', size: '', amountNaira: '', status: 'pending' })
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    listOrders()
      .then(({ data }) => { if (!ignore) setOrders(data) })
      .catch(err => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  const filtered = orders.filter(order => {
    if (activeTab !== 'all' && order.status !== activeTab) return false
    if (!search) return true
    const name = (order.customer?.name || '').toLowerCase()
    const phone = order.customer?.phone || ''
    const q = search.toLowerCase()
    return name.includes(q) || phone.includes(q) || order.id.toLowerCase().includes(q)
  })

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const openModal = () => {
    setForm({ customerId: '', product: '', size: '', amountNaira: '', status: 'pending' })
    setModalError('')
    setShowModal(true)
    setModalCustLoading(true)
    listCustomers({ limit: 100 })
      .then(({ data }) => setModalCustomers(data))
      .catch(() => setModalCustomers([]))
      .finally(() => setModalCustLoading(false))
  }

  const handleCreateOrder = async e => {
    e.preventDefault()
    if (!form.amountNaira || isNaN(Number(form.amountNaira))) {
      setModalError('Enter a valid amount.')
      return
    }
    setSubmitting(true)
    setModalError('')
    try {
      const payload = {
        status: form.status,
        totalMinor: Math.round(Number(form.amountNaira) * 100),
        items: form.product ? [{ name: form.product, ...(form.size ? { size: form.size } : {}) }] : [],
        ...(form.customerId ? { customerId: form.customerId } : {}),
        ...(form.size ? { measurements: { size: form.size } } : {}),
      }
      const created = await createOrder(payload)
      // backend create may not include the customer relation — patch it from local list
      if (!created.customer && form.customerId) {
        const cust = modalCustomers.find(c => c.id === form.customerId)
        if (cust) created.customer = cust
      }
      setOrders(prev => [created, ...prev])
      setShowModal(false)
    } catch (err) {
      setModalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition w-full sm:w-auto"
          style={{ background: PRIMARY }}
        >
          <Plus size={15} />
          New Order
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-nowrap w-full">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === tab
                ? 'text-white'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
            style={activeTab === tab ? { background: PRIMARY } : {}}
          >
            {TAB_LABEL[tab]}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-full focus:outline-none"
              placeholder="Search orders…"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition w-full sm:w-auto">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Order ID', 'Customer', 'Product', 'Size', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    Loading orders…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    {search ? 'No orders match your search.' : 'No orders yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const s = STATUS_CONFIG[order.status] || { label: order.status, bg: '#f3f4f6', color: '#6b7280' }
                  const customerName = order.customer?.name || 'Unknown'
                  const customerPhone = order.customer?.phone || '—'
                  const product = extractProduct(order.items)
                  const size = extractSize(order.items, order.measurements)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-mono text-gray-400">
                        {shortId(order.id)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: PRIMARY }}
                          >
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customerName}</div>
                            <div className="text-xs text-gray-400">{customerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{product}</td>
                      <td className="px-5 py-3.5">
                        {size ? (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg">
                            {size}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                        {formatAmount(order.totalMinor, order.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative group">
                          <button
                            className="p-1 text-gray-300 hover:text-gray-500 rounded-lg transition"
                            disabled={updatingId === order.id}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {/* Inline status update dropdown */}
                          <div className="absolute right-0 top-7 z-10 hidden group-focus-within:block bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36">
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                              order.status !== val && (
                                <button
                                  key={val}
                                  onClick={() => handleStatusChange(order.id, val)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition"
                                  style={{ color: cfg.color }}
                                >
                                  Mark {cfg.label}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Order</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="px-6 py-5 space-y-4">
              {/* Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Customer <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                {modalCustLoading ? (
                  <div className="text-xs text-gray-400 py-2">Loading customers…</div>
                ) : (
                  <select
                    value={form.customerId}
                    onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  >
                    <option value="">Select customer</option>
                    {modalCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name ? `${c.name} · ${c.phone}` : c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Product */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Product / Item
                </label>
                <input
                  type="text"
                  value={form.product}
                  onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                  placeholder="e.g. Corset Dress"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Size <span className="text-gray-300 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  placeholder="e.g. M, L, 42"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Amount (₦) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.amountNaira}
                    onChange={e => setForm(f => ({ ...f, amountNaira: e.target.value }))}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {modalError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                  {modalError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60"
                  style={{ background: PRIMARY }}
                >
                  {submitting ? 'Creating…' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
