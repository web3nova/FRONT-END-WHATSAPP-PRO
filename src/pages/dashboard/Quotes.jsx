import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText } from 'lucide-react'
import { listQuotes, updateQuoteStatus } from '../../api/quotesApi'
import { createOrder } from '../../api/ordersApi'
import { useNotify } from '../../context/NotificationContext'

const PRIMARY = '#4166F5'

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     bg: '#f3f4f6', color: '#6b7280' },
  sent:      { label: 'Awaiting',  bg: '#FEF3C7', color: '#D97706' },
  accepted:  { label: 'Accepted',  bg: '#D1FAE5', color: '#059669' },
  rejected:  { label: 'Rejected',  bg: '#FEE2E2', color: '#DC2626' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#DC2626' },
}

const TABS = ['all', 'sent', 'accepted', 'rejected', 'cancelled']
const TAB_LABEL = {
  all: 'All Quotes', sent: 'Awaiting', accepted: 'Accepted', rejected: 'Rejected', cancelled: 'Cancelled',
}

function formatAmount(amountMinor = 0) {
  return `₦${(amountMinor / 100).toLocaleString()}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function shortId(uuid) {
  return `#${uuid.slice(0, 8).toUpperCase()}`
}

function extractItem(details) {
  const item = details?.items?.[0]
  return item?.name || details?.item || details?.description || '—'
}

export default function Quotes() {
  const navigate = useNavigate()
  const { toast } = useNotify()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    listQuotes(activeTab === 'all' ? {} : { status: activeTab })
      .then(res => { if (!ignore) setQuotes(res.data) })
      .catch(err => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [activeTab])

  const filtered = quotes.filter(q => {
    if (!search) return true
    const s = search.toLowerCase()
    return q.customer?.name?.toLowerCase().includes(s) || q.customer?.phone?.includes(s) || extractItem(q.details).toLowerCase().includes(s)
  })

  const handleStatusChange = async (quote, status) => {
    setUpdatingId(quote.id)
    try {
      await updateQuoteStatus(quote.id, status)
      setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status } : q))
      toast.success(`Quote marked ${STATUS_CONFIG[status]?.label || status}.`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  // Manual equivalent of what the AI does automatically when a customer
  // accepts a quote in chat — creates the order and links it back to this
  // quote (marks it accepted), so staff-side quotes convert the same way.
  const handleConvertToOrder = async (quote) => {
    setUpdatingId(quote.id)
    try {
      const items = Array.isArray(quote.details?.items) && quote.details.items.length
        ? quote.details.items
        : [{ name: extractItem(quote.details), qty: 1, priceMinor: quote.amountMinor }]
      const order = await createOrder({
        customerId: quote.customerId || null,
        conversationId: quote.conversationId || null,
        quoteId: quote.id,
        totalMinor: quote.amountMinor,
        currency: quote.currency,
        items,
      })
      setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'accepted', orderId: order.id } : q))
      toast.success('Order created and linked to this quote.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-400 mt-0.5">Price estimates your AI agent has sent to customers.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition"
              style={activeTab === tab ? { background: PRIMARY, color: 'white' } : { background: '#f3f4f6', color: '#6b7280' }}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer or item…"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Quote', 'Customer', 'Item', 'Amount', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">Loading quotes…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  {search ? 'No quotes match your search.' : 'No quotes yet.'}
                </td></tr>
              ) : (
                filtered.map(q => {
                  const s = STATUS_CONFIG[q.status] || { label: q.status, bg: '#f3f4f6', color: '#6b7280' }
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-mono text-gray-400">{shortId(q.id)}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium text-gray-900">{q.customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{q.customer?.phone || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{extractItem(q.details)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">{formatAmount(q.amountMinor)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-lg" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                        {q.status === 'accepted' && q.orderId && (
                          <button
                            onClick={() => navigate('/dashboard/orders')}
                            className="block text-[11px] mt-1 hover:underline"
                            style={{ color: PRIMARY }}
                          >
                            View order {shortId(q.orderId)} →
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{formatDate(q.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {(q.status === 'sent' || q.status === 'draft') && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleConvertToOrder(q)}
                              disabled={updatingId === q.id}
                              className="text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                              style={{ background: PRIMARY }}
                            >
                              {updatingId === q.id ? '…' : 'Convert to Order'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(q, 'cancelled')}
                              disabled={updatingId === q.id}
                              className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
