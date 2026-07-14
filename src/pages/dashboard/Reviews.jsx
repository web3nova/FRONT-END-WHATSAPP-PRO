import { useEffect, useState } from 'react'
import { Star, MessageSquareText, Check, X as XIcon } from 'lucide-react'
import { useNotify } from '../../context/NotificationContext'
import { listReviews, updateReviewStatus } from '../../api/reviewsApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={13}
          fill={n <= rating ? '#f59e0b' : 'none'}
          strokeWidth={1.5}
          style={{ color: n <= rating ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const { toast } = useNotify()
  const [status, setStatus] = useState('pending')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actingId, setActingId] = useState(null)

  const load = async (s = status) => {
    try {
      setLoading(true)
      setError('')
      const data = await listReviews(s)
      setReviews(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(err.message || 'Could not load reviews.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(status) }, [status])

  const handleAction = async (r, newStatus) => {
    const id = r.id || r._id
    setActingId(id)
    try {
      await updateReviewStatus(id, newStatus)
      // Moderation queue — once acted on, the row no longer belongs in the
      // currently-viewed tab, so drop it optimistically rather than refetch.
      setReviews(prev => prev.filter(x => (x.id || x._id) !== id))
      toast.success(newStatus === 'approved' ? 'Review approved' : 'Review rejected')
    } catch (err) {
      toast.error(err.message || 'Could not update review.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div data-tour="reviews-root" className="space-y-4 sm:space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">Moderate customer reviews for your storefront</p>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className="px-3.5 py-2 text-sm font-semibold rounded-xl border transition"
            style={status === t.key
              ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY }
              : { borderColor: '#e5e7eb', color: '#6b7280' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading reviews...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {!loading && reviews.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 px-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: CREAM }}>
            <MessageSquareText size={22} className="text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-700 mt-1">No {status} reviews</div>
          <p className="text-xs text-gray-400 max-w-xs">
            {status === 'pending' ? "You're all caught up — new reviews will show up here." : `No ${status} reviews yet.`}
          </p>
        </div>
      )}

      {reviews.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-2.5">
            {reviews.map((r) => {
              const id = r.id || r._id
              return (
                <div key={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{r.productName || 'Product'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.customerName || 'Anonymous'}</div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.text && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.text}</p>}
                  <div className="text-xs text-gray-400 mt-2">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                  </div>
                  {status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => handleAction(r, 'approved')}
                        disabled={actingId === id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-green-200 text-green-600 active:bg-green-50 disabled:opacity-50"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(r, 'rejected')}
                        disabled={actingId === id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-red-100 text-red-500 active:bg-red-50 disabled:opacity-50"
                      >
                        <XIcon size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop / tablet: table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: CREAM }}>
                  {['Product', 'Customer', 'Rating', 'Review', 'Submitted', status === 'pending' ? '' : null].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                  {status === 'pending' && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map((r) => {
                  const id = r.id || r._id
                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">{r.productName || 'Product'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">{r.customerName || 'Anonymous'}</td>
                      <td className="px-5 py-3.5"><Stars rating={r.rating} /></td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 max-w-sm">{r.text || <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                      {status === 'pending' && (
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAction(r, 'approved')}
                              disabled={actingId === id}
                              className="p-1.5 text-gray-300 hover:text-green-600 rounded-lg disabled:opacity-50"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleAction(r, 'rejected')}
                              disabled={actingId === id}
                              className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg disabled:opacity-50"
                              title="Reject"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
