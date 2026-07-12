import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react'
import { API_BASE } from '../lib/apiConfig'
import { THEMES } from '../lib/themes'
import { resolveImageUrl } from '../lib/utils'
import StorefrontPreview from './dashboard/StorefrontPreview'

export default function StorefrontPage({ domain: domainProp } = {}) {
  const { tenantId, slug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const query = slug
          ? `slug=${encodeURIComponent(slug)}`
          : domainProp
            ? `domain=${encodeURIComponent(domainProp)}`
            : `tenantId=${tenantId}`
        const res = await fetch(`${API_BASE}/website/storefront?${query}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Storefront not found. The business may not be published yet.')
          throw new Error('Could not load storefront.')
        }
        const body = await res.json()
        if (!ignore) setData(body.data ?? body)
      } catch (err) {
        if (!ignore) setError(err.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [tenantId, domainProp])

  // Inject SEO meta tags into <head> once data is loaded.
  // Must run before the loading/error early returns below — hooks can't be conditional.
  useEffect(() => {
    if (!data) return
    const business = data?.business || {}
    const settings = data?.settings || {}
    const domain = data?.tenant?.domain || ''
    const seo = settings?.seo || {}
    const appName = import.meta.env.VITE_APP_NAME || 'Web3nova'

    const title = seo.title || business.displayName || appName
    document.title = title

    const setMeta = (name, content, prop = false) => {
      if (!content) return
      const attr = prop ? 'property' : 'name'
      let tag = document.querySelector(`meta[${attr}="${name}"]`)
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, name); document.head.appendChild(tag) }
      tag.content = content
    }

    setMeta('description', seo.description || business.description || `Shop ${title}`)
    setMeta('og:title', title, true)
    setMeta('og:description', seo.description || business.description, true)
    setMeta('og:image', resolveImageUrl(seo.ogImage || business.logoUrl), true)
    setMeta('og:type', 'website', true)
    if (domain) setMeta('og:url', `https://${domain}`, true)

    return () => { document.title = appName }
  }, [data])

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
  const pages = data?.pages || []
  const whatsapp = business?.whatsappNumber || ''
  const domain = data?.tenant?.domain || ''
  const activeTheme = { ...(THEMES[settings?.theme?.templateId] || THEMES.minimal), ...(settings?.theme?.customTheme || {}), sectionStyles: settings?.theme?.sectionStyles || {} }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition">&larr; Back to {import.meta.env.VITE_APP_NAME || 'Home'}</Link>
        <span className="text-xs text-gray-400">{business?.displayName || 'Storefront'}</span>
      </div>

      {/* Storefront canvas */}
      <div className="flex-1 bg-white">
        <StorefrontPreview
          business={business}
          products={products}
          whatsapp={whatsapp}
          domain={domain}
          device="auto"
          settings={settings}
          theme={activeTheme}
          pages={pages}
          routed
        />
      </div>
    </div>
  )
}
