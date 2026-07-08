import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Eye, CheckCircle, ExternalLink, Layout, Image, Type, ToggleLeft, ToggleRight, Plus, Loader, Monitor, Smartphone, ChevronDown, ChevronUp, Save, Trash2, Star, Grid3x3, Check } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken } from '../../lib/auth'
import { THEMES, FONT_OPTIONS, RADIUS_OPTIONS } from '../../lib/themes'
import ImageUploadField from '../../components/ImageUploadField'
import StorefrontPreview from './StorefrontPreview'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const defaultSections = [
  { id: 1, name: 'Hero Section', desc: 'Main banner with headline and CTA', active: true },
  { id: 2, name: 'Featured Products', desc: 'Showcase your top products', active: true },
  { id: 3, name: 'About Us', desc: 'Tell your story and brand values', active: true },
  { id: 4, name: 'Gallery', desc: 'Photo gallery of your work', active: false },
  { id: 5, name: 'Testimonials', desc: 'Customer reviews and feedback', active: true },
  { id: 6, name: 'Contact / WhatsApp CTA', desc: 'Let customers reach you', active: true },
  { id: 7, name: 'Shop by Category', desc: 'Auto-built from your product categories — only useful once products have 2+ distinct categories', active: false },
]

const pageList = [
  { name: 'Home', path: '/', status: 'published', sectionId: 1 },
  { name: 'Shop / Products', path: '/shop', status: 'published', sectionId: 2 },
  { name: 'About', path: '/about', status: 'published', sectionId: 3 },
  { name: 'Contact', path: '/contact', status: 'published', sectionId: 6 },
  { name: 'Blog', path: '/blog', status: 'draft', sectionId: null },
]

const sectionIcons = { 0: Layout, 1: Image, 2: Type, 3: Image, 4: Type, 5: Globe, 6: Grid3x3 }

