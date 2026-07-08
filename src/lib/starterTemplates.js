// Curated starter bundles for the website builder's "Apply Starter Template"
// feature — each maps to the same { theme, sections } shape already accepted
// by PUT /website/settings, so applying one is just a normal guarded save,
// no backend changes needed. `matchKeywords` are used for a best-effort,
// case-insensitive substring match against the business's free-text
// `category` field to highlight a recommendation — never an auto-apply.

export const STARTER_TEMPLATES = [
  {
    id: 'restaurant',
    name: 'Restaurant & Food',
    description: 'Warm, appetite-led — big photography, menu-style browsing.',
    matchKeywords: ['restaurant', 'food', 'cafe', 'café', 'catering', 'bakery', 'kitchen', 'chef'],
    bundle: {
      templateId: 'sunset',
      sectionStyles: { hero: 'magazine', products: 'catalog', about: 'magazine', gallery: 'magazine', testimonials: 'boutique', contact: 'boutique' },
      sectionOrder: [1, 4, 2, 3, 5, 6],
      activeOverrides: { 4: true },
    },
  },
  {
    id: 'retail',
    name: 'Boutique & Retail',
    description: 'Product-forward, elegant — the builder\'s classic look.',
    matchKeywords: ['retail', 'boutique', 'shop', 'store', 'fashion', 'clothing', 'jewelry', 'jewellery', 'accessor'],
    bundle: {
      templateId: 'elegant',
      sectionStyles: { hero: 'boutique', products: 'boutique', about: 'boutique', gallery: 'boutique', testimonials: 'boutique', contact: 'boutique' },
      sectionOrder: [1, 2, 4, 3, 5, 6],
      activeOverrides: { 4: true },
    },
  },
  {
    id: 'services',
    name: 'Services & Professional',
    description: 'Trust-led, compact — reviews up front, no-nonsense layout.',
    matchKeywords: ['service', 'consult', 'repair', 'clean', 'salon', 'spa', 'professional', 'agency', 'logistics'],
    bundle: {
      templateId: 'monochrome',
      sectionStyles: { hero: 'catalog', products: 'catalog', about: 'boutique', gallery: 'boutique', testimonials: 'catalog', contact: 'catalog' },
      sectionOrder: [1, 5, 2, 3, 4, 6],
      activeOverrides: {},
    },
  },
  {
    id: 'creative',
    name: 'Creative & Portfolio',
    description: 'Editorial, gallery-led — for work that sells on imagery.',
    matchKeywords: ['creative', 'portfolio', 'photography', 'photo', 'art', 'design', 'studio'],
    bundle: {
      templateId: 'midnight',
      sectionStyles: { hero: 'magazine', products: 'magazine', about: 'magazine', gallery: 'magazine', testimonials: 'magazine', contact: 'magazine' },
      sectionOrder: [1, 4, 2, 3, 5, 6],
      activeOverrides: { 4: true },
    },
  },
]

export function recommendedStarterTemplateId(category) {
  const c = (category || '').toLowerCase()
  if (!c) return null
  const match = STARTER_TEMPLATES.find(t => t.matchKeywords.some(kw => c.includes(kw)))
  return match?.id || null
}
