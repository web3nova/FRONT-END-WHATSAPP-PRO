import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader, Package, ArrowLeft, LogOut, ChevronRight, ShoppingBag, User, LogIn } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import AuthModal from '../../components/AuthModal'

const INK = '#1a1a2e'
const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  paid: 'Paid',
  fulfilled: 'Delivered',
  cancelled: 'Cancelled',
}
const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  paid: '#10b981',
  fulfilled: '#059669',
  cancelled: '#ef4444',
}
const PAYMENT_LABELS = {
  bank: 'Bank Transfer', cash: 'Cash on Delivery', paystack: 'Paystack',
  card: 'Card', monnify: 'Monnify', flutterwave: 'Flutterwave',
  crypto: 'Crypto',
}

export default function CustomerAccount() {
  const { slug } = useParams()
  const { customer, token, logout, googleLogin, login } = useCustomerAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load orders')
        const body = await res.json()
        setOrders(body?.data ?? body ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const base = slug ? `/b/${slug}` : '/storefront/account'

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Package size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">My Orders</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to view your order history.</p>
          <Link
            to={slug ? `/b/${slug}` : '/'}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition mb-4"
          >
            <ArrowLeft size={14} /> Back to store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            to={slug ? `/b/${slug}` : '/'}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            <ArrowLeft size={15} /> Back to Store
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: INK }}>
            <User size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{customer?.name || 'Customer'}</div>
            <div className="text-xs text-gray-500">{customer?.phone || ''}</div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={18} /> My Orders
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Your order history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                  <div>
                    <span className="text-xs font-bold text-gray-400">#{order.reference}</span>
                    <span className="mx-2 text-gray-200">|</span>
                    <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}
                  >
                    {STATUS_LABELS[order.status] || order.status.toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div className="px-4 py-3 space-y-1.5">
                  {(order.items || []).slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-600 truncate mr-2">{item.name} x{item.quantity || 1}</span>
                      <span className="font-semibold text-gray-800 flex-shrink-0">
                        ₦{((item.priceMinor || 0) * (item.quantity || 1) / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(order.items || []).length > 4 && (
                    <div className="text-[10px] text-gray-400">+{order.items.length - 4} more items</div>
                  )}
                </div>

                {/* Details */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment</span>
                    <span className="font-medium text-gray-700">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || '—'}</span>
                  </div>
                  {order.deliveryMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span className="font-medium text-gray-700 capitalize">{order.deliveryMethod}</span>
                    </div>
                  )}
                  {order.deliveryCity && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivering to</span>
                      <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">
                        {[order.deliveryCity, order.deliveryState].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-base font-bold" style={{ color: INK }}>₦{(order.totalMinor / 100).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


