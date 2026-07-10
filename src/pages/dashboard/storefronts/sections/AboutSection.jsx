export default function AboutSection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogAbout ctx={ctx} />
  if (variant === 'magazine') return <MagazineAbout ctx={ctx} />
  return <BoutiqueAbout ctx={ctx} />
}

// Magazine: big 2-col editorial spread with generous whitespace.
function MagazineAbout({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, brandName, aboutText, aboutTitle, aboutImage } = ctx
  return (
    <div id={sectionId('about')} className={`grid gap-10 items-center ${isMobile ? 'grid-cols-1 px-5 py-14' : 'grid-cols-2 px-10 py-24'}`}>
      <div className={`overflow-hidden aspect-[3/4] bg-gray-50 ${isMobile ? 'order-2' : 'order-1'}`}>
        {aboutImage
          ? <img src={aboutImage} alt={brandName} className="w-full h-full object-cover" />
          : <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700 }} className="w-full h-full flex items-center justify-center text-6xl opacity-10">{brandName.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className={isMobile ? 'order-1' : 'order-2'}>
        <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-400">{aboutTitle}</div>
        <div className="mb-5 leading-tight" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 28 : 44, color: INK }}>{brandName}</div>
        <p className="text-base text-gray-600 leading-loose">{aboutText}</p>
      </div>
    </div>
  )
}

// Catalog: compressed into a lean "Store Info" strip, not a full section.
function CatalogAbout({ ctx }) {
  const { isMobile, sectionId, CREAM, aboutText } = ctx
  return (
    <div id={sectionId('about')} className={`flex items-center gap-3 border-t border-b border-gray-100 ${isMobile ? 'flex-col text-center px-4 py-3' : 'px-8 py-3'}`} style={{ background: CREAM }}>
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 flex-shrink-0">Store Info</span>
      <span className="text-xs text-gray-600 truncate">{aboutText}</span>
    </div>
  )
}

function BoutiqueAbout({ ctx }) {
  const { isMobile, sectionId, DISPLAY, INK, CREAM, brandName, aboutText, aboutImage } = ctx
  return (
    <div id={sectionId('about')} className={`${isMobile ? 'px-5 py-8' : 'px-8 py-14'} grid gap-8 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ background: CREAM }}>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">About</div>
        <div className="mb-3" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 22 : 30, color: INK }}>
          {brandName}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{aboutText}</p>
      </div>
      <div className="rounded-[var(--sf-radius)] overflow-hidden aspect-video flex items-center justify-center bg-white">
        {aboutImage
          ? <img src={aboutImage} alt={brandName} className="w-full h-full object-cover" />
          : <div style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700 }} className="text-4xl opacity-20">{brandName.slice(0, 2).toUpperCase()}</div>}
      </div>
    </div>
  )
}
