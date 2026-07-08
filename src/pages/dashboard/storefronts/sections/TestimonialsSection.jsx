import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoogleMark, Stars } from '../shared'

export default function TestimonialsSection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogTestimonials ctx={ctx} />
  if (variant === 'magazine') return <MagazineTestimonials ctx={ctx} />
  return <BoutiqueTestimonials ctx={ctx} />
}

// Magazine: one large single-quote at a time, big typography — no carousel.
function MagazineTestimonials({ ctx }) {
  const { isMobile, DISPLAY, INK, testimonialItems } = ctx
  const t = testimonialItems[0]
  if (!t) return null
  return (
    <div className={`text-center ${isMobile ? 'px-6 py-14' : 'px-20 py-24'}`}>
      <Stars value={t.rating || 5} size={16} color={INK} />
      <p className="mt-6 leading-snug" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 22 : 36, color: INK }}>
        "{t.text}"
      </p>
      <div className="mt-5 text-xs font-bold uppercase tracking-widest text-gray-400">{t.name || 'Happy customer'}</div>
    </div>
  )
}

// Catalog: compressed list, small print — no carousel controls.
function CatalogTestimonials({ ctx }) {
  const { isMobile, INK, testimonialItems } = ctx
  return (
    <div className={isMobile ? 'px-4 py-5' : 'px-8 py-6'}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">What Customers Say</div>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
        {testimonialItems.slice(0, 4).map((t, i) => (
          <div key={t.id || i} className="flex items-start gap-2 px-3 py-2.5">
            <Stars value={t.rating || 5} size={10} color={INK} />
            <p className="text-[11px] text-gray-600 leading-snug flex-1">
              <span className="font-semibold text-gray-800">{t.name || 'Happy customer'}: </span>{t.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BoutiqueTestimonials({ ctx }) {
  const { isMobile, DISPLAY, INK, testiIdx, setTestiIdx, testiPages, visibleTesti } = ctx
  return (
    <div className={isMobile ? 'px-5 py-10' : 'px-8 py-14'}>
      <div className="mb-7" style={{ fontFamily: DISPLAY, fontSize: isMobile ? 20 : 28 }}>
        <span className="font-bold" style={{ fontStyle: 'italic' }}>Happy Clients</span> <span style={{ fontStyle: 'italic' }} className="text-gray-500">Say</span>
      </div>
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setTestiIdx(i => (i - 1 + testiPages) % testiPages)}
          className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center flex-shrink-0 border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <div className={`grid gap-4 flex-1 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {visibleTesti.map((t, i) => (
            <div key={t.id || i} className="rounded-[var(--sf-radius)] p-6 text-center" style={{ background: '#F4F4F2' }}>
              <div className="flex justify-center mb-2"><GoogleMark size={20} /></div>
              <Stars value={t.rating || 5} size={13} color={INK} />
              <div className="text-sm font-semibold mt-3 mb-2" style={{ fontFamily: DISPLAY, fontStyle: 'italic' }}>
                "{t.name || 'Happy customer'}"
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setTestiIdx(i => (i + 1) % testiPages)}
          className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center flex-shrink-0 border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      {testiPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: testiPages }).map((_, i) => (
            <button key={i} onClick={() => setTestiIdx(i)} className="rounded-full transition"
              style={{ width: i === testiIdx ? 16 : 6, height: 6, background: i === testiIdx ? INK : '#e5e5e5' }} />
          ))}
        </div>
      )}
    </div>
  )
}
