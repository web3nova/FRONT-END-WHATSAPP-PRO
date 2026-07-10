import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Monitor, Smartphone, ExternalLink, Loader, AlertCircle } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken } from '../../lib/auth'
import { THEMES } from '../../lib/themes'
import StorefrontPreview from './StorefrontPreview'

const PRIMARY = '#4166F5'

export default function WebsitePreview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState(null)
  const [pages, setPages] = useState([])
  const [device, setDevice] = useState('desktop')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const token = getStoredAccessToken()
        if (!token) throw new Error('You need to sign in to preview your website.')

        const headers = { Authorization: `Bearer ${token}` }
        const [bizRes, prodRes, wsRes, pagesRes] = await Promise.all([
          fetch(`${API_BASE}/business`, { headers }),
          fetch(`${API_BASE}/products?limit=100&sort=sortOrder`, { headers }),
          fetch(`${API_BASE}/website/settings`, { headers }),
          fetch(`${API_BASE}/website/pages?limit=100`, { headers }),
        ])

        if (bizRes.ok && !ignore) {
          const body = await bizRes.json()
          setBusiness(body?.data || body)
        }
        if (prodRes.ok && !ignore) {
          const body = await prodRes.json()
          const list = body?.data?.items || body?.data || body?.products || []
          setProducts(Array.isArray(list) ? list : [])
        }
        if (wsRes.ok && !ignore) {
          const body = await wsRes.json()
          setSettings(body?.data || body)
        }
        if (pagesRes.ok && !ignore) {
          const body = await pagesRes.json()
          const list = body?.data || []
          setPages(Array.isArray(list) ? list : [])
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Could not load preview.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const _brandName = business?.displayName || 'Your Brand'
  const whatsapp = business?.whatsappNumber || ''
  // Same fallback as Website.jsx: custom domain if connected, else the
  // platform-hosted storefront URL. Never a fabricated domain.
  const liveUrl = business?.domain
    ? `https://${business.domain}`
    : `${window.location.origin}/storefront/${business?.tenantId || ''}`
  const domain = business?.domain || `${window.location.host}/storefront/${business?.tenantId || ''}`
  const activeTheme = { ...(THEMES[settings?.theme?.templateId] || THEMES.minimal), ...(settings?.theme?.customTheme || {}), sectionStyles: settings?.theme?.sectionStyles || {} }

  return (
    <div className="fixed inset-0 z-40 bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition p-1.5 -m-1.5 flex-shrink-0"
        >
          <ArrowLeft size={17} />
          <span className="hidden sm:inline">Back to editor</span>
        </button>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="text-xs text-gray-400 truncate sm:hidden">{domain}</div>
        </div>

        {/* Device toggle */}
        <div className="hidden sm:flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
          <button
            onClick={() => setDevice('desktop')}
            aria-label="Preview as desktop"
            className="p-2 rounded-lg transition"
            style={device === 'desktop' ? { background: 'white', color: PRIMARY, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : { color: '#9ca3af' }}
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            aria-label="Preview as mobile"
            className="p-2 rounded-lg transition"
            style={device === 'mobile' ? { background: 'white', color: PRIMARY, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : { color: '#9ca3af' }}
          >
            <Smartphone size={16} />
          </button>
        </div>

        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-3.5 py-2 rounded-xl flex-shrink-0"
          style={{ background: PRIMARY }}
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">Open Live Site</span>
        </a>
      </div>

      {/* Mobile-only device toggle row (desktop toggle is inline above) */}
      <div className="sm:hidden flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex justify-center">
        <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
          <button
            onClick={() => setDevice('desktop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={device === 'desktop' ? { background: 'white', color: PRIMARY, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : { color: '#9ca3af' }}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={device === 'mobile' ? { background: 'white', color: PRIMARY, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : { color: '#9ca3af' }}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>
      </div>

      {/* Preview canvas */}
      <div className="flex-1 overflow-y-auto p-0 sm:p-6 flex justify-center items-start">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-16">
            <Loader size={16} className="animate-spin" />
            Loading preview...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-center py-16 px-6 max-w-sm">
            <AlertCircle size={22} className="text-red-400" />
            <div className="text-sm font-semibold text-gray-700">{error}</div>
            <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: PRIMARY }}>
              Back to editor
            </button>
          </div>
        ) : (
          <div
            className="bg-white shadow-sm overflow-hidden transition-all duration-300 w-full"
            style={device === 'mobile' ? { maxWidth: 400, borderRadius: 24, border: '8px solid #1f2937' } : { maxWidth: 1100, borderRadius: 16 }}
          >
            <StorefrontPreview business={business} products={products} whatsapp={whatsapp} domain={domain} device={device} settings={settings} theme={activeTheme} pages={pages} />
          </div>
        )}
      </div>
    </div>
  )
}