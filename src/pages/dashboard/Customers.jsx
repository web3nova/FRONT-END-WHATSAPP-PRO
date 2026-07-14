import { useState, useEffect } from 'react'
import { Search, Filter, Plus, MoreHorizontal, MessageCircle, ShoppingBag, X, Send } from 'lucide-react'
import { listCustomers, sendCustomerMessage } from '../../api/customersApi'
import { listOrders, createOrder } from '../../api/ordersApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const avatarColors = [PRIMARY, '#1e3fc2', '#7b96f8', '#2952d9', '#3457e8', '#4166F5', '#1a35c8', '#5577f6', '#3050e0', '#4060ef']

function initials(name, phone) {
  if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (phone || '??').slice(-2).toUpperCase()
}

function formatJoined(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function formatAmount(minor = 0) {
  return `₦${(minor / 100).toLocaleString()}`
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // WhatsApp message modal
  const [showMsgModal, setShowMsgModal] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgError, setMsgError] = useState('')

  // Create Order modal
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ product: '', size: '', amountNaira: '', status: 'pending' })
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    listCustomers({ limit: 50 })
      .then(({ data, meta }) => {
        if (!ignore) {
          setCustomers(data)
          setMeta(meta)
        }
      })
      .catch(err => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  // Lazy-load orders when a customer row is selected
  useEffect(() => {
    if (!selected) { setCustomerOrders([]); return }
    let ignore = false
    setOrdersLoading(true)
    listOrders({ customerId: selected })
      .then(({ data }) => { if (!ignore) setCustomerOrders(data) })
      .catch(() => { if (!ignore) setCustomerOrders([]) })
      .finally(() => { if (!ignore) setOrdersLoading(false) })
    return () => { ignore = true }
  }, [selected])

  const filtered = customers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (c.name || '').toLowerCase().includes(q) || c.phone.includes(q)
  })

  const sel = customers.find(c => c.id === selected)
  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalMinor || 0), 0)

  const handleSendWhatsApp = async e => {
    e.preventDefault()
    if (!msgText.trim() || !sel?.phone) return
    setMsgSending(true)
    setMsgError('')
    try {
      await sendCustomerMessage(sel.id, msgText.trim())
      setShowMsgModal(false)
      setMsgText('')
    } catch (err) {
      setMsgError(err.message)
    } finally {
      setMsgSending(false)
    }
  }

  const handleCreateOrder = async e => {
    e.preventDefault()
    if (!orderForm.amountNaira || isNaN(Number(orderForm.amountNaira))) {
      setOrderError('Enter a valid amount.')
      return
    }
    setOrderSubmitting(true)
    setOrderError('')
    try {
      const payload = {
        customerId: sel.id,
        status: orderForm.status,
        totalMinor: Math.round(Number(orderForm.amountNaira) * 100),
        items: orderForm.product
          ? [{ name: orderForm.product, ...(orderForm.size ? { size: orderForm.size } : {}) }]
          : [],
        ...(orderForm.size ? { measurements: { size: orderForm.size } } : {}),
      }
      const created = await createOrder(payload)
      created.customer = sel
      setCustomerOrders(prev => [created, ...prev])
      setShowOrderModal(false)
      setOrderForm({ product: '', size: '', amountNaira: '', status: 'pending' })
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setOrderSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div data-tour="customers-root" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${meta.total} customer${meta.total !== 1 ? 's' : ''} tracked`}
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition w-full sm:w-auto"
          style={{ background: PRIMARY }}
        >
          <Plus size={15} /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: loading ? '…' : meta.total.toLocaleString() },
          { label: 'Loaded',          value: loading ? '…' : customers.length },
          { label: 'Selected Orders', value: sel ? (ordersLoading ? '…' : customerOrders.length) : '—' },
          { label: 'Selected Spent',  value: sel ? (ordersLoading ? '…' : formatAmount(totalSpent)) : '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Table */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl w-full focus:outline-none"
                placeholder="Search customers…"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition w-full sm:w-auto">
              <Filter size={14} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: CREAM }}>
                  {['Customer', 'Phone', 'Channel', 'Joined', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                      Loading customers…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                      {search ? 'No customers match your search.' : 'No customers yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      style={selected === c.id ? { background: '#dce5fd' } : {}}
                      onClick={() => setSelected(selected === c.id ? null : c.id)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: avatarColors[i % avatarColors.length] }}
                          >
                            {initials(c.name, c.phone)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">{c.name || '—'}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{c.phone}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MessageCircle size={12} style={{ color: PRIMARY }} />
                          WhatsApp
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{formatJoined(c.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <button className="p-1 text-gray-300 hover:text-gray-500 rounded-lg">
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {filtered.length} of {meta.total} customers
            </span>
          </div>
        </div>

        {/* Detail Panel */}
        {sel && (
          <div className="w-full lg:w-72 lg:flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: PRIMARY }}
              >
                {initials(sel.name, sel.phone)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{sel.name || 'Unknown'}</div>
                <div className="text-xs text-gray-400">{sel.phone}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Orders',      value: ordersLoading ? '…' : customerOrders.length },
                { label: 'Total Spent', value: ordersLoading ? '…' : formatAmount(totalSpent) },
                { label: 'Channel',     value: 'WhatsApp' },
                { label: 'Joined',      value: formatJoined(sel.createdAt) },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-3 border border-gray-100">
                  <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Order History
              </div>
              {ordersLoading ? (
                <div className="text-xs text-gray-400 py-2">Loading…</div>
              ) : customerOrders.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">No orders yet.</div>
              ) : (
                customerOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-600">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="text-xs font-semibold text-gray-900">{formatAmount(o.totalMinor)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { setMsgText(''); setMsgError(''); setShowMsgModal(true) }}
                className="w-full py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition"
                style={{ background: PRIMARY }}
              >
                Send WhatsApp Message
              </button>
              <button
                onClick={() => { setOrderForm({ product: '', size: '', amountNaira: '', status: 'pending' }); setOrderError(''); setShowOrderModal(true) }}
                className="w-full py-2 text-sm font-semibold rounded-xl hover:opacity-90 transition"
                style={{ background: '#dce5fd', color: PRIMARY }}
              >
                <ShoppingBag size={14} className="inline mr-1.5" />
                Create Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send WhatsApp Message Modal */}
      {showMsgModal && sel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowMsgModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Send WhatsApp Message</h2>
                <p className="text-xs text-gray-400 mt-0.5">To: {sel.name || sel.phone} · {sel.phone}</p>
              </div>
              <button onClick={() => setShowMsgModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSendWhatsApp} className="px-6 py-5 space-y-4">
              <textarea
                rows={4}
                required
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Type your message…"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300 resize-none"
              />
              {msgError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{msgError}</div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMsgModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={msgSending || !msgText.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60" style={{ background: PRIMARY }}>
                  <Send size={14} />
                  {msgSending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && sel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowOrderModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Create Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">For: {sel.name || sel.phone}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product / Item</label>
                <input type="text" value={orderForm.product} onChange={e => setOrderForm(f => ({ ...f, product: e.target.value }))} placeholder="e.g. Corset Dress" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Size <span className="text-gray-300 font-normal">(optional)</span></label>
                <input type="text" value={orderForm.size} onChange={e => setOrderForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. M, L, 42" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount (₦) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                  <input type="number" min="0" step="any" required value={orderForm.amountNaira} onChange={e => setOrderForm(f => ({ ...f, amountNaira: e.target.value }))} placeholder="0" className="w-full pl-7 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={orderForm.status} onChange={e => setOrderForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300">
                  {[['pending','Pending'],['confirmed','Confirmed'],['paid','Paid'],['fulfilled','Fulfilled'],['cancelled','Cancelled']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              {orderError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{orderError}</div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={orderSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60" style={{ background: PRIMARY }}>
                  {orderSubmitting ? 'Creating…' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
