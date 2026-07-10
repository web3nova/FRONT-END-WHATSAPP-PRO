import HeroSection from './sections/HeroSection'
import ProductsSection from './sections/ProductsSection'
import AboutSection from './sections/AboutSection'
import GallerySection from './sections/GallerySection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'

// Single source of truth for the 6 homepage section types. Persisted tenant
// data (settings.sections = [{id, name, active}], settings.theme.sectionStyles
// = {hero: 'boutique', ...}) is id/key based and must keep working unchanged
// — `legacyId` and `type` below are that stable contract; never renumber or
// rename them without a migration.
export const SECTION_TYPES = [
  {
    type: 'hero',
    legacyId: 1,
    name: 'Hero Section',
    shortLabel: 'Hero',
    description: 'Main banner with headline and CTA',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: HeroSection,
    fixedFirst: true,
    defaultActive: true,
  },
  {
    type: 'products',
    legacyId: 2,
    name: 'Featured Products',
    shortLabel: 'Products',
    description: 'Showcase your top products',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: ProductsSection,
    defaultActive: true,
  },
  {
    type: 'about',
    legacyId: 3,
    name: 'About Us',
    shortLabel: 'About',
    description: 'Tell your story and brand values',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: AboutSection,
    defaultActive: true,
  },
  {
    type: 'gallery',
    legacyId: 4,
    name: 'Gallery',
    shortLabel: 'Gallery',
    description: 'Photo gallery of your work',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: GallerySection,
    defaultActive: false,
  },
  {
    type: 'testimonials',
    legacyId: 5,
    name: 'Testimonials',
    shortLabel: 'Testimonials',
    description: 'Customer reviews and feedback',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: TestimonialsSection,
    defaultActive: true,
  },
  {
    type: 'contact',
    legacyId: 6,
    name: 'Contact / WhatsApp CTA',
    shortLabel: 'Contact',
    description: 'Let customers reach you',
    variants: ['boutique', 'catalog', 'magazine'],
    Renderer: ContactSection,
    defaultActive: true,
  },
]

export const sectionByType = Object.fromEntries(SECTION_TYPES.map(s => [s.type, s]))
export const sectionByLegacyId = Object.fromEntries(SECTION_TYPES.map(s => [s.legacyId, s]))

// Default render order for the reorderable set (everything but hero, which is
// fixedFirst and rendered separately). Preserves the exact order the old
// REORDERABLE_DEFAULT_ORDER / defaultSections used: products, gallery, about,
// testimonials, contact.
export const DEFAULT_REORDERABLE_ORDER = ['products', 'gallery', 'about', 'testimonials', 'contact']
  .map(type => sectionByType[type].legacyId)
