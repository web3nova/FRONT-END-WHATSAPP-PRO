import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react'
import { API_BASE } from '../lib/apiConfig'
import StorefrontPreview from './dashboard/StorefrontPreview'

export default function StorefrontPage() {
  const { tenantId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/website/storefront?tenantId=${tenantId}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Storefront not found. The business may not be published yet.')
          throw new Error('Could not load storefront.')
        }
        const body = await res.json()
        if (!ignore) setData(body)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [tenantId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader size={16} className="animate-spin" />
          Loading storefront...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Storefront Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl"
            style={{ background: '#4166F5' }}
          >
            <ArrowLeft size={15} /> Go Home
          </Link>
        </div>
      </div>
    )
  }

  const business = data?.business || {}
  const settings = data?.settings || {}
  const products = data?.products || []
  const whatsapp = business?.whatsappNumber || ''
  const domain = data?.tenant?.domain || ''

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition">&larr; Back to {import.meta.env.VITE_APP_NAME || 'Home'}</Link>
        <span className="text-xs text-gray-400">{business?.displayName || 'Storefront'}</span>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 flex justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white shadow-sm overflow-hidden w-full" style={{ maxWidth: 1100, borderRadius: 16 }}>
          <StorefrontPreview
            business={business}
            products={products}
            whatsapp={whatsapp}
            domain={domain}
            device="desktop"
            settings={settings}
          />
          {/* Footer */}
          <div className="border-t border-gray-100 px-8 py-3 text-center">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-semibold" style={{ color: '#4166F5' }}>{import.meta.env.VITE_APP_NAME || 'Web3nova'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
