import {
  Menu, X, Star, ShieldCheck, MessageCircle,
  Search, User, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft,
  Plus, Trash2, LogOut, Package, Clock, ChevronDown, Loader,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useNotify } from '../../context/NotificationContext'
import {
  DEFAULT_INK, DEFAULT_CREAM, DEFAULT_GOLD, DEFAULT_FONT, DEFAULT_RADIUS, BODY,
  isSectionActive, mixHexWithWhite, socialHref, isSoldOut, useThemeFont,
  Facebook, Instagram, Twitter, Youtube,
} from './storefronts/shared'
import HeroSection from './storefronts/sections/HeroSection'
import { ProductCard } from './storefronts/sections/ProductsSection'
import { sectionByLegacyId, sectionByType, DEFAULT_REORDERABLE_ORDER } from './storefronts/sectionRegistry'
import { API_BASE } from '../../lib/apiConfig'
import { resolveImageUrl } from '../../lib/utils'
import AuthModal from '../../components/AuthModal'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

// This component is the storefront's orchestrator: it owns the shared
// Nav/Footer chrome and all cross-section state (view, selected product,
// search, shop category, testimonial index), builds a single `ctx` object
// with every derived value sections need, and delegates each of the 6
// mix-and-match sections (Hero/Products/About/Gallery/Testimonials/Contact)
// to its own component under storefronts/sections/, rendered with whichever
// style variant ('boutique' | 'catalog' | 'magazine') the tenant picked per
// section (settings.theme.sectionStyles). Nav and Footer are not variant-able
// — one consistent frame holds together whatever mix of section styles sits
// between them.
//
// ── Dual-context navigation ─────────────────────────────────────────────
// This component renders in two very different places:
//   1. The live public storefront (StorefrontPage.jsx), where it sits under
//      a real <BrowserRouter> and view changes (Home/Shop/custom page)
//      should push shareable, deep-linkable URLs.
//   2. The website builder's live mockup (Website.jsx / WebsitePreview.jsx),
//      a fake-browser-chrome preview embedded in the dashboard. It is ALSO
//      technically inside the app's <BrowserRouter> (the dashboard routes),
//      so `useInRouterContext()` can't distinguish the two cases — it would
//      return true in both, and real navigation there would hijack the
//      merchant's dashboard URL.
//
// The caller disambiguates explicitly via the `routed` prop (default false).
// Since React hooks can't be called conditionally, the two behaviors are
// split into sibling components — RoutedStorefrontPreview (calls
// useNavigate/useParams, always rendered inside a Router because `routed`
// is only ever true from StorefrontPage.jsx) and UnroutedStorefrontPreview
// (plain useState, zero router hooks, used everywhere else including the
// builder preview) — both delegating to the shared `StorefrontPreviewBody`
// for the ~650 lines of render JSX so nothing is duplicated.
export default function StorefrontPreview(props) {
  return props.routed
    ? <RoutedStorefrontPreview {...props} />
    : <UnroutedStorefrontPreview {...props} />
}

function RoutedStorefrontPreview(props) {
  const { pages = [] } = props
  const { tenantId, slug, view: viewParam } = useParams()
  const navigate = useNavigate()

  const [view, setView] = useState('home')
  const [activePage, setActivePage] = useState(null)
  const [shopCategory, setShopCategory] = useState('all')

  const base = slug ? `/b/${slug}` : tenantId ? `/storefront/${tenantId}` : ''
  const homePath = base || '/'
  const shopPath = `${base}/shop`
  const pagePath = (pSlug) => `${base}/${pSlug}`

  // URL is the source of truth: read :view on mount and whenever it changes
  // (browser back/forward, or a navigate() call below) and derive view state.
  useEffect(() => {
    if (!viewParam) {
      setView('home')
      setActivePage(null)
      return
    }
    if (viewParam === 'shop') {
      setView('shop')
      setActivePage(null)
      return
    }
    const match = pages.find(p => p.slug === viewParam)
    if (match) {
      setActivePage(match)
      setView('page')
    } else {
      // Unknown or unpublished slug. `pages` is complete by the time this
      // mounts (StorefrontPage only renders us after data lands), so redirect
      // to the canonical home URL instead of silently rendering Home under a
      // wrong address.
      navigate(homePath, { replace: true })
    }
  }, [viewParam, pages, homePath, navigate])

  // Keep the tab title and meta description in sync with the current view.
  // StorefrontPage sets the site-level tags once on load; this layers the
  // per-view value on top, on the live (routed) storefront only — the
  // unrouted builder preview must never touch the dashboard's title.
  const { business, settings } = props
  useEffect(() => {
    const brand = business?.displayName || ''
    const siteTitle = settings?.seo?.title || brand
    if (view === 'shop') {
      document.title = brand ? `Shop — ${brand}` : 'Shop'
    } else if (view === 'page' && activePage) {
      document.title = brand ? `${activePage.title} — ${brand}` : activePage.title
      const desc = activePage.content?.seoDescription
      if (desc) {
        let tag = document.querySelector('meta[name="description"]')
        if (!tag) {
          tag = document.createElement('meta')
          tag.setAttribute('name', 'description')
          document.head.appendChild(tag)
        }
        tag.content = desc
      }
    } else if (siteTitle) {
      document.title = siteTitle
    }
  }, [view, activePage, business, settings])

  const accountPath = `${base}/account`
  const nav = {
    view, activePage, shopCategory, setShopCategory, accountPath,
    // Guard against re-pushing the same route on every call (e.g. typing in
    // the search box calls navigateShop on each keystroke) — only push a
    // new history entry when the target view actually differs.
    navigateHome: () => { if (viewParam) navigate(homePath) },
    navigateShop: () => { if (viewParam !== 'shop') navigate(shopPath) },
    navigateToPage: (page) => { if (viewParam !== page.slug) navigate(pagePath(page.slug)) },
  }

  return <StorefrontPreviewBody {...props} nav={nav} />
}

function UnroutedStorefrontPreview(props) {
  const [view, setView] = useState('home')
  const [activePage, setActivePage] = useState(null)
  const [shopCategory, setShopCategory] = useState('all')

  const nav = {
    view, activePage, shopCategory, setShopCategory, accountPath: `/account`,
    navigateHome: () => { setView('home'); setActivePage(null) },
    navigateShop: () => setView('shop'),
    navigateToPage: (page) => { setActivePage(page); setView('page') },
  }

  return <StorefrontPreviewBody {...props} nav={nav} />
}

