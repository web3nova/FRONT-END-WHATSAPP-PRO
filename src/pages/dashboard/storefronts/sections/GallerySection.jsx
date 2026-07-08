export default function GallerySection({ variant, ctx }) {
  if (variant === 'catalog') return <CatalogGallery ctx={ctx} />
  if (variant === 'magazine') return <MagazineGallery ctx={ctx} />
  return <BoutiqueGallery ctx={ctx} />
}

// Magazine: full-width mosaic feel via CSS columns (varied image heights
// stack naturally) instead of a uniform grid.
function MagazineGallery({ ctx }) {
  const { isMobile, DISPLAY, INK, brandName, galleryTitle, galleryImages } = ctx
  return (
    <div className={isMobile ? 'px-5 py-10' : 'px-10 py-16'}>
      <div className="mb-6" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 24 : 36, color: INK }}>{galleryTitle}</div>
      <div className={`gap-3 space-y-3 ${isMobile ? 'columns-2' : 'columns-3'}`}>
        {galleryImages.map((src, i) => (
          <img key={i} src={src?.url ?? src} alt={`${brandName} gallery ${i + 1}`} className="w-full block" style={{ breakInside: 'avoid' }} />
        ))}
      </div>
    </div>
  )
}

// Catalog: compact horizontal strip, minimal — not a full-width grid.
function CatalogGallery({ ctx }) {
  const { isMobile, PASTELS, brandName, galleryImages } = ctx
  return (
    <div className={isMobile ? 'px-4 py-4' : 'px-8 py-5'}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">Gallery</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {galleryImages.map((src, i) => (
          <div key={i} className="flex-shrink-0 rounded-md overflow-hidden" style={{ width: 64, height: 64, background: PASTELS[i % PASTELS.length] }}>
            <img src={src?.url ?? src} alt={`${brandName} gallery ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

function BoutiqueGallery({ ctx }) {
  const { isMobile, DISPLAY, PASTELS, brandName, galleryTitle, galleryImages } = ctx
  return (
    <div className={isMobile ? 'px-5 py-8' : 'px-8 py-12'}>
      <div className="mb-5" style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontWeight: 700, fontSize: isMobile ? 18 : 24 }}>{galleryTitle}</div>
      <div className={`grid gap-2 sm:gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
        {galleryImages.slice(0, isMobile ? 6 : 8).map((src, i) => (
          <div key={i} className="rounded-[var(--sf-radius)] overflow-hidden aspect-square" style={{ background: PASTELS[i % PASTELS.length] }}>
            <img src={src?.url ?? src} alt={`${brandName} gallery ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}
