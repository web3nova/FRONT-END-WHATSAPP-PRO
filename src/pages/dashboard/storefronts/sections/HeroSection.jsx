import { ArrowRight } from 'lucide-react'

// `ctx` carries every derived value sections need (colors, fonts, business
// data, callbacks) — built once by the orchestrator (StorefrontPreview.jsx)
// and passed straight through, so section files don't each need a 15+ prop
// signature. See StorefrontPreview.jsx's `ctx` construction for the full shape.
export default function HeroSection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogHero ctx={ctx} />
  if (variant === 'magazine') return <MagazineHero ctx={ctx} />
  return <BoutiqueHero ctx={ctx} />
}

// Magazine: oversized image, large overlapping serif headline, asymmetric —
// text block anchored bottom-left over a wide two-thirds-width image feel.
function MagazineHero({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, heroHeadline, heroSubtitle, heroCta, heroBg, heroBg2, heroBgImage, whatsapp, waLink, genericOrderMsg, goShop } = ctx
  return (
    <div
      id={sectionId('hero')}
      className="relative overflow-hidden flex flex-col justify-end"
      style={{
        minHeight: isMobile ? 380 : 560,
        background: heroBgImage
          ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${heroBgImage}) center/cover no-repeat`
          : heroBg2
            ? `linear-gradient(135deg, ${heroBg} 0%, ${heroBg2} 100%)`
            : `linear-gradient(135deg, ${heroBg} 0%, ${heroBg}cc 100%)`,
      }}
    >
      <div className={isMobile ? 'px-5 pb-10 pt-16' : 'px-10 pb-14 pt-24'}>
        {heroSubtitle && <div className="text-white/80 uppercase tracking-[0.2em] text-xs mb-3">{heroSubtitle}</div>}
        <div className="text-white leading-[0.95] mb-6" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 40 : 88, maxWidth: isMobile ? '100%' : '70%' }}>
          {heroHeadline}
        </div>
        <div className="flex gap-3 flex-wrap">
          {whatsapp && (
            <a href={waLink(genericOrderMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 transition hover:opacity-90" style={{ background: '#fff', color: INK }}>
              {heroCta}
            </a>
          )}
          <button onClick={() => goShop('all')} className="text-sm font-semibold px-6 py-3 border border-white/50 text-white hover:bg-white/10 transition">
            Explore
          </button>
        </div>
      </div>
    </div>
  )
}

// Catalog: slim promo-strip treatment — no big background image, single row,
// headline + CTA inline, so a heavier section can visually lead right after it.
function CatalogHero({ ctx }) {
  const { isMobile, sectionId, INK, heroHeadline, heroSubtitle, heroCta, whatsapp, waLink, genericOrderMsg, goShop } = ctx
  return (
    <div
      id={sectionId('hero')}
      className={`flex items-center gap-3 ${isMobile ? 'flex-col text-center px-4 py-4' : 'justify-between px-8 py-5'}`}
      style={{ background: INK }}
    >
      <div className={isMobile ? '' : 'flex-1 min-w-0'}>
        <div className="text-white font-bold text-base sm:text-lg truncate">{heroHeadline}</div>
        {heroSubtitle && <div className="text-white/60 text-xs mt-0.5 truncate">{heroSubtitle}</div>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {whatsapp && (
          <a href={waLink(genericOrderMsg)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-4 py-2 rounded-md transition hover:opacity-90" style={{ background: '#fff', color: INK }}>
            {heroCta}
          </a>
        )}
        <button onClick={() => goShop('all')} className="text-xs font-semibold px-4 py-2 rounded-md border border-white/30 text-white hover:bg-white/10 transition">
          Shop Now
        </button>
      </div>
    </div>
  )
}

function BoutiqueHero({ ctx }) {
  const {
    isMobile, sectionId, DISPLAY, INK,
    heroHeadline, heroSubtitle, heroCta, heroBg, heroBg2, heroLayout, heroBgImage,
    aboutText, whatsapp, waLink, genericOrderMsg, goShop,
  } = ctx

  return (
    <div
      id={sectionId('hero')}
      className={`relative overflow-hidden ${isMobile ? 'px-5 py-12' : 'px-8 py-20'}`}
      style={heroBgImage ? {
        background: `linear-gradient(180deg, rgba(15,23,42,0.35), rgba(15,23,42,0.6)), url(${heroBgImage}) center/cover no-repeat`,
        textAlign: heroLayout === 'left' ? 'left' : heroLayout === 'right' ? 'right' : 'center',
      } : {
        background: heroBg2
          ? `linear-gradient(135deg, ${heroBg} 0%, ${heroBg2} 100%)`
          : `linear-gradient(135deg, ${heroBg} 0%, ${heroBg}cc 100%)`,
        textAlign: heroLayout === 'left' ? 'left' : heroLayout === 'right' ? 'right' : 'center',
      }}
    >
      {heroBgImage && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: 'rgba(255,255,255,0.14)', fontSize: isMobile ? 36 : 72, letterSpacing: 2, whiteSpace: 'nowrap' }}
        >
          {(heroSubtitle || heroHeadline).toUpperCase()}
        </div>
      )}
      <div className={`relative ${heroLayout === 'left' ? '' : heroLayout === 'right' ? 'max-w-xl ml-auto' : 'max-w-xl mx-auto'}`}>
        {heroSubtitle && (
          <div className="mb-3 text-white/85" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: isMobile ? 14 : 16 }}>
            {heroSubtitle}
          </div>
        )}
        <div className="text-white mb-5 leading-tight" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 30 : 48 }}>
          {heroHeadline}
        </div>
        {aboutText && (
          <div className={`text-sm text-white/70 mb-7 ${heroLayout === 'left' ? 'max-w-md' : heroLayout === 'right' ? 'max-w-md ml-auto' : 'max-w-md mx-auto'}`}>
            {aboutText.slice(0, isMobile ? 90 : 140)}{aboutText.length > (isMobile ? 90 : 140) ? '…' : ''}
          </div>
        )}
        <div className={`flex gap-3 flex-wrap ${heroLayout === 'left' ? '' : heroLayout === 'right' ? 'justify-end' : 'justify-center'}`}>
          {whatsapp ? (
            <a href={waLink(genericOrderMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition hover:opacity-90" style={{ background: '#fff', color: INK }}>
              {heroCta} <ArrowRight size={15} />
            </a>
          ) : (
            <button className="text-sm font-semibold px-6 py-3 rounded-full" style={{ background: '#fff', color: INK }}>{heroCta}</button>
          )}
          <button onClick={() => goShop('all')} className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full border border-white/40 text-white/90 hover:bg-white/10 transition">
            Browse Shop
          </button>
        </div>
      </div>
    </div>
  )
}