export default function Website() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState(null)
  const [sections, setSections] = useState(defaultSections)
  const [activeSectionFlags, setActiveSectionFlags] = useState(defaultSections.map(s => s.active))
  const [tab, setTab] = useState('pages')
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [sectionForm, setSectionForm] = useState({})
  const [designForm, setDesignForm] = useState({})
  const [customThemeForm, setCustomThemeForm] = useState({})
  const [showDomainPanel, setShowDomainPanel] = useState(false)
  const [domainInput, setDomainInput] = useState('')
  const [domainSaving, setDomainSaving] = useState(false)
  const [domainRemoving, setDomainRemoving] = useState(false)
  const [domainError, setDomainError] = useState('')
  const [domainSuccess, setDomainSuccess] = useState(null) // { domain, cname }

  // Whether the product data actually has distinct categories — used to let
  // people know why "Shop by Category" might not show anything yet.
  const hasRealCategories = new Set(products.map(p => p.category).filter(Boolean)).size >= 2

  const handleSaveDomain = async () => {
    setDomainError('')
    setDomainSuccess(null)
    setDomainSaving(true)
    try {
      const token = getStoredAccessToken()
      const res = await fetch(`${API_BASE}/tenant/domain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: domainInput.trim() }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || 'Failed to save domain')
      const data = body?.data ?? body
      setBusiness(b => ({ ...b, domain: data.domain }))
      setDomainSuccess(data)
    } catch (err) {
      setDomainError(err.message)
    } finally {
      setDomainSaving(false)
    }
  }

  const handleRemoveDomain = async () => {
    setDomainError('')
    setDomainRemoving(true)
    try {
      const token = getStoredAccessToken()
      const res = await fetch(`${API_BASE}/tenant/domain`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Failed to remove domain')
      }
      setBusiness(b => ({ ...b, domain: null }))
      setDomainInput('')
      setDomainSuccess(null)
      setShowDomainPanel(false)
    } catch (err) {
      setDomainError(err.message)
    } finally {
      setDomainRemoving(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      const token = getStoredAccessToken()
      if (!token) return
      try {
        const [bizRes, prodRes, wsRes] = await Promise.all([
          fetch(`${API_BASE}/business`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/products?limit=100&sort=sortOrder`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/website/settings`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (bizRes.ok && !ignore) {
          const body = await bizRes.json()
          setBusiness(body?.data || body)
        }
        if (prodRes.ok && !ignore) {
          const body = await prodRes.json()
          const list = body?.data?.items || body?.data || body?.products || []
          setProducts(Array.isArray(list) ? list : [])
        }
        if (wsRes.ok && !ignore) {
          const body = await wsRes.json()
          const ws = body?.data || body
          setSettings(ws)
          if (ws?.sections && Array.isArray(ws.sections)) {
            const merged = defaultSections.map(ds => {
              const found = ws.sections.find(s => s.name === ds.name || s.id === ds.id)
              return found ? { ...ds, active: found.active ?? ds.active } : ds
            })
            setSections(merged)
            setActiveSectionFlags(merged.map(s => s.active))
          }
        }
      } catch (err) {
        console.error('Failed to load website data:', err)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const brandName = business?.displayName || 'Your Brand'
  const whatsapp = business?.whatsappNumber || ''
  const tenantId = business?.tenantId || ''
  const storefrontUrl = business?.domain
    ? `https://${business.domain}`
    : `${window.location.protocol}//${window.location.host}/storefront/${tenantId || ''}`
  const domain = storefrontUrl

  const activeTemplateId = settings?.theme?.templateId || 'minimal'
  const presetTheme = THEMES[activeTemplateId] || THEMES.minimal
  const customThemeOverrides = settings?.theme?.customTheme || {}
  const activeTheme = { ...presetTheme, ...customThemeOverrides }

  // Persist a toggle immediately so it survives a refresh, not just local state.
  // Blocked while another save is in flight, and reverted if the request fails,
  // so the UI never shows a toggle state that isn't actually saved.
  const toggle = async (i) => {
    if (savingSettings) return
    const previous = activeSectionFlags
    const updated = previous.map((v, idx) => idx === i ? !v : v)
    setActiveSectionFlags(updated)
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sections: sections.map((s, idx) => ({ id: s.id, name: s.name, active: updated[idx] })) }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch (err) {
      console.error('Failed to save section visibility:', err)
      setActiveSectionFlags(previous)
      setSaveError('Could not save that change. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Swap the whole visual template. Saves immediately, same pattern as toggle().
  // Blocked while another save is in flight, and reverted if the request fails.
  // Switching the base preset also clears any custom overrides — tweaks made on
  // top of the old preset shouldn't silently bleed into a newly chosen look.
  const selectTemplate = async (templateId) => {
    if (savingSettings) return
    const previousTheme = settings?.theme || {}
    const updatedTheme = { ...previousTheme, templateId, customTheme: {} }
    setSettings(s => ({ ...(s || {}), theme: updatedTheme }))
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme: updatedTheme }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch (err) {
      console.error('Failed to save template:', err)
      setSettings(s => ({ ...(s || {}), theme: previousTheme }))
      setSaveError('Could not save that template. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Flip the site from draft to live. Same guard/error pattern as selectTemplate.
  const publish = async () => {
    if (savingSettings) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: true }),
      })
      if (!res.ok) throw new Error('Publish failed')
      setSettings(s => ({ ...(s || {}), published: true }))
    } catch (err) {
      console.error('Failed to publish:', err)
      setSaveError('Could not publish. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Save SEO + social fields together. Same merge/guard/error pattern as saveSection.
  const saveSeoSocial = async () => {
    if (savingSettings) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const currentSeo = settings?.seo || {}
      const currentSocial = settings?.social || {}
      const seo = {
        title: designForm.seoTitle ?? currentSeo.title ?? '',
        description: designForm.seoDescription ?? currentSeo.description ?? '',
        ogImage: designForm.seoOgImage ?? currentSeo.ogImage ?? '',
      }
      const social = {
        facebook: designForm.socialFacebook ?? currentSocial.facebook ?? '',
        instagram: designForm.socialInstagram ?? currentSocial.instagram ?? '',
        twitter: designForm.socialTwitter ?? currentSocial.twitter ?? '',
        tiktok: designForm.socialTiktok ?? currentSocial.tiktok ?? '',
        youtube: designForm.socialYoutube ?? currentSocial.youtube ?? '',
      }
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seo, social }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSettings(s => ({ ...(s || {}), seo, social }))
      setDesignForm({})
    } catch (err) {
      console.error('Failed to save SEO/social:', err)
      setSaveError('Could not save SEO/social settings. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Save color/font/shape overrides on top of the selected preset. Same
  // merge/guard/error pattern as saveSeoSocial — customTheme only ever holds
  // the fields the user has actually overridden.
  const saveCustomTheme = async () => {
    if (savingSettings) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const currentTheme = settings?.theme || {}
      const customTheme = {
        ink: customThemeForm.ink ?? customThemeOverrides.ink ?? presetTheme.ink,
        accent: customThemeForm.accent ?? customThemeOverrides.accent ?? presetTheme.accent,
        soft: customThemeForm.soft ?? customThemeOverrides.soft ?? presetTheme.soft,
        font: customThemeForm.font ?? customThemeOverrides.font ?? presetTheme.font,
        radius: customThemeForm.radius ?? customThemeOverrides.radius ?? presetTheme.radius,
      }
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme: { ...currentTheme, customTheme } }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSettings(s => ({ ...(s || {}), theme: { ...currentTheme, customTheme } }))
      setCustomThemeForm({})
    } catch (err) {
      console.error('Failed to save custom theme:', err)
      setSaveError('Could not save your theme customization. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Revert to the pure preset — clears any color/font/shape overrides.
  const resetCustomTheme = async () => {
    if (savingSettings) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const currentTheme = settings?.theme || {}
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme: { ...currentTheme, customTheme: {} } }),
      })
      if (!res.ok) throw new Error('Reset failed')
      setSettings(s => ({ ...(s || {}), theme: { ...currentTheme, customTheme: {} } }))
      setCustomThemeForm({})
    } catch (err) {
      console.error('Failed to reset custom theme:', err)
      setSaveError('Could not reset your theme customization. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Open / close the inline editor for a section, seeding the form with saved values.
  // Blocked while a save is in flight — switching sections mid-save reads stale
  // `settings` state and silently drops whatever the in-flight save just wrote.
  const openEditor = (s) => {
    if (savingSettings) return
    if (editingSectionId === s.id) {
      setEditingSectionId(null)
      setSectionForm({})
      return
    }
    const b = settings?.theme?.builder || {}
    if (s.id === 1) {
      setSectionForm({
        headline: b.hero?.headline || '', subtitle: b.hero?.subtitle || '', cta: b.hero?.cta || '',
        bg: b.hero?.bg || '', bgImage: b.hero?.bgImage || '', layout: b.hero?.layout || 'center',
      })
    } else if (s.id === 2) {
      setSectionForm({ productCount: b.products?.count || 8, productsTitle: b.products?.title || '' })
    } else if (s.id === 4) {
      setSectionForm({ galleryImages: [...(b.gallery?.images || [])], galleryTitle: b.gallery?.title || '', newImage: '' })
    } else if (s.id === 5) {
      setSectionForm({
        testimonialItems: [...(b.testimonials?.items || [])],
        testimonialsTitle: b.testimonials?.title || '',
        newName: '', newText: '', newRating: 5,
      })
    } else if (s.id === 6) {
      setSectionForm({ whatsapp: business?.whatsappNumber || '', address: b.contact?.address || '', instagram: b.contact?.instagram || '' })
    } else {
      setSectionForm({})
    }
    setEditingSectionId(s.id)
  }

  // Blocked while another save is in flight (see openEditor) so `currentTheme`
  // is never built from settings that a still-in-flight save hasn't landed yet.
  // Every request's response is checked — on failure the editor stays open with
  // the user's input intact instead of silently discarding it.
  const saveSection = async (s) => {
    if (savingSettings) return
    setSavingSettings(true)
    setSaveError('')
    const token = getStoredAccessToken()
    if (!token) { setSavingSettings(false); return }
    try {
      const currentTheme = settings?.theme || {}
      const builder = { ...(currentTheme.builder || {}) }

      if (s.id === 1) {
        const hero = builder.hero || {}
        builder.hero = {
          headline: sectionForm.headline ?? hero.headline ?? '',
          subtitle: sectionForm.subtitle ?? hero.subtitle ?? '',
          cta: sectionForm.cta ?? hero.cta ?? '',
          bg: sectionForm.bg ?? hero.bg ?? '',
          bgImage: sectionForm.bgImage ?? hero.bgImage ?? '',
          layout: sectionForm.layout ?? hero.layout ?? 'center',
        }
        const res = await fetch(`${API_BASE}/website/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme: { ...currentTheme, builder } }),
        })
        if (!res.ok) throw new Error('Save failed')
      } else if (s.id === 2) {
        builder.products = {
          count: sectionForm.productCount ?? builder.products?.count ?? 8,
          title: sectionForm.productsTitle ?? builder.products?.title ?? '',
        }
        const res = await fetch(`${API_BASE}/website/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme: { ...currentTheme, builder } }),
        })
        if (!res.ok) throw new Error('Save failed')
      } else if (s.id === 3) {
        const desc = sectionForm.about ?? business?.description ?? ''
        const res = await fetch(`${API_BASE}/business`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ description: desc }),
        })
        if (!res.ok) throw new Error('Save failed')
        setBusiness(b => ({ ...b, description: desc }))
      } else if (s.id === 4) {
        builder.gallery = {
          title: sectionForm.galleryTitle ?? builder.gallery?.title ?? '',
          images: sectionForm.galleryImages ?? builder.gallery?.images ?? [],
        }
        const res = await fetch(`${API_BASE}/website/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme: { ...currentTheme, builder } }),
        })
        if (!res.ok) throw new Error('Save failed')
      } else if (s.id === 5) {
        builder.testimonials = {
          title: sectionForm.testimonialsTitle ?? builder.testimonials?.title ?? '',
          items: sectionForm.testimonialItems ?? builder.testimonials?.items ?? [],
        }
        const res = await fetch(`${API_BASE}/website/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ theme: { ...currentTheme, builder } }),
        })
        if (!res.ok) throw new Error('Save failed')
      } else if (s.id === 6) {
        const wNum = sectionForm.whatsapp ?? business?.whatsappNumber ?? ''
        builder.contact = {
          address: sectionForm.address ?? builder.contact?.address ?? '',
          instagram: sectionForm.instagram ?? builder.contact?.instagram ?? '',
        }
        const [bizRes, wsRes] = await Promise.all([
          fetch(`${API_BASE}/business`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ whatsappNumber: wNum }),
          }),
          fetch(`${API_BASE}/website/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ theme: { ...currentTheme, builder } }),
          }),
        ])
        if (!bizRes.ok || !wsRes.ok) throw new Error('Save failed')
        setBusiness(b => ({ ...b, whatsappNumber: wNum }))
      }

      // Refresh settings from the server so local state matches what's saved.
      const wsRes = await fetch(`${API_BASE}/website/settings`, { headers: { Authorization: `Bearer ${token}` } })
      if (wsRes.ok) {
        const body = await wsRes.json()
        setSettings(body?.data || body)
      }
      setEditingSectionId(null)
      setSectionForm({})
    } catch (err) {
      console.error('Failed to save section:', err)
      setSaveError('Could not save your changes. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  // Build a "live" version of settings/whatsapp that reflects unsaved edits, so the
  // preview panel updates as the user types instead of only after Save.
  const baseBuilder = settings?.theme?.builder || {}
  let liveBuilder = baseBuilder
  if (editingSectionId === 1) {
    const hero = baseBuilder.hero || {}
    liveBuilder = { ...baseBuilder, hero: {
      headline: sectionForm.headline ?? hero.headline ?? '',
      subtitle: sectionForm.subtitle ?? hero.subtitle ?? '',
      cta: sectionForm.cta ?? hero.cta ?? '',
      bg: sectionForm.bg ?? hero.bg ?? '',
      bgImage: sectionForm.bgImage ?? hero.bgImage ?? '',
      layout: sectionForm.layout ?? hero.layout ?? 'center',
    }}
  } else if (editingSectionId === 2) {
    liveBuilder = { ...baseBuilder, products: {
      count: sectionForm.productCount ?? baseBuilder.products?.count ?? 8,
      title: sectionForm.productsTitle ?? baseBuilder.products?.title ?? '',
    }}
  } else if (editingSectionId === 3) {
    liveBuilder = { ...baseBuilder, about: { text: sectionForm.about ?? business?.description ?? '' } }
  } else if (editingSectionId === 4) {
    liveBuilder = { ...baseBuilder, gallery: {
      title: sectionForm.galleryTitle ?? baseBuilder.gallery?.title ?? '',
      images: sectionForm.galleryImages ?? baseBuilder.gallery?.images ?? [],
    }}
  } else if (editingSectionId === 5) {
    liveBuilder = { ...baseBuilder, testimonials: {
      title: sectionForm.testimonialsTitle ?? baseBuilder.testimonials?.title ?? '',
      items: sectionForm.testimonialItems ?? baseBuilder.testimonials?.items ?? [],
    }}
  } else if (editingSectionId === 6) {
    liveBuilder = { ...baseBuilder, contact: {
      address: sectionForm.address ?? baseBuilder.contact?.address ?? '',
      instagram: sectionForm.instagram ?? baseBuilder.contact?.instagram ?? '',
    }}
  }

  const previewSettings = {
    ...settings,
    theme: { ...(settings?.theme || {}), builder: liveBuilder },
    sections: sections.map((s, idx) => ({ id: s.id, name: s.name, active: activeSectionFlags[idx] })),
  }
  const previewWhatsapp = editingSectionId === 6 ? (sectionForm.whatsapp ?? whatsapp) : whatsapp

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Loader size={16} className="animate-spin" />
        Loading website data...
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Website</h1>
          <p className="text-sm text-gray-400 mt-0.5 truncate">Manage your storefront at {domain}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard/website/preview')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"
          >
            <Eye size={15} /> Preview
          </button>
          <button
            onClick={publish}
            disabled={savingSettings || settings?.published}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 active:opacity-80 transition disabled:opacity-60"
            style={{ background: PRIMARY }}
          >
            {savingSettings ? <Loader size={15} className="animate-spin" /> : <Globe size={15} />}
            {settings?.published ? 'Published' : savingSettings ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* Domain card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CREAM }}>
              <Globe size={20} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 break-all">{storefrontUrl}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {business?.domain ? (
                  <>Custom domain connected · <button onClick={() => { setShowDomainPanel(v => !v); setDomainInput(business.domain) }} className="underline hover:text-red-500">Manage</button></>
                ) : (
                  <>Free preview URL · <button onClick={() => setShowDomainPanel(v => !v)} className="underline font-medium" style={{ color: PRIMARY }}>Connect a custom domain</button></>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
            <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: PRIMARY }}>
              <CheckCircle size={14} /> {settings?.published ? 'Live' : 'Draft'}
            </div>
            <button
              onClick={() => {
                const url = business?.domain
                  ? `https://${business.domain}`
                  : `/storefront/${business?.tenantId || ''}`
                window.open(url, '_blank')
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-2 sm:py-1.5 rounded-lg hover:opacity-90 active:opacity-80 transition flex-shrink-0"
              style={{ background: PRIMARY }}
            >
              <ExternalLink size={12} /> Visit Site
            </button>
          </div>
        </div>

        {/* Custom domain panel */}
        {showDomainPanel && (
          <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4 bg-gray-50">
            {business?.domain ? (
              /* Already has a domain — show manage options */
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">{business.domain} is connected</span>
                </div>
                <p className="text-xs text-gray-500">To change your domain, remove the current one first then add the new one.</p>
                {domainError && <p className="text-xs text-red-600">{domainError}</p>}
                <button
                  onClick={handleRemoveDomain}
                  disabled={domainRemoving}
                  className="text-sm font-semibold text-red-500 border border-red-200 bg-white px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {domainRemoving ? 'Removing…' : 'Remove custom domain'}
                </button>
              </div>
            ) : domainSuccess ? (
              /* Just connected — show DNS instructions */
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">{domainSuccess.domain} registered</span>
                </div>
                <p className="text-xs text-gray-500">Add this DNS record at your domain registrar, then wait up to 24h for it to propagate:</p>
                <div className="bg-white border border-gray-200 rounded-xl p-3 font-mono text-xs space-y-1">
                  <div className="flex gap-4">
                    <span className="text-gray-400 w-12">Type</span>
                    <span className="font-semibold">CNAME</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-400 w-12">Name</span>
                    <span className="font-semibold break-all">{domainSuccess.cname?.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-400 w-12">Value</span>
                    <span className="font-semibold">{domainSuccess.cname?.value}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">SSL is handled automatically once DNS propagates.</p>
              </div>
            ) : (
              /* Input form */
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your custom domain</label>
                  <input
                    value={domainInput}
                    onChange={e => { setDomainInput(e.target.value); setDomainError('') }}
                    placeholder="store.yourbusiness.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter the domain or subdomain you own. e.g. <em>shop.mybrand.com</em></p>
                </div>
                {domainError && <p className="text-xs text-red-600">{domainError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDomain}
                    disabled={domainSaving || !domainInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    style={{ background: PRIMARY }}
                  >
                    {domainSaving ? <><Loader size={13} className="animate-spin" /> Connecting…</> : 'Connect domain'}
                  </button>
                  <button onClick={() => setShowDomainPanel(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left - controls */}
        <div className="col-span-1 lg:col-span-1 space-y-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
            {['pages', 'sections', 'design'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 sm:py-1.5 text-xs font-semibold rounded-lg capitalize transition"
                style={tab === t ? { background: PRIMARY, color: '#fff' } : { color: '#9ca3af' }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'pages' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Pages</span>
                <button aria-label="Add page" className="text-gray-400 hover:text-blue-500 active:text-blue-500 transition p-1.5 -m-1.5"><Plus size={15} /></button>
              </div>
              <div className="divide-y divide-gray-50">
                {pageList.map(p => (
                  <div
                    key={p.name}
                    onClick={() => {
                      if (!p.sectionId) return
                      const target = sections.find(sec => sec.id === p.sectionId)
                      if (target) {
                        setTab('sections')
                        openEditor(target)
                      }
                    }}
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 transition ${p.sectionId ? 'hover:bg-gray-50 active:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                      <div className="text-xs text-gray-400 truncate">{p.sectionId ? p.path : `${p.path} · coming soon`}</div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                      style={p.status === 'published' ? { background: '#dce5fd', color: PRIMARY } : { background: CREAM, color: '#92400e' }}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
                Tap a page to jump straight to its editor.
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Home Page Sections</span>
                {savingSettings && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: PRIMARY }}>
                    <Loader size={12} className="animate-spin" /> Saving...
                  </div>
                )}
              </div>
              {saveError && (
                <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-medium text-red-600 bg-red-50">
                  {saveError}
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {sections.map((s, i) => {
                  const Icon = sectionIcons[i] || Layout
                  const isEditing = editingSectionId === s.id
                  const isCategorySection = s.id === 7
                  return (
                    <div key={s.id}>
                      {/* Section row (clickable) */}
                      <div
                        className={`flex items-center gap-3 px-4 py-3.5 transition select-none ${savingSettings ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                        onClick={() => openEditor(s)}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CREAM }}>
                          <Icon size={14} style={{ color: PRIMARY }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                          <div className="text-xs text-gray-400 truncate">{s.desc}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (!savingSettings && (!isCategorySection || hasRealCategories)) toggle(i); }}
                          aria-label={`Toggle ${s.name}`}
                          className="flex-shrink-0 p-1.5 -m-1.5"
                          disabled={savingSettings || (isCategorySection && !hasRealCategories)}
                        >
                          {activeSectionFlags[i]
                            ? <ToggleRight size={24} style={{ color: PRIMARY }} />
                            : <ToggleLeft size={24} className={isCategorySection && !hasRealCategories ? 'text-gray-200' : 'text-gray-300'} />}
                        </button>
                        <div className="flex-shrink-0 text-gray-300">
                          {isEditing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expanded editing panel */}
                      {isEditing && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-50 bg-gray-50/50 space-y-3">

                          {/* --- Hero --- */}
                          {s.id === 1 && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Headline</label>
                                  <input
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                    placeholder={brandName}
                                    value={sectionForm.headline ?? settings?.theme?.builder?.hero?.headline ?? ''}
                                    onChange={e => setSectionForm(f => ({ ...f, headline: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                                  <input
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                    placeholder={business?.tagline || 'Tagline'}
                                    value={sectionForm.subtitle ?? settings?.theme?.builder?.hero?.subtitle ?? ''}
                                    onChange={e => setSectionForm(f => ({ ...f, subtitle: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">CTA button text</label>
                                  <input
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                    placeholder="Order Now"
                                    value={sectionForm.cta ?? settings?.theme?.builder?.hero?.cta ?? ''}
                                    onChange={e => setSectionForm(f => ({ ...f, cta: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Layout</label>
                                  <div className="flex gap-2">
                                    {['center', 'left'].map(l => (
                                      <button key={l} onClick={() => setSectionForm(f => ({ ...f, layout: l }))}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize border transition ${
                                          (sectionForm.layout ?? settings?.theme?.builder?.hero?.layout ?? 'center') === l
                                            ? 'border-blue-500 text-white' : 'border-gray-200 text-gray-500 bg-white'
                                        }`}
                                        style={(sectionForm.layout ?? settings?.theme?.builder?.hero?.layout ?? 'center') === l ? { background: PRIMARY, borderColor: PRIMARY } : {}}
                                      >{l}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <ImageUploadField
                                label="Background image (optional)"
                                value={sectionForm.bgImage ?? settings?.theme?.builder?.hero?.bgImage ?? ''}
                                onChange={val => setSectionForm(f => ({ ...f, bgImage: typeof val === 'string' ? val : val.url }))}
                                hint="A dark overlay is applied automatically so the headline stays readable. Leave empty to use a solid colour instead."
                              />

                              {!(sectionForm.bgImage ?? settings?.theme?.builder?.hero?.bgImage) && (
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Background colour</label>
                                  <input
                                    type="color"
                                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                                    value={sectionForm.bg ?? settings?.theme?.builder?.hero?.bg ?? PRIMARY}
                                    onChange={e => setSectionForm(f => ({ ...f, bg: e.target.value }))}
                                  />
                                </div>
                              )}
                            </>
                          )}

                          {/* --- Featured Products --- */}
                          {s.id === 2 && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Section title</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="Featured Products"
                                  value={sectionForm.productsTitle ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, productsTitle: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Products to show</label>
                                <div className="flex gap-2">
                                  {[4, 8, 12].map(n => (
                                    <button key={n} onClick={() => setSectionForm(f => ({ ...f, productCount: n }))}
                                      className="flex-1 py-2 text-xs font-semibold rounded-lg border transition"
                                      style={(sectionForm.productCount ?? 8) === n ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}
                                    >{n}</button>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-400 italic mt-2">Products come from your <button onClick={() => navigate('/dashboard/products')} className="underline" style={{ color: PRIMARY }}>product catalog</button>, most recent first.</p>
                              </div>
                            </>
                          )}

                          {/* --- About --- */}
                          {s.id === 3 && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">About text</label>
                              <textarea
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                rows={3}
                                placeholder="Tell your story..."
                                value={sectionForm.about ?? business?.description ?? ''}
                                onChange={e => setSectionForm(f => ({ ...f, about: e.target.value }))}
                              />
                            </div>
                          )}

                          {/* --- Gallery --- */}
                          {s.id === 4 && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Section title</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="Gallery"
                                  value={sectionForm.galleryTitle ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, galleryTitle: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Photos</label>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                  {(sectionForm.galleryImages || []).map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                      <img src={img?.url ?? img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                      <button
                                        onClick={() => {
                                          setSectionForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, j) => j !== idx) }))
                                          // Best-effort cleanup — only real uploads (not pasted URLs) have a storageKey.
                                          if (img?.storageKey) {
                                            const token = getStoredAccessToken()
                                            fetch(`${API_BASE}/website/image`, {
                                              method: 'DELETE',
                                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                              body: JSON.stringify({ storageKey: img.storageKey }),
                                            }).catch(err => console.error('Failed to delete gallery image from storage:', err))
                                          }
                                        }}
                                        aria-label="Remove photo"
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <ImageUploadField
                                  label="Add a photo"
                                  value={sectionForm.newImage?.url ?? ''}
                                  onChange={val => setSectionForm(f => ({
                                    ...f,
                                    newImage: typeof val === 'string' ? { url: val, storageKey: null } : val,
                                  }))}
                                  aspect="square"
                                />
                                <button
                                  onClick={() => {
                                    if (!sectionForm.newImage?.url) return
                                    setSectionForm(f => ({ ...f, galleryImages: [...(f.galleryImages || []), f.newImage], newImage: null }))
                                  }}
                                  disabled={!sectionForm.newImage?.url}
                                  className="mt-2 px-3 py-2 text-xs font-semibold text-white rounded-lg flex items-center gap-1 disabled:opacity-40"
                                  style={{ background: PRIMARY }}
                                >
                                  <Plus size={13} /> Add to gallery
                                </button>
                              </div>
                            </>
                          )}

                          {/* --- Testimonials --- */}
                          {s.id === 5 && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Section title</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="What customers say"
                                  value={sectionForm.testimonialsTitle ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, testimonialsTitle: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                {(sectionForm.testimonialItems || []).map((t, idx) => (
                                  <div key={t.id || idx} className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-2.5">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1 mb-1">
                                        {Array.from({ length: 5 }).map((_, si) => (
                                          <Star key={si} size={11} fill={si < (t.rating || 5) ? '#F0A93A' : 'none'} style={{ color: '#F0A93A' }} />
                                        ))}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">"{t.text}"</div>
                                      <div className="text-xs font-semibold text-gray-900 mt-0.5">{t.name}</div>
                                    </div>
                                    <button
                                      onClick={() => setSectionForm(f => ({ ...f, testimonialItems: f.testimonialItems.filter((_, j) => j !== idx) }))}
                                      aria-label="Remove testimonial"
                                      className="text-gray-300 hover:text-red-500 p-1 flex-shrink-0"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                                <div className="text-xs font-semibold text-gray-500">Add a testimonial</div>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                  placeholder="Customer name"
                                  value={sectionForm.newName ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, newName: e.target.value }))}
                                />
                                <textarea
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                  rows={2}
                                  placeholder="What did they say?"
                                  value={sectionForm.newText ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, newText: e.target.value }))}
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, si) => (
                                      <button key={si} onClick={() => setSectionForm(f => ({ ...f, newRating: si + 1 }))}>
                                        <Star size={16} fill={si < (sectionForm.newRating ?? 5) ? '#F0A93A' : 'none'} style={{ color: '#F0A93A' }} />
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => {
                                      const name = (sectionForm.newName || '').trim()
                                      const text = (sectionForm.newText || '').trim()
                                      if (!name || !text) return
                                      const item = { id: Date.now().toString(), name, text, rating: sectionForm.newRating ?? 5 }
                                      setSectionForm(f => ({
                                        ...f,
                                        testimonialItems: [...(f.testimonialItems || []), item],
                                        newName: '', newText: '', newRating: 5,
                                      }))
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg flex items-center gap-1"
                                    style={{ background: PRIMARY }}
                                  >
                                    <Plus size={13} /> Add
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                          {/* --- Contact / WhatsApp --- */}
                          {s.id === 6 && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">WhatsApp number</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="+2348012345678"
                                  value={sectionForm.whatsapp ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, whatsapp: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Business address (optional)</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="e.g. 12 Admiralty Way, Lekki, Lagos"
                                  value={sectionForm.address ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, address: e.target.value }))}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram handle (optional)</label>
                                <input
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                                  placeholder="yourbrand"
                                  value={sectionForm.instagram ?? ''}
                                  onChange={e => setSectionForm(f => ({ ...f, instagram: e.target.value }))}
                                />
                              </div>
                            </>
                          )}

                          {/* --- Shop by Category (no fields — auto-generated) --- */}
                          {isCategorySection && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {hasRealCategories
                                ? 'This section builds itself from the categories on your products — nothing to configure here.'
                                : 'Give at least 2 products different categories in your product catalog, and this section will turn on automatically.'}
                            </p>
                          )}

                          <div className="flex gap-2 pt-1">
                            {!isCategorySection && (
                              <button
                                onClick={() => saveSection(s)}
                                disabled={savingSettings}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition disabled:opacity-60"
                                style={{ background: PRIMARY }}
                              >
                                <Save size={13} /> Save Changes
                              </button>
                            )}
                            <button
                              onClick={() => { setEditingSectionId(null); setSectionForm({}); setSaveError('') }}
                              disabled={savingSettings}
                              className="px-4 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                            >
                              {isCategorySection ? 'Close' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template</div>
                  {savingSettings && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: PRIMARY }}>
                      <Loader size={12} className="animate-spin" /> Saving...
                    </div>
                  )}
                </div>
                {saveError && (
                  <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50">
                    {saveError}
                  </div>
                )}
                <p className="text-xs text-gray-400 mb-3">Pick the visual style closest to your brand. You can switch anytime — your content stays the same.</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(THEMES).map(theme => {
                    const isActive = activeTemplateId === theme.id
                    return (
                      <button
                        key={theme.id}
                        onClick={() => selectTemplate(theme.id)}
                        disabled={savingSettings}
                        className="text-left rounded-xl border-2 p-3 transition relative disabled:opacity-60"
                        style={{ borderColor: isActive ? PRIMARY : '#e5e7eb' }}
                      >
                        {isActive && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: PRIMARY }}>
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                        <div className="flex gap-1 mb-2.5">
                          {[theme.ink, theme.accent, theme.soft].map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border border-black/5" style={{ background: c }} />
                          ))}
                        </div>
                        <div className="text-xs font-bold text-gray-900">{theme.name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{theme.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customize</div>
                <p className="text-xs text-gray-400">Fine-tune the colors, font, and shape of the selected template. Switching templates resets these.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ink (text)</label>
                    <input
                      type="color"
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                      value={customThemeForm.ink ?? customThemeOverrides.ink ?? presetTheme.ink}
                      onChange={e => setCustomThemeForm(f => ({ ...f, ink: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Accent</label>
                    <input
                      type="color"
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                      value={customThemeForm.accent ?? customThemeOverrides.accent ?? presetTheme.accent}
                      onChange={e => setCustomThemeForm(f => ({ ...f, accent: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Soft (background)</label>
                    <input
                      type="color"
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                      value={customThemeForm.soft ?? customThemeOverrides.soft ?? presetTheme.soft}
                      onChange={e => setCustomThemeForm(f => ({ ...f, soft: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Heading font</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                    value={customThemeForm.font ?? customThemeOverrides.font ?? presetTheme.font}
                    onChange={e => setCustomThemeForm(f => ({ ...f, font: e.target.value }))}
                  >
                    {FONT_OPTIONS.map(f => (
                      <option key={f.id} value={f.family}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Card shape</label>
                  <div className="flex gap-2">
                    {RADIUS_OPTIONS.map(r => {
                      const currentRadius = customThemeForm.radius ?? customThemeOverrides.radius ?? presetTheme.radius
                      const isActive = currentRadius === r.value
                      return (
                        <button
                          key={r.id}
                          onClick={() => setCustomThemeForm(f => ({ ...f, radius: r.value }))}
                          className="flex-1 py-2 text-xs font-semibold rounded-lg border transition"
                          style={isActive ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}
                        >
                          {r.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveCustomTheme}
                    disabled={savingSettings}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition disabled:opacity-60"
                    style={{ background: PRIMARY }}
                  >
                    <Save size={13} /> Save Customization
                  </button>
                  <button
                    onClick={resetCustomTheme}
                    disabled={savingSettings}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    Reset to Preset
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">SEO</div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Page title</label>
                  <input
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                    placeholder={brandName}
                    value={designForm.seoTitle ?? settings?.seo?.title ?? ''}
                    onChange={e => setDesignForm(f => ({ ...f, seoTitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Meta description</label>
                  <textarea
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                    rows={2}
                    placeholder={`Shop ${brandName}`}
                    value={designForm.seoDescription ?? settings?.seo?.description ?? ''}
                    onChange={e => setDesignForm(f => ({ ...f, seoDescription: e.target.value }))}
                  />
                </div>
                <ImageUploadField
                  label="Social share image (optional)"
                  value={designForm.seoOgImage ?? settings?.seo?.ogImage ?? ''}
                  onChange={val => setDesignForm(f => ({ ...f, seoOgImage: val }))}
                  hint="Shown when your storefront link is shared on social media or WhatsApp."
                />

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 pt-2">Social links</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Facebook</label>
                    <input
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="yourbrand"
                      value={designForm.socialFacebook ?? settings?.social?.facebook ?? ''}
                      onChange={e => setDesignForm(f => ({ ...f, socialFacebook: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Instagram</label>
                    <input
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="yourbrand"
                      value={designForm.socialInstagram ?? settings?.social?.instagram ?? ''}
                      onChange={e => setDesignForm(f => ({ ...f, socialInstagram: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Twitter / X</label>
                    <input
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="yourbrand"
                      value={designForm.socialTwitter ?? settings?.social?.twitter ?? ''}
                      onChange={e => setDesignForm(f => ({ ...f, socialTwitter: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">TikTok</label>
                    <input
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="yourbrand"
                      value={designForm.socialTiktok ?? settings?.social?.tiktok ?? ''}
                      onChange={e => setDesignForm(f => ({ ...f, socialTiktok: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube</label>
                    <input
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
                      placeholder="yourbrand"
                      value={designForm.socialYoutube ?? settings?.social?.youtube ?? ''}
                      onChange={e => setDesignForm(f => ({ ...f, socialYoutube: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  onClick={saveSeoSocial}
                  disabled={savingSettings}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition disabled:opacity-60"
                  style={{ background: PRIMARY }}
                >
                  <Save size={13} /> Save SEO & Social
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - website preview mockup */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="hidden xs:flex gap-1.5 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 min-w-0 mx-1 sm:mx-3 bg-white border border-gray-200 rounded-lg px-3 py-1.5 sm:py-1 text-xs text-gray-400 truncate">
              {domain}
            </div>
            {/* Device toggle for the embedded preview */}
            <div className="flex bg-gray-200/60 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setPreviewDevice('desktop')}
                aria-label="Preview as desktop"
                className="p-1.5 rounded-md transition"
                style={previewDevice === 'desktop' ? { background: 'white', color: PRIMARY } : { color: '#9ca3af' }}
              >
                <Monitor size={13} />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                aria-label="Preview as mobile"
                className="p-1.5 rounded-md transition"
                style={previewDevice === 'mobile' ? { background: 'white', color: PRIMARY } : { color: '#9ca3af' }}
              >
                <Smartphone size={13} />
              </button>
            </div>
          </div>

          {/* Mockup content */}
          <div className="overflow-y-auto bg-gray-50 flex justify-center items-start py-4" style={{ maxHeight: 520 }}>
            <div
              className="bg-white overflow-hidden transition-all duration-300 w-full"
              style={previewDevice === 'mobile' ? { maxWidth: 340, borderRadius: 16 } : { maxWidth: '100%' }}
            >
              <StorefrontPreview business={business} products={products} whatsapp={previewWhatsapp} domain={domain} device={previewDevice} settings={previewSettings} theme={activeTheme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}