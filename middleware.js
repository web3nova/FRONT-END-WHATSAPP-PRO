// Vercel Routing Middleware (edge). Social/chat crawlers don't execute JS,
// so the SPA's client-side og-tag injection is invisible to them — shared
// storefront links show no preview card. For known crawler user-agents on
// storefront URLs, serve a minimal HTML document with the tags instead.
// Real browsers (and any error path) fall through to the SPA untouched.

const BOT_RE = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|slackbot|discord|pinterest|snapchat|googlebot|bingbot/i

// Same backend base URL the SPA uses (VITE_API_URL in the Vercel project env).
const API_BASE = (() => {
  try { return new URL(process.env.VITE_API_URL || '').origin } catch { return '' }
})()

// Hosts where the SPA itself lives — storefronts appear under /storefront/:tenantId.
// Any other host is a tenant's custom domain, where the storefront is the root.
const PLATFORM_HOSTS = new Set(['biziq.online', 'www.biziq.online', 'localhost'])

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export default async function middleware(request) {
  const url = new URL(request.url)

  // Proxy /assets/* to the backend (bypasses Cross-Origin-Resource-Policy).
  // The Vite dev server does this via its own proxy; on Vercel the edge
  // middleware handles it so images load same-origin in production too.
  if (API_BASE && url.pathname.startsWith('/assets/')) {
    const target = `${API_BASE}${url.pathname}${url.search}`
    return fetch(target, { headers: { accept: request.headers.get('accept') || '*/*' } })
  }

  const ua = request.headers.get('user-agent') || ''
  if (!BOT_RE.test(ua)) return

  const url = new URL(request.url)
  const host = url.hostname
  const isPlatformHost = PLATFORM_HOSTS.has(host) || host.endsWith('.vercel.app')

  let query = null
  if (isPlatformHost) {
    const m = url.pathname.match(/^\/storefront\/([^/]+)/)
    if (m) query = `tenantId=${encodeURIComponent(m[1])}`
  } else {
    query = `domain=${encodeURIComponent(host)}`
  }
  if (!query) return

  // Same backend base URL the SPA uses (VITE_API_URL in the Vercel project env).
  const apiBase = process.env.VITE_API_URL
  if (!apiBase) return

  try {
    const res = await fetch(`${apiBase}/website/storefront?${query}`)
    if (!res.ok) return
    const body = await res.json()
    const data = body?.data || body
    const business = data?.business || {}
    const seo = data?.settings?.seo || {}
    const title = escapeHtml(seo.title || business.displayName || 'Storefront')
    const description = escapeHtml(seo.description || business.description || `Shop ${seo.title || business.displayName || ''}`.trim())
    const rawImage = seo.ogImage || business.logoUrl || ''
    const image = escapeHtml(
      rawImage && !rawImage.startsWith('http')
        ? `${new URL(apiBase).origin}${rawImage}`
        : rawImage
    )
    const pageUrl = escapeHtml(url.href)

    const html = `<!doctype html><html><head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${image ? `<meta property="og:image" content="${image}">` : ''}
<meta property="og:url" content="${pageUrl}">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
</head><body>${title}</body></html>`

    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch {
    return
  }
}

export const config = {
  // Storefront paths on platform hosts; root/shop/page paths for custom
  // domains. Non-storefront platform paths produce no query above and fall
  // through even for bots.
  matcher: ['/storefront/:path*', '/assets/:path*', '/', '/shop', '/:view'],
}
