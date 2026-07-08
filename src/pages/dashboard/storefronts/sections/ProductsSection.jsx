import { Star } from 'lucide-react'
import { isSoldOut } from '../shared'

// Exported so the orchestrator's Shop view can render the same card style
// chosen here — the Products section's variant drives both the homepage
// preview grid and the full shop grid, so there's only one setting to change.
export function ProductCard({ variant, ctx, p, i, compact = false }) {
  if (variant === 'catalog') return <CatalogProductCard ctx={ctx} p={p} i={i} />
  if (variant === 'magazine') return <MagazineProductCard ctx={ctx} p={p} i={i} />
  return <BoutiqueProductCard ctx={ctx} p={p} i={i} compact={compact} />
}

// Magazine: used by the Shop grid (which stays grid-based regardless of
// variant) — sharp corners, serif title, understated price.
function MagazineProductCard({ ctx, p, i }) {
  const { PASTELS, DISPLAY, INK, GOLD, openProduct } = ctx
  const soldOut = isSoldOut(p)
  return (
    <div className="group cursor-pointer" onClick={() => openProduct(p)}>
      <div className="overflow-hidden flex items-center justify-center mb-3 relative" style={{ background: PASTELS[i % PASTELS.length], aspectRatio: '4 / 5' }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          : <div className="text-3xl opacity-30">📦</div>}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-[10px] font-bold px-2.5 py-1 text-gray-800">Sold Out</span>
          </div>
        )}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: GOLD }}>{p.category || 'Featured'}</div>
      <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: INK, fontSize: 15 }}>{p.name}</div>
      <div className="text-xs text-gray-500 mt-1">₦{((p.priceMinor || 0) / 100).toLocaleString()}</div>
    </div>
  )
}

// Catalog: dense, price-prominent, sans-serif — no italic display font.
function CatalogProductCard({ ctx, p, i }) {
  const { PASTELS, INK, openProduct } = ctx
  const soldOut = isSoldOut(p)
  return (
    <div className="cursor-pointer border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition bg-white" onClick={() => openProduct(p)}>
      <div className="relative flex items-center justify-center" style={{ background: PASTELS[i % PASTELS.length], aspectRatio: '1 / 1' }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
          : <div className="text-2xl opacity-30">📦</div>}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-[9px] font-bold px-2 py-0.5 rounded text-gray-800">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="text-[10px] text-gray-400 truncate">{p.category || 'General'}</div>
        <div className="text-xs font-semibold text-gray-900 truncate mb-1">{p.name}</div>
        <div className="text-sm font-bold" style={{ color: INK }}>₦{((p.priceMinor || 0) / 100).toLocaleString()}</div>
      </div>
    </div>
  )
}

function BoutiqueProductCard({ ctx, p, i, compact }) {
  const { PASTELS, DISPLAY, INK, GOLD, openProduct } = ctx
  const soldOut = isSoldOut(p)
  const attrEntries = Object.entries(p.attributes || {}).filter(([, v]) => v !== null && v !== undefined)
  const firstArray = attrEntries.find(([, v]) => Array.isArray(v))

  return (
    <div className="group cursor-pointer" onClick={() => openProduct(p)}>
      <div
        className="rounded-[var(--sf-radius)] overflow-hidden flex items-center justify-center mb-3 relative"
        style={{ background: PASTELS[i % PASTELS.length], aspectRatio: '1 / 1' }}
      >
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition duration-300" />
          : <div className="text-3xl opacity-30">📦</div>}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-[10px] font-bold px-2.5 py-1 rounded-full text-gray-800">Sold Out</span>
          </div>
        )}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: GOLD }}>
        {p.category || 'Featured'}
      </div>
      <div className="leading-snug mb-1" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, color: INK, fontSize: compact ? 13 : 14 }}>
        {p.name}
      </div>
      {p.review && (
        <div className="flex gap-0.5 mb-1">
          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={9} fill={GOLD} style={{ color: GOLD }} strokeWidth={1} />)}
        </div>
      )}
      {firstArray && (
        <div className="flex gap-1 flex-wrap mb-1.5">
          {firstArray[1].slice(0, 3).map(opt => (
            <span key={opt} className="text-[9px] border border-gray-200 rounded px-1 py-0.5 text-gray-500">{opt}</span>
          ))}
          {firstArray[1].length > 3 && <span className="text-[9px] text-gray-400">+{firstArray[1].length - 3}</span>}
        </div>
      )}
      <div className="text-xs font-semibold text-gray-700 mb-2">
        ₦ {((p.priceMinor || 0) / 100).toLocaleString()}
      </div>
      <button
        onClick={e => { e.stopPropagation(); openProduct(p) }}
        disabled={soldOut}
        className="w-full text-center text-[11px] font-semibold py-1.5 rounded-full border transition"
        style={soldOut
          ? { borderColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
          : { borderColor: INK, color: INK }}
      >
        {soldOut ? 'Sold Out' : 'View & Order'}
      </button>
    </div>
  )
}

