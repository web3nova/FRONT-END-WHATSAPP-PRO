import { MessageCircle, MapPin, AtSign } from 'lucide-react'

export default function ContactSection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogContact ctx={ctx} />
  if (variant === 'magazine') return <MagazineContact ctx={ctx} />
  return <BoutiqueContact ctx={ctx} />
}

// Magazine: full-bleed closing CTA banner.
function MagazineContact({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, brandName, waLink, genericOrderMsg } = ctx
  return (
    <div id={sectionId('contact')} className={`text-center ${isMobile ? 'px-6 py-16' : 'px-10 py-28'}`} style={{ background: INK }}>
      <div className="text-white mb-6" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 30 : 56 }}>
        Let's talk.
      </div>
      <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">Chat with {brandName} directly on WhatsApp — real replies, no bots.</p>
      <a
        href={waLink(genericOrderMsg)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 transition hover:opacity-90"
        style={{ background: '#fff', color: INK }}
      >
        <MessageCircle size={16} /> Chat on WhatsApp
      </a>
    </div>
  )
}

// Catalog: compact inline bar, not a boxed CTA card.
function CatalogContact({ ctx }) {
  const { isMobile, sectionId, INK, brandName, waLink, genericOrderMsg } = ctx
  return (
    <div id={sectionId('contact')} className={`flex items-center justify-between gap-3 ${isMobile ? 'flex-col text-center px-4 py-4' : 'px-8 py-4'}`} style={{ background: INK }}>
      <span className="text-white text-sm font-semibold">Questions? Chat with {brandName} on WhatsApp.</span>
      <a
        href={waLink(genericOrderMsg)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-bold px-4 py-2 rounded-md flex-shrink-0 transition hover:opacity-90"
        style={{ background: '#25D366', color: '#fff' }}
      >
        Chat Now
      </a>
    </div>
  )
}

function BoutiqueContact({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, brandName, waLink, genericOrderMsg, address, instagram } = ctx
  return (
    <div id={sectionId('contact')} className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
      <div className="rounded-[var(--sf-radius)] text-center p-6 sm:p-10" style={{ background: INK }}>
        <div className="text-white mb-2" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 20 : 28 }}>
          Ready to order?
        </div>
        <div className="text-xs text-white/60 mb-6">Chat with {brandName} directly on WhatsApp — real replies, no bots.</div>
        <a
          href={waLink(genericOrderMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition hover:opacity-90"
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
  )
}
