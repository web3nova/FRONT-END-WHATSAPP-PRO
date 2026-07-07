import {
  Menu, X, Star, ShieldCheck, MessageCircle, AtSign, MapPin, ArrowRight,
  Search, User, ShoppingBag, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────
// Pulled from the reference screenshots: near-black wordmark + UI, a warm
// cream secondary background, and a rotating set of soft pastels for the
// category orbs / product cards.
const INK = '#14110F'
const CREAM = '#FBF3E1'
const GOLD = '#E8A93D'
const PASTELS = ['#FBEAE6', '#E7F1EF', '#FCF2DA', '#EFEAF6', '#E9F0FB']
const DISPLAY = "'Playfair Display', ui-serif, Georgia, serif"
const BODY = "'Inter', ui-sans-serif, system-ui, sans-serif"

// Which sections are on by default if the business hasn't saved a preference yet.
const DEFAULT_ACTIVE = { 1: true, 2: true, 3: true, 4: false, 5: true, 6: true }

function isSectionActive(settings, id) {
  const found = settings?.sections?.find(s => s.id === id)
  return found ? !!found.active : (DEFAULT_ACTIVE[id] ?? true)
}

function Stars({ value = 5, size = 12, color = INK }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < value ? color : 'none'} style={{ color }} strokeWidth={1.5} />
      ))}
    </div>
  )
}

// Tiny multi-colored "G" mark standing in for the Google review badge.
function GoogleMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.5 30.4 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.8 6.1C12.3 13.1 17.6 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z"/>
      <path fill="#FBBC05" d="M10.3 19.3c-.5 1.4-.7 3-.7 4.7s.3 3.3.7 4.7l-7.8 6.1C.9 31.6 0 27.9 0 24s.9-7.6 2.5-10.8z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.2-8.6 2.2-6.4 0-11.7-3.6-13.7-8.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  )
}