function StorefrontPreviewBody({ business, products, whatsapp, domain, device = 'desktop', settings, theme, pages = [], nav, paymentConfig, tenantId: tenantIdProp }) {
   const { toast } = useNotify()
   const { customer, token, logout } = useCustomerAuth()
   const INK = theme?.ink || DEFAULT_INK
   const GOLD = theme?.accent || DEFAULT_GOLD
   const CREAM = theme?.soft || DEFAULT_CREAM
   const fontName = theme?.font || DEFAULT_FONT
   const radius = theme?.radius ?? DEFAULT_RADIUS
   const DISPLAY = `'${fontName}', ui-serif, Georgia, serif`
   const sectionStyles = theme?.sectionStyles || {}

   // Homepage section order — driven by settings.sections (array order is
  // render order, set via the Sections tab's up/down reorder controls).
  // Hero always renders first regardless; these 5 are the reorderable set.
  const REORDERABLE_DEFAULT_ORDER = DEFAULT_REORDERABLE_ORDER

  const PASTELS = [
    mixHexWithWhite(GOLD, 0.92),
    mixHexWithWhite(GOLD, 0.86),
    mixHexWithWhite(INK, 0.94),
    mixHexWithWhite(GOLD, 0.9),
    mixHexWithWhite(CREAM, 0.4),
  ]

  useThemeFont(fontName)

  // ── State ────────────────────────────────────────────────────────────────
  const [navOpen, setNavOpen] = useState(false)
  const [announceIdx, setAnnounceIdx] = useState(0)
  const [testiIdx, setTestiIdx] = useState(0)
  const { view, activePage, shopCategory, setShopCategory, navigateHome, navigateShop, navigateToPage, accountPath } = nav
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAttrs, setSelectedAttrs] = useState({})
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // ── Cart / Checkout ────────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('storefront_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem('storefront_cart', JSON.stringify(cart))
  }, [cart])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(0)
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', email: '', address: '', state: '', city: '', whatsapp: '', postBox: '', landmark: '' })
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [paymentRedirect, setPaymentRedirect] = useState(null)
  const [bankTransferInfo, setBankTransferInfo] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const deliveryLabels = { pickup: 'Store Pickup', local: 'Local Delivery', nationwide: 'Nationwide Shipping', digital: 'Digital / Instant' }
  const paymentLabels = { bank: 'Bank Transfer', card: 'Credit/Debit Card', paystack: 'Paystack', flutterwave: 'Flutterwave', cash: 'Cash on Delivery', crypto: 'Crypto' }

  const deliveryOptions = settings?.theme?.builder?.delivery || []
  // Minor-unit fees from builder JSON; backend recomputes authoritatively.
  const deliveryFees = settings?.theme?.builder?.deliveryFees || {}
  const feeFor = (method) => (Number.isInteger(deliveryFees[method]) && deliveryFees[method] > 0 ? deliveryFees[method] : 0)

  const computedPaymentOptions = useMemo(() => {
    const options = []
    if (paymentConfig?.paystack?.isActive) options.push({ key: 'paystack', label: 'Paystack (Card, USSD, Transfer)' })
    if (paymentConfig?.monnify?.isActive) options.push({ key: 'monnify', label: 'Monnify' })
    if (paymentConfig?.manual?.isActive) options.push({ key: 'bank', label: 'Bank Transfer' })
    if (paymentConfig?.blockradar?.isActive) options.push({ key: 'crypto', label: 'Crypto (USDT, BTC, ETH)' })
    return options
  }, [paymentConfig])

  const businessDelivery = useMemo(() => ({
    availableDays: business?.availableDays || [],
    openingTime: business?.openingTime || '',
    closingTime: business?.closingTime || '',
    deliveryStructure: business?.deliveryStructure || '',
  }), [business])

  function addToCart(product, attrs = {}) {
    const key = `${product.id}_${JSON.stringify(attrs)}`
    setCart(c => {
      const idx = c.findIndex(i => i.key === key)
      return idx >= 0 ? c.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i) : [...c, { key, product, attrs, qty: 1 }]
    })
    fetch(`${API_BASE}/products/${product.id}/view`, { method: 'POST' }).catch(() => {})
  }

  function removeFromCart(key) {
    setCart(c => c.filter(i => i.key !== key))
  }

  function updateCartQty(key, delta) {
    setCart(c => c.map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + (i.product.priceMinor || 0) * i.qty, 0)
  const selectedDeliveryFee = feeFor(selectedDelivery)
  const orderTotal = cartTotal + selectedDeliveryFee

async function placeOrder() {
    if (!token) {
      setCheckoutOpen(false)
      setShowAuthModal(true)
      return
    }

    if (!selectedPayment) { toast.error('Please select a payment method.'); return }
    setPlacingOrder(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      headers.Authorization = `Bearer ${token}`

      const tenantId = tenantIdProp || business?.tenantId || ''

      const result = await fetch(`${API_BASE}/checkout/place-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName: checkoutForm.name,
          customerPhone: checkoutForm.phone,
          customerWhatsapp: checkoutForm.whatsapp || checkoutForm.phone,
          customerEmail: checkoutForm.email,
          customerAddress: checkoutForm.address,
          customerState: checkoutForm.state,
          customerCity: checkoutForm.city,
          customerPostBox: checkoutForm.postBox || '',
          customerLandmark: checkoutForm.landmark || '',
          tenantId,
          items: cart.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            priceMinor: i.product.priceMinor || 0,
            quantity: i.qty,
            attributes: i.attrs,
          })),
          totalMinor: orderTotal,
          currency: 'NGN',
          deliveryMethod: selectedDelivery,
          paymentMethod: selectedPayment,
        }),
      })
      const body = await result.json().catch(() => null)
      if (!result.ok) throw new Error(body?.message || `Failed to place order (${result.status})`)
      const orderResult = body?.data ?? body

      setCheckoutOpen(false)
      setCheckoutStep(1)
      setCart([])
      localStorage.removeItem('storefront_cart')
      setCheckoutForm({ name: '', phone: '', email: '', address: '', state: '', city: '', whatsapp: '', postBox: '', landmark: '' })
      setSelectedDelivery('')
      setSelectedPayment('')

      if (orderResult?.payment?.checkoutUrl) {
        setPaymentRedirect(orderResult.payment.checkoutUrl)
      } else if (selectedPayment === 'bank') {
        const bankAcct = orderResult?.bankDetails || paymentConfig?.manual?.bankAccount
        if (bankAcct) {
          setBankTransferInfo({
            orderRef: orderResult?.order?.reference || '',
            total: orderResult?.order?.totalMinor || cartTotal,
            currency: orderResult?.order?.currency || 'NGN',
            ...bankAcct,
          })
        } else {
          setOrderPlaced(true)
          setTimeout(() => setOrderPlaced(false), 5000)
        }
      } else {
        const base = slug ? `/b/${slug}` : `/storefront/${tenantId}`
        window.location.href = `${base}/account`
      }
    } catch (err) {
      console.error('Failed to place order:', err)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacingOrder(false)
    }
  }

  // Redirect to payment gateway when URL is set
  useEffect(() => {
    if (paymentRedirect) {
      window.open(paymentRedirect, '_blank')
      setPaymentRedirect(null)
      setOrderPlaced(true)
      setTimeout(() => setOrderPlaced(false), 5000)
    }
  }, [paymentRedirect])

  // 'auto' = live storefront: follow the real viewport. Explicit
  // 'desktop'/'mobile' = builder preview toggle, unchanged behavior.
  const [viewportMobile, setViewportMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  )
  useEffect(() => {
    if (device !== 'auto') return
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setViewportMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [device])
  const isMobile = device === 'auto' ? viewportMobile : device === 'mobile'

  const instanceId = useRef(`sf-${Math.random().toString(36).slice(2, 9)}`).current
  const sectionId = (key) => `${instanceId}-${key}`

  const scrollToSection = (key) => {
    setNavOpen(false)
    navigateHome()
    // On the routed storefront navigateHome() triggers a real route change,
    // so the target section may not be mounted yet — poll briefly (up to ~1s)
    // instead of hoping one 50ms tick is enough.
    let attempts = 0
    const tryScroll = () => {
      const el = document.getElementById(sectionId(key))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (attempts++ < 20) setTimeout(tryScroll, 50)
    }
    setTimeout(tryScroll, 50)
  }

  // ── Business / builder data ───────────────────────────────────────────────
  const brandName = business?.displayName || 'Your Brand'
  const tagline = business?.tagline || ''
  const logoUrl = resolveImageUrl(business?.logoUrl || '')

  const builder = settings?.theme?.builder || {}
  const hero = builder.hero || {}
  const heroHeadline = hero.headline || brandName
  const heroSubtitle = hero.subtitle || tagline
  const heroCta = hero.cta || 'Order Now'
  const heroBg = hero.bg || INK
  const heroBg2 = hero.bg2 || ''
  const heroLayout = hero.layout || 'center'
  const heroBgImage = resolveImageUrl(hero.bgImage || '')

  const aboutText = builder.about?.text || business?.description || ''
  const aboutTitle = (builder.about?.title || '').trim() || 'Our Story'
  const aboutImage = resolveImageUrl(builder.about?.image || '') || logoUrl

  const productsCfg = builder.products || {}
  const productCount = productsCfg.count || 8
  const productsTitle = productsCfg.title || 'Best Sellers'

  const galleryCfg = builder.gallery || {}
  const galleryImages = Array.isArray(galleryCfg.images)
    ? galleryCfg.images.filter(Boolean).map(img => {
        if (typeof img === 'string') return resolveImageUrl(img)
        return { ...img, url: resolveImageUrl(img.url || '') }
      })
    : []
  const galleryTitle = galleryCfg.title || 'Gallery'

  const testimonialsCfg = builder.testimonials || {}
  const testimonialItems = Array.isArray(testimonialsCfg.items) ? testimonialsCfg.items.filter(t => t?.text) : []
  const testimonialsTitle = testimonialsCfg.title || 'What customers say'

  const contactCfg = builder.contact || {}
  const address = contactCfg.address || ''
  const instagram = contactCfg.instagram || ''

  const social = settings?.social || {}

  const cleanWhatsapp = (whatsapp || '').replace(/\D/g, '')
  const waLink = (msg) => `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`
  const genericOrderMsg = `Hi ${brandName}! I'd like to place an order.`

  const showAbout = isSectionActive(settings, 3) && aboutText
  const showProducts = isSectionActive(settings, 2) && products.length > 0
  const showGallery = isSectionActive(settings, 4) && galleryImages.length > 0
  const showTestimonials = isSectionActive(settings, 5) && testimonialItems.length > 0
  const showContact = isSectionActive(settings, 6) && !!whatsapp

  const resolvedProducts = useMemo(() =>
    products.map(p => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl || '') })),
    [products]
  )

  // ── Derived ───────────────────────────────────────────────────────────────
  const announcements = useMemo(() => [
    tagline || `Welcome to ${brandName}`,
    'Verified business · Order directly, no middleman',
    whatsapp ? 'Chat with us anytime on WhatsApp' : 'New arrivals, every week',
  ], [tagline, brandName, whatsapp])

  useEffect(() => {
    const t = setInterval(() => setAnnounceIdx(i => (i + 1) % announcements.length), 4500)
    return () => clearInterval(t)
  }, [announcements.length])

  const categoryTags = useMemo(() => {
    const real = Array.from(new Set(resolvedProducts.map(p => p.category).filter(Boolean)))
    const labels = real.length >= 3 ? real.slice(0, 5) : ['New', 'Bestsellers', 'Popular', 'Gifts', 'All'].slice(0, 5)
    return labels.map((label, i) => {
      const match = resolvedProducts.find(p => p.category === label)
      const fallback = resolvedProducts[i % (resolvedProducts.length || 1)]
      return { label, img: (match || fallback)?.imageUrl || '' }
    })
  }, [resolvedProducts])

  const allCategories = useMemo(() =>
    [...new Set(resolvedProducts.map(p => p.category).filter(Boolean))],
    [resolvedProducts]
  )

  const shopProducts = useMemo(() => {
    let list = [...resolvedProducts]
    if (shopCategory !== 'all') list = list.filter(p => p.category === shopCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [resolvedProducts, shopCategory, searchQuery])

  const testiPerPage = isMobile ? 1 : 2
  const testiPages = Math.max(1, Math.ceil(testimonialItems.length / testiPerPage))
  const visibleTesti = testimonialItems.slice(testiIdx * testiPerPage, testiIdx * testiPerPage + testiPerPage)

  // ── Helpers ───────────────────────────────────────────────────────────────
  function openProduct(product) {
    setSelectedProduct(product)
    setSelectedAttrs({})
    fetch(`${API_BASE}/products/${product.id}/view`, { method: 'POST' }).catch(() => {})
  }

  function goShop(category) {
    setShopCategory(category || 'all')
    navigateShop()
    setNavOpen(false)
  }

  // If a tenant names a custom CMS page "Home"/"Shop"/"About"/"Contact", that's
  // a deliberate choice to replace the built-in homepage-section link with a
  // full page — not a collision to hide. Without this, two nav buttons would
  // share the same label; since nav buttons are keyed by label, React would
  // misattribute the DOM node between them and navigation would break after
  // visiting the custom page. Resolve it by letting the custom page win.
  const pageByLabel = new Map(pages.map(p => [(p.title || '').trim().toLowerCase(), p]))
  const openCustomPage = (p) => { navigateToPage(p); setNavOpen(false) }

  const builtInLinks = [
    { label: 'Home', action: () => scrollToSection('hero') },
    { label: 'Shop', action: () => goShop('all'), isShop: true },
    { label: 'About', action: () => scrollToSection('about') },
    { label: 'Contact', action: () => scrollToSection('contact') },
  ].map(link => {
    const override = pageByLabel.get(link.label.toLowerCase())
    return override ? { label: link.label, action: () => openCustomPage(override), page: override } : link
  })

  const RESERVED_NAV_LABELS = new Set(['home', 'shop', 'about', 'contact'])

  const derivedNavLinks = [
    ...builtInLinks,
    ...pages
      .filter(p => !RESERVED_NAV_LABELS.has((p.title || '').trim().toLowerCase()))
      .map(p => ({ label: p.title, action: () => openCustomPage(p), page: p })),
  ]

  // ── Data-driven navigation ─────────────────────────────────────────────
  // settings.navigation is an optional, ordered array authored by the nav
  // editor UI (a later task). Each item: { label, target: { type, ref? } }.
  // When present and non-empty (after dropping malformed/dangling entries)
  // it fully replaces the derived nav above; otherwise we fall back to the
  // legacy built-in + CMS-page derivation unchanged.
  const NAV_SECTION_REFS = new Set(['about', 'contact', 'products', 'gallery', 'testimonials'])

  const buildDataNavLink = (item) => {
    if (!item || typeof item.label !== 'string' || !item.label.trim()) return null
    const target = item.target || {}
    switch (target.type) {
      case 'home':
        return { label: item.label, action: () => scrollToSection('hero') }
      case 'shop':
        return { label: item.label, action: () => goShop('all'), isShop: true }
      case 'section':
        return NAV_SECTION_REFS.has(target.ref)
          ? { label: item.label, action: () => scrollToSection(target.ref) }
          : null
      case 'page': {
        const match = pages.find(p => p.slug === target.ref)
        return match ? { label: item.label, action: () => openCustomPage(match), page: match } : null
      }
      case 'external':
        return target.ref ? { label: item.label, action: () => window.open(target.ref, '_blank', 'noopener') } : null
      default:
        return null
    }
  }

  const dataNavLinks = Array.isArray(settings?.navigation)
    ? settings.navigation.map(buildDataNavLink).filter(Boolean)
    : []

  const navLinks = dataNavLinks.length > 0 ? dataNavLinks : derivedNavLinks

  // Everything a section component might need, built once. Keeps section
  // files to a two-prop signature (`variant`, `ctx`) instead of threading
  // 15+ individual props through each.
  const ctx = {
    INK, GOLD, CREAM, DISPLAY, radius, PASTELS, isMobile,
    brandName, tagline, logoUrl,
    heroHeadline, heroSubtitle, heroCta, heroBg, heroBg2, heroLayout, heroBgImage,
    aboutText, aboutTitle, aboutImage, productsTitle, productCount, products: resolvedProducts, categoryTags, showProducts,
    galleryImages, galleryTitle,
    testiIdx, setTestiIdx, testiPages, visibleTesti, testimonialItems, testimonialsTitle,
    address, instagram, social,
    whatsapp, waLink, genericOrderMsg,
    sectionId, goShop, openProduct,
  }

  // Resolve homepage section order + gating in one map, so the render below
  // is just "walk the order, skip what's hidden." Component/styleKey come
  // from the section registry (single source of truth); `show` gates are
  // runtime data checks that stay here since they depend on ctx-level state.
  const SHOW_BY_LEGACY_ID = {
    2: true,
    4: showGallery,
    3: showAbout,
    5: showTestimonials,
    6: showContact,
  }
  const SECTION_RENDERERS = Object.fromEntries(
    DEFAULT_REORDERABLE_ORDER.map(legacyId => {
      const { Renderer, type } = sectionByLegacyId[legacyId]
      return [legacyId, { Component: Renderer, show: SHOW_BY_LEGACY_ID[legacyId], styleKey: type }]
    })
  )
  const savedOrder = (settings?.sections || []).map(s => s.id).filter(id => SECTION_RENDERERS[id])
  const missingIds = REORDERABLE_DEFAULT_ORDER.filter(id => !savedOrder.includes(id))
  const sectionOrder = [...savedOrder, ...missingIds]

  // Optional per-section background (solid or two-colour gradient) from the
  // section editors. Empty = no wrapper style, sections render as always.
  const sectionBgStyle = (styleKey) => {
    const cfg = builder[styleKey] || {}
    if (!cfg.bg) return undefined
    return {
      background: cfg.bg2
        ? `linear-gradient(135deg, ${cfg.bg} 0%, ${cfg.bg2} 100%)`
        : cfg.bg,
    }
  }

  // Handle Google login success - redirect to customer account
  useEffect(() => {
    if (customer && token) {
      // Customer is now authenticated via Google
      console.log('Customer authenticated successfully:', customer.name)
      // If checkout form wasn't pre-filled, user can proceed with checkout
      if (!checkoutForm.name && checkoutForm.phone && checkoutForm.address) {
        setCheckoutForm(f => ({
          ...f,
          name: customer.name || f.name,
          phone: customer.phone || f.phone,
          email: customer.email || f.email,
        }))
      }
    }
  }, [customer, token, checkoutForm.name, checkoutForm.phone, checkoutForm.address])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white relative" style={{ fontFamily: BODY, '--sf-radius': `${radius}px` }}>

      {/* ── Auth Modal for customer login/signup before checkout ── */}
      {showAuthModal && (
        <AuthModal
          tenantId={tenantIdProp || business?.tenantId || ''}
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
            setCheckoutStep(1)
            setCheckoutOpen(true)
            if (customer) {
              setCheckoutForm(f => ({
                ...f,
                name: customer.name || f.name,
                phone: customer.phone || f.phone || '',
                email: customer.email || f.email || '',
              }))
            }
          }}
        />
      )}

      {/* ── Product Detail Modal ── */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedProduct(null) }}
        >
          <div
            className="bg-white w-full sm:max-w-2xl overflow-y-auto"
            style={{ maxHeight: '92vh', borderRadius: isMobile ? 'var(--sf-radius) var(--sf-radius) 0 0' : 'var(--sf-radius)' }}
          >
            {/* Image */}
            <div className="relative" style={{ background: PASTELS[0] }}>
              {selectedProduct.imageUrl
                ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full object-cover" style={{ maxHeight: 440, minHeight: 280 }} />
                : <div className="flex items-center justify-center text-5xl opacity-20" style={{ minHeight: 220 }}>📦</div>}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition"
              >
                <X size={16} style={{ color: INK }} />
              </button>
              {isSoldOut(selectedProduct) && (
                <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Sold Out
                </div>
              )}
            </div>

            {/* Details */}
            <div className={isMobile ? 'px-5 py-5' : 'px-8 py-6'}>
              <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: GOLD }}>
                {selectedProduct.category || 'Product'}
              </div>
              <h2 className="leading-tight mb-2" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 22 : 28, color: INK }}>
                {selectedProduct.name}
              </h2>

              {selectedProduct.review && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={GOLD} style={{ color: GOLD }} strokeWidth={1} />)}
                  </div>
                  <span className="text-xs text-gray-400">Verified purchase</span>
                </div>
              )}

              <div className="text-2xl font-bold mb-5" style={{ color: INK }}>
                ₦ {((selectedProduct.priceMinor || 0) / 100).toLocaleString()}
              </div>

              {/* Attributes */}
              {Object.entries(selectedProduct.attributes || {}).filter(([, v]) => v !== null && v !== undefined).length > 0 && (
                <div className="space-y-4 mb-5 pb-5 border-b border-gray-100">
                  {Object.entries(selectedProduct.attributes || {}).filter(([, v]) => v !== null && v !== undefined).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                        {key}{selectedAttrs[key] ? `: ${selectedAttrs[key]}` : ''}
                      </div>
                      {Array.isArray(value) ? (
                        <div className="flex gap-2 flex-wrap">
                          {value.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setSelectedAttrs(a => ({ ...a, [key]: a[key] === String(opt) ? '' : String(opt) }))}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition"
                              style={selectedAttrs[key] === String(opt)
                                ? { background: INK, color: '#fff', borderColor: INK }
                                : { borderColor: '#e5e7eb', color: '#374151' }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{String(value)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedProduct.description && (
                <div className="mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}

              {selectedProduct.review && (
                <div className="mb-6 rounded-xl p-4" style={{ background: CREAM }}>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill={GOLD} style={{ color: GOLD }} strokeWidth={1} />)}
                  </div>
                  <p className="text-sm text-gray-600 italic leading-relaxed">"{selectedProduct.review}"</p>
                </div>
              )}

              {!isSoldOut(selectedProduct) ? (
                <button
                  onClick={() => { addToCart(selectedProduct, selectedAttrs); setSelectedProduct(null) }}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: INK }}
                >
                  <Plus size={17} /> Add to Cart
                </button>
              ) : (
                <button disabled className="w-full py-4 rounded-full text-sm font-bold text-gray-400 border border-gray-200 cursor-not-allowed">
                  Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Announcement bar ── */}
      <div className={`flex items-center justify-between text-white ${isMobile ? 'px-3 py-2' : 'px-5 py-2'}`} style={{ background: INK }}>
        <button onClick={() => setAnnounceIdx(i => (i - 1 + announcements.length) % announcements.length)} aria-label="Previous" className="text-white/60 hover:text-white transition flex-shrink-0">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-medium tracking-wide text-center truncate px-2">{announcements[announceIdx]}</span>
        <button onClick={() => setAnnounceIdx(i => (i + 1) % announcements.length)} aria-label="Next" className="text-white/60 hover:text-white transition flex-shrink-0">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Nav ── */}
      {/* Sticky: without this, clicking About/Contact scrolls the nav itself
          out of view (it sits above the target section in document flow),
          leaving no way to click back to another section. */}
      <div className={`sticky top-0 z-30 bg-white flex items-center justify-between border-b border-gray-100 ${isMobile ? 'px-4 py-3' : 'px-8 py-4'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl && <img src={logoUrl} alt="logo" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />}
          <div className="truncate" style={{ fontFamily: DISPLAY, fontWeight: 700, fontStyle: 'italic', color: INK, fontSize: isMobile ? 18 : 22 }}>
            {brandName}
          </div>
        </div>

        {isMobile ? (
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={() => goShop('all')} aria-label="Search"><Search size={17} className="text-gray-500" /></button>
              <button onClick={() => setCartOpen(true)} className="relative p-1">
                <ShoppingBag size={17} className="text-gray-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ background: INK }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              {token && customer ? (
                <Link to={accountPath} className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium rounded-lg transition hover:bg-gray-100" style={{ color: INK }} onClick={() => setNavOpen(false)}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: INK }}>
                    {customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                </Link>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium rounded-lg transition hover:bg-gray-100" style={{ color: INK }}>
                  <User size={16} /> Sign In
                </button>
              )}
              <button onClick={() => setNavOpen(v => !v)} aria-label="Menu" className="p-1 text-gray-600">
                {navOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
        ) : (
          <>
            <div className="flex gap-7 text-xs font-semibold tracking-wide flex-shrink-0">
              {navLinks.map((l, i) => (
                <button
                  key={`${l.label}-${i}`}
                  onClick={l.action}
                  className="transition pb-0.5"
                  style={(view === 'shop' && (l.isShop || l.label === 'Shop')) || (view === 'page' && !!l.page && l.page === activePage)
                    ? { color: INK, borderBottom: `2px solid ${INK}` }
                    : { color: '#6b7280' }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 w-44">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  className="bg-transparent outline-none w-full text-xs text-gray-700 placeholder:text-gray-400"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (e.target.value) navigateShop() }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={11} /></button>
                )}
              </div>
              {token && customer ? (
                <div
                  className="relative"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setUserMenuOpen(false)
                    }
                  }}
                >
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: INK }}>
                      {customer.name ? customer.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <ChevronDown size={12} className="text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5">
                      <div className="px-3 py-2 border-b border-gray-50">
                        <div className="text-sm font-semibold text-gray-900 truncate">{customer.name || 'Customer'}</div>
                        <div className="text-xs text-gray-400 truncate">{customer.phone || customer.email || ''}</div>
                      </div>
                      <Link
                        to={accountPath}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Package size={14} /> My Orders
                      </Link>
                      <Link
                        to={accountPath}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Clock size={14} /> Cart History
                      </Link>
                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false) }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition w-full text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium rounded-lg hover:bg-gray-100 transition" style={{ color: INK }}>
                  <User size={16} /> Sign In
                </button>
              )}
              <button onClick={() => setCartOpen(true)} className="relative">
                <ShoppingBag size={17} className="text-gray-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white rounded-full w-3.5 h-3.5 flex items-center justify-center" style={{ background: INK }}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {isMobile && navOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-sm z-10 flex flex-col py-2">
            {navLinks.map((l, i) => (
              <button key={`${l.label}-${i}`} onClick={l.action} className="px-4 py-3 text-sm text-gray-700 text-left w-full hover:bg-gray-50">{l.label}</button>
            ))}
            <div className="px-4 py-2 border-t border-gray-50">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-2">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  className="bg-transparent outline-none w-full text-xs text-gray-700 placeholder:text-gray-400"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (e.target.value) { navigateShop(); setNavOpen(false) } }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Currency tab ── */}
      <div
        className="absolute z-20 text-white text-[10px] font-bold tracking-widest px-1.5 py-2 rounded-l-md"
        style={{ background: INK, top: isMobile ? 92 : 112, right: 0, writingMode: 'vertical-rl' }}
        title="Prices shown in Nigerian Naira"
      >
        NGN
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* CUSTOM PAGE VIEW                           */}
      {/* ══════════════════════════════════════════ */}
      {view === 'page' && activePage && (
        <div>
          <div className={isMobile ? 'px-5 pt-6' : 'px-8 pt-8'}>
            <button
              onClick={() => navigateHome()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
            >
              <ArrowLeft size={15} /> Back to Home
            </button>

            <div className="mb-4" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 26 : 34, color: INK }}>
              {activePage.title}
            </div>
          </div>

          <div className={isMobile ? 'space-y-4 pb-6' : 'space-y-4 pb-8'}>
            {activePage.content?.blocks?.length ? (
              activePage.content.blocks.map((b, i) => {
                // Section blocks are full-bleed and render the same live
                // storefront section as the homepage, unconstrained by the
                // max-w-2xl column and side padding the text/image blocks
                // sit in. Two instances of the same section type on one
                // page would duplicate the ctx.sectionId(key) DOM id, but
                // that only matters for homepage scroll anchors, so it's
                // left as-is (acceptable edge case, not handled here).
                if (b.type === 'section') {
                  const entry = sectionByType[b.sectionType]
                  if (!entry) return null
                  const { Renderer } = entry
                  return (
                    <div key={i} style={sectionBgStyle(b.sectionType)}>
                      <Renderer variant={b.variant || 'boutique'} ctx={ctx} />
                    </div>
                  )
                }
                const wrapClass = isMobile ? 'px-5 max-w-2xl' : 'px-8 max-w-2xl'
                if (b.type === 'heading') {
                  return (
                    <div key={i} className={wrapClass} style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 18 : 22, color: INK }}>
                      {b.text}
                    </div>
                  )
                }
                if (b.type === 'image' && b.url) {
                  return (
                    <div key={i} className={wrapClass}>
                      <img src={resolveImageUrl(b.url)} alt="" className="w-full rounded-[var(--sf-radius)] object-cover" style={{ maxHeight: 360 }} />
                    </div>
                  )
                }
                if (b.type === 'qa') {
                  return (
                    <details key={i} className={`${wrapClass} group`}>
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 border border-gray-100 rounded-[var(--sf-radius)] px-4 py-3 text-sm font-semibold" style={{ color: INK }}>
                        {b.question}
                        <span className="text-gray-300 transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                      </summary>
                      <p className="text-sm leading-relaxed text-gray-600 px-4 pt-2 pb-1">{b.answer}</p>
                    </details>
                  )
                }
                return (
                  <p key={i} className={`${wrapClass} text-sm leading-relaxed text-gray-600`}>{b.text}</p>
                )
              })
            ) : (
              // Legacy pages saved before block-based content existed.
              <div className={`${isMobile ? 'px-5' : 'px-8'} max-w-2xl space-y-4`}>
                {activePage.content?.image && (
                  <img
                    src={resolveImageUrl(activePage.content.image)}
                    alt=""
                    className="w-full rounded-[var(--sf-radius)] object-cover"
                    style={{ maxHeight: 360 }}
                  />
                )}
                {(activePage.content?.body || '').split(/\n\s*\n/).filter(Boolean).map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-gray-600">{para}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* SHOP VIEW                                  */}
      {/* ══════════════════════════════════════════ */}
      {view === 'shop' && (
        <div className={isMobile ? 'px-5 py-6' : 'px-8 py-8'}>
          <button
            onClick={() => { navigateHome(); setSearchQuery(''); setShopCategory('all') }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
          >
            <ArrowLeft size={15} /> Back to Home
          </button>

          <div className="mb-6" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 26 : 34, color: INK }}>
            Shop
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
              placeholder="Search by name, category, description…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category tabs */}
          {allCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
              {[{ id: 'all', label: 'All' }, ...allCategories.map(c => ({ id: c, label: c }))].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setShopCategory(cat.id)}
                  className="flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition"
                  style={shopCategory === cat.id
                    ? { background: INK, color: '#fff', borderColor: INK }
                    : { background: 'white', color: '#6b7280', borderColor: '#e5e7eb' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="text-xs text-gray-400 mb-5">
            {shopProducts.length} product{shopProducts.length !== 1 ? 's' : ''}
            {shopCategory !== 'all' && ` in "${shopCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {shopProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3 opacity-20">🔍</div>
              <div className="text-sm font-semibold text-gray-600">No products found</div>
              <div className="text-xs text-gray-400 mt-1">Try a different search or category</div>
              <button
                onClick={() => { setSearchQuery(''); setShopCategory('all') }}
                className="mt-4 text-xs font-semibold underline underline-offset-2"
                style={{ color: INK }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-5 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 xl:grid-cols-4'}`}>
              {shopProducts.map((p, i) => (
                <ProductCard key={p.id || i} variant={sectionStyles.products || 'boutique'} ctx={ctx} p={p} i={i} compact={isMobile} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* HOME VIEW                                  */}
      {/* ══════════════════════════════════════════ */}
      {view === 'home' && (
        <>
          <HeroSection variant={sectionStyles.hero || 'boutique'} ctx={ctx} />

          {/* Trust strip — shared chrome, not variant-able */}
          <div className={`flex items-center justify-center gap-1.5 text-gray-500 text-[11px] font-medium border-b border-gray-100 ${isMobile ? 'py-2 px-3' : 'py-2.5 px-4'}`}>
            <ShieldCheck size={12} />
            <span>Verified business · Order directly, no middleman</span>
          </div>

          {sectionOrder.map(id => {
            const { Component, show, styleKey } = SECTION_RENDERERS[id]
            if (!show) return null
            return (
              <div key={id} style={sectionBgStyle(styleKey)}>
                <Component variant={sectionStyles[styleKey] || 'boutique'} ctx={ctx} />
              </div>
            )
          })}
        </>
      )}

      {/* ── Footer — shared chrome, not variant-able ── */}
      <div className={`border-t border-gray-100 ${isMobile ? 'px-5 py-6' : 'px-8 py-8'}`} style={{ background: 'white' }}>
        <div className={`flex ${isMobile ? 'flex-col gap-5' : 'items-start justify-between gap-6'}`}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: INK, fontSize: 18 }}>{brandName}</div>
            {tagline && <div className="text-xs text-gray-400 mt-1">{tagline}</div>}
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
            {navLinks.map((l, i) => (
              <button key={`${l.label}-${i}`} onClick={l.action} className="hover:text-gray-700 transition">{l.label}</button>
            ))}
          </div>

          {/* Social icons */}
          {Object.values(social).some(Boolean) && (
            <div className="flex items-center gap-3">
              {social.facebook && (
                <a href={socialHref('facebook', social.facebook)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition">
                  <Facebook size={15} />
                </a>
              )}
              {social.instagram && (
                <a href={socialHref('instagram', social.instagram)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition">
                  <Instagram size={15} />
                </a>
              )}
              {(social.twitter || social.x) && (
                <a href={socialHref('twitter', social.twitter || social.x)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition">
                  <Twitter size={15} />
                </a>
              )}
              {social.youtube && (
                <a href={socialHref('youtube', social.youtube)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition">
                  <Youtube size={15} />
                </a>
              )}
              {social.tiktok && (
                <a href={socialHref('tiktok', social.tiktok)} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-gray-700 transition">
                  {/* lucide has no TikTok glyph — inline the brand mark at icon size */}
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-50 text-[11px] text-gray-300 text-center">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </div>

      {/* ── Cart Sidebar ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={() => setCartOpen(false)}>
          <div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            style={{ borderLeft: `1px solid #e5e7eb` }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold" style={{ color: INK }}>Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3 opacity-20"><ShoppingBag size={40} className="mx-auto" /></div>
                  <div className="text-sm text-gray-400">Your cart is empty</div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="flex gap-3 pb-3 border-b border-gray-50">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-lg opacity-30 flex-shrink-0">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: INK }}>{item.product.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        ₦ {((item.product.priceMinor || 0) / 100).toLocaleString()}
                        {Object.values(item.attrs).filter(Boolean).length > 0 && (
                          <span> — {Object.entries(item.attrs).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQty(item.key, -1)}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-50 transition"
                          style={{ color: INK }}
                        >−</button>
                        <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.key, 1)}
                          className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold hover:bg-gray-50 transition"
                          style={{ color: INK }}
                        >+</button>
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="ml-auto text-gray-300 hover:text-red-400 transition p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold" style={{ color: INK }}>₦ {(cartTotal / 100).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false)
                    if (!token) {
                      setShowAuthModal(true)
                    } else {
                      setCheckoutStep(1)
                      setCheckoutOpen(true)
                      if (customer) {
                        setCheckoutForm(f => ({
                          ...f,
                          name: customer.name || f.name,
                          phone: customer.phone || f.phone || '',
                          email: customer.email || f.email || '',
                        }))
                      }
                    }
                  }}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: INK }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Multi-step Checkout Modal (mobile-friendly) ── */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { if (!placingOrder) setCheckoutOpen(false) }}>
          <div
            className="bg-white w-full sm:max-w-lg sm:mx-auto sm:max-h-[90vh] flex flex-col"
            style={{
              height: isMobile ? '100%' : 'auto',
              maxHeight: isMobile ? '100%' : '90vh',
              borderRadius: isMobile ? '0' : 'var(--sf-radius)',
              marginTop: isMobile ? '0' : '5vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with safe area spacing */}
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {checkoutStep > 1 && (
                  <button onClick={() => setCheckoutStep(s => s - 1)} className="p-2 -ml-1 text-gray-500 hover:text-gray-800 transition rounded-lg hover:bg-gray-100 active:bg-gray-200">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h2 className="text-lg font-bold" style={{ color: INK }}>
                  {checkoutStep === 1 ? 'Delivery Details' : checkoutStep === 2 ? 'Review & Pay' : 'Checkout'}
                </h2>
              </div>
              <button onClick={() => { if (!placingOrder) { setCheckoutOpen(false); setCheckoutStep(1) } }} className="p-2 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100 active:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            {/* Steps indicator — more prominent */}
            <div className="flex items-center gap-1.5 px-5 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: INK }}>
                  1
                </div>
                <span className="text-xs font-semibold text-gray-700">Delivery</span>
                <div className="flex-1 h-0.5 mx-1.5 rounded-full" style={{ background: checkoutStep >= 2 ? INK : '#e5e7eb' }} />
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  checkoutStep >= 2 ? 'text-white' : 'text-gray-400'
                }`} style={{ background: checkoutStep >= 2 ? INK : '#f3f4f6' }}>
                  2
                </div>
                <span className={`text-xs font-semibold ${checkoutStep >= 2 ? 'text-gray-700' : 'text-gray-400'}`}>Payment</span>
              </div>
            </div>

            {/* Scrollable form area — larger tap targets, more spacing */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
              {checkoutStep === 1 && (
                <>
                  {/* Delivery info banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
                    <div className="font-semibold text-sm mb-1">Delivery Schedule</div>
                    {businessDelivery.availableDays.length > 0 && (
                      <div className="flex justify-between"><span className="text-amber-600">Days:</span><span className="font-medium text-right">{businessDelivery.availableDays.join(', ')}</span></div>
                    )}
                    {businessDelivery.openingTime && businessDelivery.closingTime && (
                      <div className="flex justify-between mt-0.5"><span className="text-amber-600">Hours:</span><span className="font-medium">{businessDelivery.openingTime} — {businessDelivery.closingTime}</span></div>
                    )}
                    {businessDelivery.deliveryStructure && (
                      <div className="flex justify-between mt-0.5"><span className="text-amber-600">Service:</span><span className="font-medium">{businessDelivery.deliveryStructure}</span></div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <input
                        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                        placeholder="Full Name *"
                        value={checkoutForm.name}
                        onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))}
                      />
                      <input
                        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                        placeholder="Phone Number *"
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))}
                      />
                      <input
                        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                        placeholder="WhatsApp Number (optional)"
                        type="tel"
                        value={checkoutForm.whatsapp}
                        onChange={e => setCheckoutForm(f => ({ ...f, whatsapp: e.target.value }))}
                      />
                      <input
                        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                        placeholder="Email (for confirmation)"
                        type="email"
                        value={checkoutForm.email}
                        onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Delivery Address</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                          placeholder="State *"
                          value={checkoutForm.state}
                          onChange={e => setCheckoutForm(f => ({ ...f, state: e.target.value }))}
                        />
                        <input
                          className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                          placeholder="City *"
                          value={checkoutForm.city}
                          onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <textarea
                        className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white resize-none"
                        rows={2}
                        placeholder="Street, building, apartment *"
                        value={checkoutForm.address}
                        onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                          placeholder="Post Box / ZIP"
                          value={checkoutForm.postBox}
                          onChange={e => setCheckoutForm(f => ({ ...f, postBox: e.target.value }))}
                        />
                        <input
                          className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition bg-gray-50 focus:bg-white"
                          placeholder="Closest landmark"
                          value={checkoutForm.landmark}
                          onChange={e => setCheckoutForm(f => ({ ...f, landmark: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Method */}
                  {deliveryOptions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Delivery Method *</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {deliveryOptions.map(key => (
                          <button
                            key={key}
                            onClick={() => setSelectedDelivery(key)}
                            className={`px-4 py-3.5 text-sm font-semibold rounded-xl border-2 transition active:scale-[0.97] ${
                              selectedDelivery === key
                                ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                                : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {deliveryLabels[key] || key}
                            {feeFor(key) > 0 && (
                              <span className="block text-xs font-normal opacity-75 mt-0.5">+ ₦ {(feeFor(key) / 100).toLocaleString()}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 2 && (
                <>
                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Payment Method *</h3>
                    {computedPaymentOptions.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-5 text-center">
                        <div className="text-sm font-medium text-yellow-800">No payment methods configured yet</div>
                        <div className="text-xs text-yellow-600 mt-1">Please contact the store for payment options.</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {computedPaymentOptions.map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setSelectedPayment(opt.key)}
                            className={`px-4 py-3.5 text-sm font-semibold rounded-xl border-2 transition active:scale-[0.97] ${
                              selectedPayment === opt.key
                                ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                                : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bank transfer details — show account info before order */}
                  {selectedPayment === 'bank' && paymentConfig?.manual?.bankAccount && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <div>
                          <div className="font-bold text-green-800 text-sm">Bank Transfer Details</div>
                          <div className="text-xs text-green-600">Transfer the exact amount to this account</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 space-y-2.5 border border-green-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Amount to send</span>
                          <span className="text-lg font-bold" style={{ color: INK }}>₦ {(orderTotal / 100).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-gray-100" />
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Bank</span>
                          <span className="text-sm font-semibold text-gray-800">{paymentConfig.manual.bankAccount.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Account Name</span>
                          <span className="text-sm font-semibold text-gray-800">{paymentConfig.manual.bankAccount.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Account Number</span>
                          <span className="text-lg font-bold tracking-widest" style={{ color: INK }}>{paymentConfig.manual.bankAccount.accountNumber}</span>
                        </div>
                      </div>
                      <div className="text-xs text-green-700 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        After transferring, tap <strong>Place Order</strong> below to notify the store.
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl px-4 py-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Order Summary</h3>
                    <div className="space-y-2.5">
                      {cart.map(item => (
                        <div key={item.key} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate mr-3">{item.product.name} x{item.qty}</span>
                          <span className="font-semibold text-gray-800 flex-shrink-0">₦ {((item.product.priceMinor || 0) * item.qty / 100).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-semibold text-gray-800">₦ {(cartTotal / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery{selectedDelivery ? ` — ${deliveryLabels[selectedDelivery] || selectedDelivery}` : ''}</span>
                        {selectedDeliveryFee > 0 ? (
                          <span className="font-semibold text-gray-800">₦ {(selectedDeliveryFee / 100).toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-500">{selectedDelivery ? 'Free' : 'To be confirmed'}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-3 mt-3 border-t border-gray-200" style={{ color: INK }}>
                      <span>Total</span>
                      <span>₦ {(orderTotal / 100).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Delivery Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm space-y-2">
                    <div className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Package size={15} /> Delivering to
                    </div>
                    <div className="text-gray-600 leading-relaxed">
                      <div className="font-medium text-gray-800">{checkoutForm.name}</div>
                      <div>{checkoutForm.phone}{checkoutForm.whatsapp && checkoutForm.whatsapp !== checkoutForm.phone ? ` · WA: ${checkoutForm.whatsapp}` : ''}</div>
                      <div className="mt-1">{checkoutForm.address}</div>
                      <div>{checkoutForm.city}, {checkoutForm.state}{checkoutForm.postBox ? ` · ${checkoutForm.postBox}` : ''}</div>
                      {checkoutForm.landmark && <div className="mt-0.5 text-amber-700">📍 {checkoutForm.landmark}</div>}
                      {selectedDelivery && (
                        <div className="mt-2 pt-2 border-t border-gray-100 font-medium" style={{ color: INK }}>
                          {deliveryLabels[selectedDelivery] || selectedDelivery}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky action button with safe area */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white pb-6">
              {checkoutStep === 1 && (
                <button
                  onClick={() => {
                    if (!checkoutForm.name?.trim() || !checkoutForm.phone?.trim() || !checkoutForm.address?.trim() || !checkoutForm.state?.trim() || !checkoutForm.city?.trim()) {
                      toast.error('Please fill in: name, phone, state, city, and street address.')
                      return
                    }
                    setCheckoutStep(2)
                  }}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{ background: INK }}
                >
                  Continue to Payment
                </button>
              )}
              {checkoutStep === 2 && (
                <button
                  onClick={selectedPayment && !placingOrder ? placeOrder : null}
                  disabled={placingOrder || computedPaymentOptions.length === 0}
                  className="w-full py-4 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg"
                  style={{ background: INK }}
                >
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      Placing Order…
                    </span>
                  ) : !selectedPayment || computedPaymentOptions.length === 0 ? (
                    <span>Choose a payment method</span>
                  ) : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bank Transfer Info Modal ── */}
      {bankTransferInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: INK }}>Bank Transfer Details</h2>
              <button onClick={() => { setBankTransferInfo(null); setOrderPlaced(true); setTimeout(() => setOrderPlaced(false), 3000) }} className="p-1 text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-xl leading-relaxed">
                <div className="font-semibold mb-1">Order #{bankTransferInfo.orderRef}</div>
                Please transfer the <strong>exact amount</strong> to the account below. Your order will be processed once payment is confirmed.
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Amount to send</span>
                  <span className="text-lg font-bold" style={{ color: INK }}>₦ {(bankTransferInfo.total / 100).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-semibold text-gray-800">{bankTransferInfo.bankName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-semibold text-gray-800">{bankTransferInfo.accountName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Account Number</span>
                  <span className="text-xl font-bold tracking-widest select-all" style={{ color: INK }}>{bankTransferInfo.accountNumber}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                After making the transfer, the store will be notified and will confirm your payment. You will receive an update once your order is being processed.
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setBankTransferInfo(null)
                    setOrderPlaced(true)
                    setTimeout(() => setOrderPlaced(false), 4000)
                  }}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                  style={{ background: INK }}
                >
                  I've Completed the Transfer
                </button>
                <button
                  onClick={() => {
                    setBankTransferInfo(null)
                    setOrderPlaced(true)
                    setTimeout(() => setOrderPlaced(false), 3000)
                  }}
                  className="w-full py-3 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition active:scale-[0.98]"
                >
                  I'll transfer later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Success Toast ── */}
      {orderPlaced && !bankTransferInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3.5 rounded-full shadow-xl text-sm font-bold flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {paymentRedirect ? 'Opening payment page…' : 'Order placed successfully!'}
        </div>
      )}

      {/* ── Mobile floating cart FAB ── */}
      {isMobile && cartCount > 0 && (
        <div className="fixed bottom-24 right-4 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition"
            style={{ background: INK }}
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#ef4444' }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          </button>
        </div>
      )}

      {/* ── Sticky WhatsApp bubble (customer support, not ordering) ── */}
      {whatsapp && (
        <div className="sticky bottom-4 z-20 flex justify-end pr-3 sm:pr-5 pointer-events-none" style={{ height: 0 }}>
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="hidden sm:block bg-white rounded-xl shadow-lg border border-gray-100 px-3.5 py-2.5 max-w-[180px]">
              <div className="text-xs font-semibold text-gray-900">Need help?</div>
              <div className="text-[11px] text-gray-500">Chat with our team</div>
            </div>
            <a
              href={waLink(genericOrderMsg)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition"
              style={{ background: '#25D366' }}
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}