export default function ProductsSection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogProducts variant={variant} ctx={ctx} />
  if (variant === 'magazine') return <MagazineProducts ctx={ctx} />
  return <BoutiqueProducts variant={variant} ctx={ctx} />
}

// Magazine: curated editorial list — image + long-form description, not a
// grid. No category browse row (doesn't fit the story-led feel); category
// browsing still lives in the nav's "Shop" link / full Shop view.
function MagazineProducts({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, GOLD, showProducts, productsTitle, productCount, products, openProduct } = ctx
  if (!showProducts) return null
  return (
    <div id={sectionId('products')} className={isMobile ? 'px-5 py-10' : 'px-10 py-16'}>
      <div className="mb-8" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 26 : 40, color: INK }}>{productsTitle}</div>
      <div className="space-y-10">
        {products.slice(0, Math.min(productCount, 4)).map((p, i) => (
          <div
            key={p.id || i}
            className={`grid gap-6 items-center cursor-pointer ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
            onClick={() => openProduct(p)}
          >
            <div className={`overflow-hidden aspect-[4/3] bg-gray-50 ${!isMobile && i % 2 === 1 ? 'md:order-2' : ''}`}>
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📦</div>}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>{p.category || 'Featured'}</div>
              <div className="mb-3" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 20 : 28, color: INK }}>{p.name}</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {p.description || 'A closer look at this piece — tap to see full details and order on WhatsApp.'}
              </p>
              <div className="text-lg font-bold" style={{ color: INK }}>₦{((p.priceMinor || 0) / 100).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Catalog: category filter chips (not circular tags) + a dense price-led grid.
function CatalogProducts({ variant, ctx }) {
  const { isMobile, sectionId, goShop, categoryTags, showProducts, productsTitle, productCount, products } = ctx
  return (
    <>
      <div className={`flex gap-2 overflow-x-auto border-b border-gray-100 ${isMobile ? 'px-4 py-3' : 'px-8 py-3'}`}>
        {categoryTags.map(c => (
          <button
            key={c.label}
            onClick={() => goShop(c.label)}
            className="flex-shrink-0 px-3 py-1.5 text-[11px] font-semibold rounded-md border border-gray-200 text-gray-600 hover:border-gray-400 transition"
          >
            {c.label}
          </button>
        ))}
      </div>

      {showProducts && (
        <div id={sectionId('products')} className={isMobile ? 'px-4 py-5' : 'px-8 py-6'}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">{productsTitle}</div>
            <button onClick={() => goShop('all')} className="text-[11px] font-medium text-gray-400 underline underline-offset-2 flex-shrink-0">View All</button>
          </div>
          <div className={`grid gap-2 sm:gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
            {products.slice(0, productCount).map((p, i) => <ProductCard key={p.id || i} variant={variant} ctx={ctx} p={p} i={i} />)}
          </div>
        </div>
      )}
    </>
  )
}

function BoutiqueProducts({ variant, ctx }) {
  const { isMobile, DISPLAY, PASTELS, sectionId, goShop, categoryTags, showProducts, productsTitle, productCount, products } = ctx

  return (
    <>
      {/* Shop by Category */}
      <div className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
        <div className="flex items-end justify-between mb-6">
          <div style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
            <span style={{ fontStyle: 'italic' }}>Shop by</span> <span className="font-bold">Category</span>
          </div>
          <button onClick={() => goShop('all')} className="text-xs font-medium text-gray-500 underline underline-offset-2 flex-shrink-0">View All</button>
        </div>
        <div className={`flex gap-4 sm:gap-6 ${isMobile ? 'overflow-x-auto pb-1 -mx-5 px-5' : 'justify-center flex-wrap'}`}>
          {categoryTags.map((c, i) => (
            <div
              key={c.label}
              onClick={() => goShop(c.label)}
              className="flex flex-col items-center gap-2.5 flex-shrink-0 cursor-pointer group"
              style={{ width: isMobile ? 84 : 108 }}
            >
              <div
                className="rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 transition"
                style={{ width: isMobile ? 84 : 108, height: isMobile ? 84 : 108, background: PASTELS[i % PASTELS.length], ringColor: ctx.INK }}
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
        <div id={sectionId('products')} className={`${isMobile ? 'px-5 py-8' : 'px-8 py-12'}`} style={{ background: ctx.CREAM }}>
          <div className="flex items-end justify-between mb-6">
            <div style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
              <span className="font-bold" style={{ fontStyle: 'italic' }}>{productsTitle}</span>{' '}
              <span style={{ fontStyle: 'italic' }} className="text-gray-500">Around The World</span>
            </div>
            <button onClick={() => goShop('all')} className="text-xs font-medium text-gray-500 underline underline-offset-2 flex-shrink-0">View All</button>
          </div>
          <div className={`grid gap-4 sm:gap-5 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {products.slice(0, productCount).map((p, i) => <ProductCard key={p.id || i} variant={variant} ctx={ctx} p={p} i={i} />)}
          </div>
        </div>
      )}
    </>
  )
}