export default function StorefrontPreview({ business, products, whatsapp, domain, device = 'desktop', settings }) {
  // Load the display serif once per session (Playfair Display, incl. italics).
  useEffect(() => {
    if (document.getElementById('sf-display-font')) return
    const link = document.createElement('link')
    link.id = 'sf-display-font'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600;1,700&display=swap'
    document.head.appendChild(link)
  }, [])

  const [navOpen, setNavOpen] = useState(false)
  const [announceIdx, setAnnounceIdx] = useState(0)
  const [testiIdx, setTestiIdx] = useState(0)
  const isMobile = device === 'mobile'

  const instanceId = useRef(`sf-${Math.random().toString(36).slice(2, 9)}`).current
  const sectionId = (key) => `${instanceId}-${key}`
  const scrollToSection = (key) => {
    setNavOpen(false)
    document.getElementById(sectionId(key))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const brandName = business?.displayName || 'Your Brand'
  const tagline = business?.tagline || ''
  const logoUrl = business?.logoUrl || ''

  const builder = settings?.theme?.builder || {}
  const hero = builder.hero || {}
  const heroHeadline = hero.headline || brandName
  const heroSubtitle = hero.subtitle || tagline
  const heroCta = hero.cta || 'Order Now'
  const heroBg = hero.bg || INK
  const heroLayout = hero.layout || 'center'
  const heroBgImage = hero.bgImage || ''

  const aboutText = builder.about?.text || business?.description || ''

  const productsCfg = builder.products || {}
  const productCount = productsCfg.count || 8
  const productsTitle = productsCfg.title || 'Best Sellers'

  const galleryCfg = builder.gallery || {}
  const galleryImages = Array.isArray(galleryCfg.images) ? galleryCfg.images.filter(Boolean) : []
  const galleryTitle = galleryCfg.title || 'Gallery'

  const testimonialsCfg = builder.testimonials || {}
  const testimonialItems = Array.isArray(testimonialsCfg.items) ? testimonialsCfg.items.filter(t => t?.text) : []
  const testimonialsTitle = testimonialsCfg.title || 'Happy Clients Say'

  const contactCfg = builder.contact || {}
  const address = contactCfg.address || ''
  const instagram = contactCfg.instagram || ''

  const cleanWhatsapp = (whatsapp || '').replace(/\D/g, '')
  const waLink = (msg) => `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`
  const genericOrderMsg = `Hi ${brandName}! I'd like to place an order.`

  const showAbout = isSectionActive(settings, 3) && aboutText
  const showProducts = isSectionActive(settings, 2) && products.length > 0
  const showGallery = isSectionActive(settings, 4) && galleryImages.length > 0
  const showTestimonials = isSectionActive(settings, 5) && testimonialItems.length > 0
  const showContact = isSectionActive(settings, 6) && !!whatsapp

  const navLinks = [
    { label: 'Home', target: 'hero' },
    { label: 'Shop', target: showProducts ? 'products' : 'hero' },
    { label: 'About', target: showAbout ? 'about' : 'hero' },
    { label: 'Contact', target: showContact ? 'contact' : 'hero' },
  ]

  // Rotating top strip, like the "Buy 300k and get 20% off" bar in the reference.
  const announcements = useMemo(() => [
    tagline || `Welcome to ${brandName}`,
    'Verified business · Order directly, no middleman',
    whatsapp ? 'Chat with us anytime on WhatsApp' : 'New arrivals, every week',
  ], [tagline, brandName, whatsapp])

  useEffect(() => {
    const t = setInterval(() => setAnnounceIdx(i => (i + 1) % announcements.length), 4500)
    return () => clearInterval(t)
  }, [announcements.length])

  // "Shop by Category" — derive real categories from the product list when
  // available, otherwise fall back to generic labels so the section still
  // looks populated during the design phase.
  const categoryTags = useMemo(() => {
    const real = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    const labels = real.length >= 3 ? real.slice(0, 5) : ['New', 'Bestsellers', 'Popular', 'Gifts', 'All'].slice(0, 5)
    return labels.map((label, i) => {
      const match = products.find(p => p.category === label)
      const fallback = products[i % (products.length || 1)]
      const img = (match || fallback)?.imageUrl || ''
      return { label, img }
    })
  }, [products])

  const testiPerPage = isMobile ? 1 : 2
  const testiPages = Math.max(1, Math.ceil(testimonialItems.length / testiPerPage))
  const visibleTesti = testimonialItems.slice(testiIdx * testiPerPage, testiIdx * testiPerPage + testiPerPage)

  return (
    <div className="bg-white relative" style={{ fontFamily: BODY }}>

      {/* Announcement bar */}
      <div className={`flex items-center justify-between text-white ${isMobile ? 'px-3 py-2' : 'px-5 py-2'}`} style={{ background: INK }}>
        <button
          onClick={() => setAnnounceIdx(i => (i - 1 + announcements.length) % announcements.length)}
          aria-label="Previous announcement"
          className="text-white/60 hover:text-white transition flex-shrink-0"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-medium tracking-wide text-center truncate px-2">{announcements[announceIdx]}</span>
        <button
          onClick={() => setAnnounceIdx(i => (i + 1) % announcements.length)}
          aria-label="Next announcement"
          className="text-white/60 hover:text-white transition flex-shrink-0"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Nav */}
      <div className={`flex items-center justify-between border-b border-gray-100 relative ${isMobile ? 'px-4 py-3' : 'px-8 py-4'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {logoUrl
            ? <img src={logoUrl} alt="logo" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            : null}
          <div
            className="truncate"
            style={{ fontFamily: DISPLAY, fontWeight: 700, fontStyle: 'italic', color: INK, fontSize: isMobile ? 18 : 22 }}
          >
            {brandName}
          </div>
        </div>

        {isMobile ? (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Search size={17} className="text-gray-500" />
            <button onClick={() => setNavOpen(v => !v)} aria-label="Toggle menu" className="p-1 text-gray-600">
              {navOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-7 text-xs font-semibold text-gray-600 tracking-wide flex-shrink-0">
              {navLinks.map(l => (
                <button key={l.label} onClick={() => scrollToSection(l.target)} className="hover:text-black transition flex items-center gap-1">
                  {l.label}
                </button>
              ))}
              <span className="flex items-center gap-1 text-gray-300 select-none">
                Shop <ChevronDown size={12} />
              </span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-400 w-40">
                <Search size={13} />
                <span>Search products</span>
              </div>
              <User size={17} className="text-gray-500" />
              <div className="relative">
                <ShoppingBag size={17} className="text-gray-500" />
                <span
                  className="absolute -top-1.5 -right-1.5 text-[9px] font-bold text-white rounded-full w-3.5 h-3.5 flex items-center justify-center"
                  style={{ background: INK }}
                >
                  {products.length > 9 ? '9+' : products.length}
                </span>
              </div>
            </div>
          </>
        )}

        {isMobile && navOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-sm z-10 flex flex-col py-2">
            {navLinks.map(l => (
              <button key={l.label} onClick={() => scrollToSection(l.target)} className="px-4 py-2.5 text-sm text-gray-600 text-left w-full">{l.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Currency tab, pinned to the right edge like the reference */}
      <div
        className="absolute z-20 text-white text-[10px] font-bold tracking-widest px-1.5 py-2 rounded-l-md"
        style={{ background: INK, top: isMobile ? 92 : 112, right: 0, writingMode: 'vertical-rl' }}
      >
        NGN
      </div>

      {/* Hero */}
      <div
        id={sectionId('hero')}
        className={`relative overflow-hidden ${isMobile ? 'px-5 py-12' : 'px-8 py-20'}`}
        style={heroBgImage ? {
          background: `linear-gradient(180deg, rgba(15,23,42,0.35), rgba(15,23,42,0.6)), url(${heroBgImage}) center/cover no-repeat`,
          textAlign: heroLayout === 'left' ? 'left' : 'center',
        } : {
          background: `linear-gradient(135deg, ${heroBg} 0%, ${heroBg}cc 100%)`,
          textAlign: heroLayout === 'left' ? 'left' : 'center',
        }}
      >
        {/* Ghost watermark text, echoing the ghosted product-name overlay in the reference hero */}
        {heroBgImage && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            style={{
              fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.14)',
              fontSize: isMobile ? 36 : 72, letterSpacing: 2, whiteSpace: 'nowrap',
            }}
          >
            {(heroSubtitle || heroHeadline).toUpperCase()}
          </div>
        )}

        <div className={`relative ${heroLayout === 'left' ? '' : 'max-w-xl mx-auto'}`}>
          {heroSubtitle && (
            <div
              className="mb-3 text-white/85"
              style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: isMobile ? 14 : 16 }}
            >
              {heroSubtitle}
            </div>
          )}
          <div
            className="text-white mb-5 leading-tight"
            style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 30 : 48 }}
          >
            {heroHeadline}
          </div>
          {aboutText && (
            <div className={`text-sm text-white/70 mb-7 ${heroLayout === 'left' ? 'max-w-md mx-0' : 'max-w-md mx-auto'}`}>
              {aboutText.slice(0, isMobile ? 90 : 140)}{aboutText.length > (isMobile ? 90 : 140) ? '…' : ''}
            </div>
          )}
          <div className={`flex gap-3 ${heroLayout === 'left' ? '' : 'justify-center'} flex-wrap`}>
            {whatsapp ? (
              <a href={waLink(genericOrderMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full" style={{ background: '#fff', color: INK }}>
                {heroCta} <ArrowRight size={15} />
              </a>
            ) : (
              <button className="text-sm font-semibold px-6 py-3 rounded-full" style={{ background: '#fff', color: INK }}>{heroCta}</button>
            )}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className={`flex items-center justify-center gap-1.5 text-gray-500 text-[11px] font-medium border-b border-gray-100 ${isMobile ? 'py-2 px-3' : 'py-2.5 px-4'}`}>
        <ShieldCheck size={12} />
        <span>Verified business · Order directly, no middleman</span>
      </div>

      {/* Shop by Category */}
      <div className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
        <div className="flex items-end justify-between mb-6">
          <div style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
            <span style={{ fontStyle: 'italic' }}>Shop by</span> <span className="font-bold">Category</span>
          </div>
          <button className="text-xs font-medium text-gray-500 underline underline-offset-2 flex-shrink-0">View All</button>
        </div>
        <div className={`flex gap-4 sm:gap-6 ${isMobile ? 'overflow-x-auto pb-1 -mx-5 px-5' : 'justify-center flex-wrap'}`}>
          {categoryTags.map((c, i) => (
            <div key={c.label} className="flex flex-col items-center gap-2.5 flex-shrink-0" style={{ width: isMobile ? 84 : 108 }}>
              <div
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{ width: isMobile ? 84 : 108, height: isMobile ? 84 : 108, background: PASTELS[i % PASTELS.length] }}
              >
                {c.img
                  ? <img src={c.img} alt={c.label} className="w-3/4 h-3/4 object-contain" />
                  : <div className="text-lg font-bold opacity-20" style={{ fontFamily: DISPLAY }}>{c.label.slice(0, 1)}</div>}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers / Products */}
      {showProducts && (
        <div id={sectionId('products')} className={`${isMobile ? 'px-5 py-8' : 'px-8 py-12'}`} style={{ background: CREAM }}>
          <div className="flex items-end justify-between mb-6">
            <div style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
              <span className="font-bold" style={{ fontStyle: 'italic' }}>{productsTitle}</span>{' '}
              <span style={{ fontStyle: 'italic' }} className="text-gray-500">Around The World</span>
            </div>
            <button className="text-xs font-medium text-gray-500 underline underline-offset-2 flex-shrink-0">View All</button>
          </div>
          <div className={`grid gap-4 sm:gap-5 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {products.slice(0, productCount).map((p, i) => (
              <div key={p.id || p._id || p.sku || i} className="group">
                <div
                  className="rounded-2xl overflow-hidden flex items-center justify-center mb-3"
                  style={{ background: PASTELS[i % PASTELS.length], aspectRatio: '1 / 1' }}
                >
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition" />
                    : <div className="text-3xl opacity-30">📦</div>}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD }}>
                  {p.category || 'Featured'}
                </div>
                <div
                  className="text-sm mb-1.5 leading-snug"
                  style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: INK }}
                >
                  {p.name}
                </div>
                <div className="text-xs font-semibold text-gray-700">
                  ₦ {((p.priceMinor || 0) / 100).toLocaleString()}
                </div>
                {whatsapp && (
                  <a
                    href={waLink(`Hi ${brandName}! I'd like to order: ${p.name} (₦${((p.priceMinor || 0) / 100).toLocaleString()})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-center text-[11px] font-semibold py-1.5 rounded-full border transition"
                    style={{ borderColor: INK, color: INK }}
                  >
                    Order
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {showGallery && (
        <div className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
          <div className="mb-5" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 18 : 24 }}>{galleryTitle}</div>
          <div className={`grid gap-2 sm:gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {galleryImages.slice(0, isMobile ? 6 : 8).map((src, i) => (
              <div key={i} className="rounded-2xl overflow-hidden aspect-square" style={{ background: PASTELS[i % PASTELS.length] }}>
                <img src={src} alt={`${brandName} gallery ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      {showAbout && (
        <div id={sectionId('about')} className={`${isMobile ? 'px-5 py-8' : 'px-8 py-14'} grid gap-8 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ background: CREAM }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">About</div>
            <div className="mb-3" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 22 : 30, color: INK }}>
              {brandName}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{aboutText}</p>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-video flex items-center justify-center bg-white">
            {logoUrl
              ? <img src={logoUrl} alt={brandName} className="w-full h-full object-cover" />
              : <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700 }} className="text-4xl opacity-20">{brandName.slice(0, 2).toUpperCase()}</div>
            }
          </div>
        </div>
      )}

      {/* Testimonials — two-up carousel with a Google-review look */}
      {showTestimonials && (
        <div className={isMobile ? 'px-5 py-10' : 'px-8 py-14'}>
          <div className="mb-7" style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
            <span className="font-bold" style={{ fontStyle: 'italic' }}>Happy Clients</span> <span style={{ fontStyle: 'italic' }} className="text-gray-500">Say</span>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setTestiIdx(i => (i - 1 + testiPages) % testiPages)}
              aria-label="Previous testimonials"
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center flex-shrink-0 border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className={`grid gap-4 flex-1 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {visibleTesti.map((t, i) => (
                <div key={t.id || i} className="rounded-2xl p-6 text-center" style={{ background: '#F4F4F2' }}>
                  <div className="flex justify-center mb-2"><GoogleMark size={20} /></div>
                  <Stars value={t.rating || 5} size={13} />
                  <div className="text-sm font-semibold mt-3 mb-2" style={{ fontFamily: DISPLAY, fontStyle: 'italic' }}>
                    "{t.name || 'Happy customer'}"
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTestiIdx(i => (i + 1) % testiPages)}
              aria-label="Next testimonials"
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center flex-shrink-0 border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          {testiPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {Array.from({ length: testiPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestiIdx(i)}
                  aria-label={`Go to testimonial page ${i + 1}`}
                  className="rounded-full transition"
                  style={{ width: i === testiIdx ? 16 : 6, height: 6, background: i === testiIdx ? INK : '#e5e5e5' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact / WhatsApp CTA */}
      {showContact && (
        <div id={sectionId('contact')} className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
          <div className="rounded-3xl text-center p-6 sm:p-10" style={{ background: INK }}>
            <div className="text-white mb-2" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 20 : 28 }}>
              Ready to order?
            </div>
            <div className="text-xs text-white/60 mb-6">Chat with {brandName} directly on WhatsApp — real replies, no bots.</div>
            <a
              href={waLink(genericOrderMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
              style={{ background: '#fff', color: INK }}
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
            {(address || instagram) && (
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-white/60 flex-wrap">
                {address && <span className="flex items-center gap-1.5"><MapPin size={12} /> {address}</span>}
                {instagram && <span className="flex items-center gap-1.5"><AtSign size={12} /> {instagram.replace('@', '')}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand footer */}
      <div className={`border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 ${isMobile ? 'px-5 py-5' : 'px-8 py-6'}`}>
        <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: INK }} className="text-sm">{brandName}</span>
        <div className="flex gap-4 text-[11px] text-gray-400">
          {navLinks.map(l => (
            <button key={l.label} onClick={() => scrollToSection(l.target)} className="hover:text-gray-600 transition">{l.label}</button>
          ))}
        </div>
      </div>

      {/* Sticky chat bubble, matching the "We're Online!" widget in the reference */}
      {whatsapp && (
        <div className="sticky bottom-4 z-20 flex justify-end pr-3 sm:pr-5 pointer-events-none" style={{ height: 0 }}>
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="hidden sm:block bg-white rounded-xl shadow-lg border border-gray-100 px-3.5 py-2.5 max-w-[180px]">
              <div className="text-xs font-semibold text-gray-900">We're Online!</div>
              <div className="text-[11px] text-gray-500">How may I help you today?</div>
            </div>
            <a
              href={waLink(genericOrderMsg)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
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