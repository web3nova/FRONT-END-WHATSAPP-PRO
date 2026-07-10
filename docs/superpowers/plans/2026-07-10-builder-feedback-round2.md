# Builder Feedback Round 2 — Fixes & Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 3 bugs and ship the 8 feature improvements from the user's first QA run (biziq.docx, 2026-07-10).

**Architecture:** One backend task (BACK-END-WHATSAPP-PRO, Express/Prisma) and seven frontend tasks (FRONT-END-WHATSAPP-PRO, React/Vite). All frontend content changes ride the existing JSON shapes (`theme.builder.*`, page `content.blocks`) — **no database migrations**. Frontend tasks are strictly sequential (they share `Website.jsx` / `StorefrontPreview.jsx`).

**Tech Stack:** Express, Prisma (backend); React 18, Vite, Tailwind, lucide-react (frontend).

---

## ⚠️ Repo workflow rules (every task)

1. After editing any file: `sed -i 's/\r$//' <file>` before staging.
2. Stage ONLY intended files by exact path. NEVER `git add -A` / `git add .` / `commit -a`.
3. NO `Co-Authored-By` trailer.
4. Do not push (the controller pushes at the end). Never touch stashes ("website builder + analytics frontend work", "dev4-wiring-work" are protected).
5. Work directly on `main` in each repo (it is the team's convention; controller handles fetch/rebase/push at integration).
6. Verification per task: `node --check` (backend) / `npx oxlint <files>` + `npm run build` (frontend). No test harness exists; do not invent one.

Paths: `BACK` = `/mnt/c/Users/USER/BACK-END-WHATSAPP-PRO`, `FRONT` = `/mnt/c/Users/USER/FRONT-END-WHATSAPP-PRO`.

---

### Task 1 (backend): Restoring a version must never unpublish the site

**Bug:** revision snapshots include the `published` column, so restoring a snapshot taken before the first publish flips the live site offline.

**Files:** Modify `BACK/src/modules/website/website.service.js` (`restoreRevision`, end of file ~line 305).

- [ ] Change the final lines of `restoreRevision` from:

```js
  return updateLiveSettings(tenantId, { ...revision.snapshot, draft: null });
```

to:

```js
  // Snapshots capture `published` as it was at the time — but whether the
  // site is online is an operational switch, not part of the design being
  // restored. Stripping it here also fixes every already-stored snapshot.
  const { published: _published, ...designFields } = revision.snapshot || {};
  return updateLiveSettings(tenantId, { ...designFields, draft: null });
```

- [ ] `sed -i 's/\r$//' src/modules/website/website.service.js && node --check src/modules/website/website.service.js` → exit 0.
- [ ] Commit: `git add src/modules/website/website.service.js && git commit -m "fix: restoring a revision no longer flips the site's published state"`

---

### Task 2 (frontend): og-image `[object Object]` fix + decorative-chrome tooltips

**Files:** Modify `FRONT/src/pages/dashboard/Website.jsx` (~line 2369), `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (cart/user icons ~line 594, NGN tab ~line 622).

- [ ] In Website.jsx, the "Social share image" `ImageUploadField` currently does `onChange={val => setDesignForm(f => ({ ...f, seoOgImage: val }))}` — the upload path passes `{url, storageKey}`, which stringifies to `[object Object]` and breaks og:image. Change to:

```js
onChange={val => setDesignForm(f => ({ ...f, seoOgImage: typeof val === 'string' ? val : val.url }))}
```

Also add to that field: `hint="Recommended: 1200×630 (landscape) — this is the card image chat apps show."`

- [ ] In StorefrontPreview.jsx, the storefront chrome is decorative (ordering happens via WhatsApp). Add explanatory tooltips so it doesn't read as broken:
  - `<User size={17} …>` → wrap or add `title="Customer accounts — coming soon"` on a wrapping `<span>` (lucide icons accept no title prop reliably; wrap in `<span title="…">`).
  - The cart `<div className="relative">` (ShoppingBag + count) → add `title="No checkout cart — orders happen in WhatsApp chat"`.
  - The NGN currency tab `div` → add `title="Prices shown in Nigerian Naira"`.
- [ ] `sed -i 's/\r$//'` both files; `npx oxlint` both; `npm run build` → success.
- [ ] Commit both files: `fix: social share image stored as URL (was [object Object]); explain decorative storefront chrome`

---

### Task 3 (frontend): Testimonials — render the section title, add role, richer cards

**Bug:** the editor's "Section title" saves to `theme.builder.testimonials.title` but no variant renders it.

**Files:** Modify `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (ctx build ~line 380), `FRONT/src/pages/dashboard/storefronts/sections/TestimonialsSection.jsx`, `FRONT/src/pages/dashboard/Website.jsx` (testimonials editor items).

- [ ] StorefrontPreview.jsx: where `testimonialItems` is derived (~line 226), add `const testimonialsTitle = testimonialsCfg.title || 'What customers say'` and pass `testimonialsTitle` through `ctx` (next to `testimonialItems`).
- [ ] TestimonialsSection.jsx: every variant replaces its hardcoded heading with `testimonialsTitle` from ctx:
  - Catalog: `<div className="text-[10px] font-bold uppercase …">{testimonialsTitle}</div>`
  - Boutique: same substitution on its "WHAT CUSTOMERS SAY" label.
  - Magazine: has no heading — add a small uppercase kicker above the stars: `<div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">{testimonialsTitle}</div>`
- [ ] Add optional `role` per testimonial (e.g. "Lagos · repeat customer"):
  - Website.jsx testimonials editor: next to each item's name input add a small input bound to `item.role` (placeholder `Role / location (optional)`), saved with the item exactly like `name`.
  - Renderers: show role under/next to the name in muted small text when present: Boutique `<div className="text-[11px] text-gray-400">{t.role}</div>`, Magazine append `— {t.role}` to the byline, Catalog append `, {t.role}` after the name span.
- [ ] Richer boutique card: quote glyph + larger quote text. In BoutiqueTestimonials' card, render the text as `<p className="text-sm leading-relaxed text-gray-700">"{t.text}"</p>` preceded by name+role+stars grouped — keep the carousel logic untouched.
- [ ] Lint both edited files + `npm run build` → success.
- [ ] Commit: `fix: testimonials section title actually renders; feat: role line and richer testimonial cards`

---

### Task 4 (frontend): Hero — Right layout + gradient background

**Files:** Modify `FRONT/src/pages/dashboard/Website.jsx` (hero editor + save path + ctx build inputs), `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (ctx), `FRONT/src/pages/dashboard/storefronts/sections/HeroSection.jsx`.

- [ ] **Right layout.** Website.jsx hero editor Layout row: `{['center', 'left'].map(...)}` → `{['center', 'left', 'right'].map(...)}`. HeroSection.jsx BoutiqueHero consumes `heroLayout` at ~lines 89–117; extend the ternaries:

```js
textAlign: heroLayout === 'left' ? 'left' : heroLayout === 'right' ? 'right' : 'center',
```

container: `heroLayout === 'left' ? '' : heroLayout === 'right' ? 'max-w-xl ml-auto' : 'max-w-xl mx-auto'`; subtitle: right gets `max-w-md ml-auto`; buttons row: right gets `justify-end`, center keeps `justify-center`, left none.

- [ ] **Gradient.** Add optional second background color `bg2` (empty string = solid):
  - Website.jsx: hero editor Background group gains, under the existing color row, a second color control with a clear button:

```jsx
<div className="flex items-center gap-3">
  <input type="color" className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
    value={sectionForm.bg2 || settings?.theme?.builder?.hero?.bg2 || '#111827'}
    onChange={e => setSectionForm(f => ({ ...f, bg2: e.target.value }))} />
  <span className="text-[11px] text-gray-400 leading-snug flex-1">Optional second colour — creates a gradient. </span>
  {(sectionForm.bg2 ?? settings?.theme?.builder?.hero?.bg2) && (
    <button type="button" onClick={() => setSectionForm(f => ({ ...f, bg2: '' }))}
      className="text-[11px] font-semibold text-gray-400 hover:text-red-500 underline">Solid only</button>
  )}
</div>
```

  - Seed `bg2: b.hero?.bg2 || ''` in `openEditor` for id 1; add `bg2: sectionForm.bg2 ?? hero.bg2 ?? ''` to BOTH `liveBuilder` hero objects (save path and preview path).
  - StorefrontPreview.jsx: derive `const heroBg2 = hero.bg2 || ''` next to `heroBg` and pass `heroBg2` through ctx.
  - HeroSection.jsx: in every variant that paints `heroBg`, replace the solid/gradient expression:

```js
background: heroBgImage
  ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${heroBgImage}) center/cover no-repeat`
  : heroBg2
    ? `linear-gradient(135deg, ${heroBg} 0%, ${heroBg2} 100%)`
    : `linear-gradient(135deg, ${heroBg} 0%, ${heroBg}cc 100%)`,
```

(Destructure `heroBg2` from ctx in each variant that uses it. CatalogHero paints `INK`, leave it.)

- [ ] Hero image hint: on the hero Background `ImageUploadField`, extend the hint to `"Recommended: 1600×900 (landscape). A dark overlay is applied automatically so the headline stays readable."`
- [ ] Lint all three files + `npm run build` → success.
- [ ] Commit: `feat: hero right-alignment layout and gradient backgrounds`

---

### Task 5 (frontend): About section — custom title, own image, side-by-side

**Today:** About renders hardcoded "OUR STORY" and reuses the business logo as its image.

**Files:** Modify `FRONT/src/pages/dashboard/Website.jsx` (About editor id===3 + both liveBuilder paths + openEditor seed), `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (ctx), `FRONT/src/pages/dashboard/storefronts/sections/AboutSection.jsx`.

- [ ] Website.jsx About editor (currently only the "About text" textarea) gains, above the textarea:

```jsx
<div>
  <label className="block text-xs font-semibold text-gray-500 mb-1">Section title</label>
  <input className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
    placeholder="Our Story"
    value={sectionForm.aboutTitle ?? ''}
    onChange={e => setSectionForm(f => ({ ...f, aboutTitle: e.target.value }))} />
</div>
<ImageUploadField
  label="Section image (optional)"
  value={sectionForm.aboutImage ?? settings?.theme?.builder?.about?.image ?? ''}
  onChange={val => setSectionForm(f => ({ ...f, aboutImage: typeof val === 'string' ? val : val.url }))}
  hint="Recommended: square, about 800×800. Leave empty to use your logo."
/>
```

- [ ] `openEditor` id 3 seeding becomes `setSectionForm({ about: b.about?.text || business?.description || '', aboutTitle: b.about?.title || '', aboutImage: b.about?.image || '' })`.
- [ ] BOTH `liveBuilder` about objects (save + preview paths) become:

```js
about: {
  text: sectionForm.about ?? baseBuilder.about?.text ?? business?.description ?? '',
  title: sectionForm.aboutTitle ?? baseBuilder.about?.title ?? '',
  image: sectionForm.aboutImage ?? baseBuilder.about?.image ?? '',
}
```

(Check the existing save path for id 3 — it currently writes `{ text: … }` only; keep its exact fallback chain for `text`.)
- [ ] StorefrontPreview.jsx: where `aboutText` is derived, add `const aboutTitle = (builder.about?.title || '').trim() || 'Our Story'` and `const aboutImage = builder.about?.image || logoUrl`; pass both through ctx.
- [ ] AboutSection.jsx: read the file first; replace every hardcoded "OUR STORY"/"Our Story" heading with `{aboutTitle}` and every use of `logoUrl` as the section image with `aboutImage` (destructure both from ctx). The boutique variant already lays out image beside text — keep its layout, just swap the sources.
- [ ] Lint all three + `npm run build` → success.
- [ ] Commit: `feat: About section — custom title and image (falls back to logo)`

---

### Task 6 (frontend): Q&A block type + FAQ pages render as accordions

**Files:** Modify `FRONT/src/pages/dashboard/Website.jsx` (BLOCK_TYPES, emptyBlock, PageForm, savePage filter, FAQ pattern), `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (custom-page block renderer ~line 649).

- [ ] Website.jsx:
  - `BLOCK_TYPES` gains `{ type: 'qa', label: 'Q&A' }`.
  - `emptyBlock`: `if (type === 'qa') return { _key: newBlockKey(), type, question: '', answer: '' }`.
  - PageForm block renderer gains:

```jsx
{b.type === 'qa' && (
  <div className="space-y-2">
    <input className="w-full text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
      placeholder="Question" value={b.question ?? ''} onChange={e => updateBlock(i, { question: e.target.value })} />
    <textarea className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
      rows={2} placeholder="Answer" value={b.answer ?? ''} onChange={e => updateBlock(i, { answer: e.target.value })} />
  </div>
)}
```

  - `savePage` block filter: qa blocks are kept when `(b.question || '').trim()` is non-empty (add a branch beside the section/image/text checks).
  - FAQ pattern (`PAGE_PATTERNS`, id 'faq') becomes:

```js
blocks: () => [
  { ...emptyBlock('heading'), text: 'Frequently Asked Questions' },
  emptyBlock('qa'),
  emptyBlock('qa'),
  emptyBlock('qa'),
  sectionBlock('contact'),
],
```

- [ ] StorefrontPreview.jsx custom-page renderer: beside the heading/image/paragraph branches add:

```jsx
if (b.type === 'qa') {
  return (
    <details key={i} className={`${wrapClass} group`}>
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 border border-gray-100 rounded-[var(--sf-radius)] px-4 py-3 text-sm font-semibold" style={{ color: INK }}>
        {b.question}
        <span className="text-gray-300 transition-transform group-open:rotate-45 text-lg leading-none">+</span>
      </summary>
      <p className="text-sm leading-relaxed text-gray-600 px-4 pt-2 pb-1">{b.answer}</p>
    </details>
  )
}
```

(`INK` is already in scope in that renderer; `wrapClass` is defined just above the heading branch — declare the qa branch after `wrapClass`.)
- [ ] Lint both + `npm run build` → success.
- [ ] Commit: `feat: Q&A accordion blocks for custom pages; FAQ layout uses them`

---

### Task 7 (frontend): Diverse color templates + font no longer changes with template

**Files:** Modify `FRONT/src/lib/themes.js`, `FRONT/src/pages/dashboard/Website.jsx` (`selectTemplate`), gallery upload hint.

- [ ] themes.js: add four genuinely distinct presets to `THEMES` (same shape as existing entries):

```js
forest: { id: 'forest', name: 'Forest', description: 'Deep greens and warm cream — natural, grounded, organic', ink: '#14532d', accent: '#16a34a', soft: '#f0fdf4', font: 'Lora', radius: 12 },
ocean: { id: 'ocean', name: 'Ocean', description: 'Navy and teal over cool white — calm and trustworthy', ink: '#0c4a6e', accent: '#0d9488', soft: '#f0f9ff', font: 'Inter', radius: 16 },
blush: { id: 'blush', name: 'Blush', description: 'Rose and charcoal — soft, warm, beauty-forward', ink: '#3f3f46', accent: '#e11d48', soft: '#fff1f2', font: 'Playfair Display', radius: 20 },
noir: { id: 'noir', name: 'Noir', description: 'Black, gold accents — premium night-mode luxury', ink: '#111111', accent: '#ca8a04', soft: '#fafaf9', font: 'Archivo', radius: 2 },
```

(Check how the Color Template cards render — they iterate `THEMES`, so new entries appear automatically. Verify `FONT_OPTIONS` includes 'Lora'; if not, add it there too.)
- [ ] Website.jsx `selectTemplate`: switching templates currently wipes all custom overrides (`customTheme: {}`). Fonts are a personal choice, not a color decision — preserve a font override across template switches:

```js
const previousCustom = settings?.theme?.customTheme || {}
const updatedTheme = { ...previousTheme, templateId, customTheme: previousCustom.font ? { font: previousCustom.font } : {} }
```

Update the comment above the function accordingly (colors/radius reset, font survives).
- [ ] Gallery editor's `ImageUploadField`s: add `hint="Recommended: square, about 1000×1000 — gallery images are cropped to a square grid."` (only if the gallery field has no hint yet; if it has one, extend it).
- [ ] Lint + `npm run build` → success.
- [ ] Commit: `feat: four new distinct color templates; font choice survives template switches`

---

### Task 8 (frontend): Version history entries describe themselves

**Files:** Modify `FRONT/src/pages/dashboard/Website.jsx` (revisions list render ~line 2506, and the `timeAgo` row).

- [ ] `listRevisions` already returns each row's full `snapshot`. Replace the row body so each entry shows what it contains (import nothing new — `THEMES` is already imported):

```jsx
{revisions.map(r => {
  const snapTheme = THEMES[r.snapshot?.theme?.templateId]?.name || 'Custom'
  const snapSections = Array.isArray(r.snapshot?.sections)
    ? r.snapshot.sections.filter(s => s.active !== false).length
    : null
  return (
    <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <span className="text-xs text-gray-600">{timeAgo(r.createdAt)}</span>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{snapTheme} theme</span>
          {snapSections !== null && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{snapSections} sections on</span>
          )}
          {Array.isArray(r.snapshot?.navigation) && r.snapshot.navigation.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">custom menu</span>
          )}
        </div>
      </div>
      <button
        onClick={() => restoreRevisionAction(r.id)}
        disabled={restoringId === r.id}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-60 flex-shrink-0"
      >
        {restoringId === r.id ? <Loader size={12} className="animate-spin" /> : null}
        Restore
      </button>
    </div>
  )
})}
```

- [ ] Lint + `npm run build` → success.
- [ ] Commit: `feat: version history entries show theme, sections, and menu at a glance`

---

### Task 9: Integration

- [ ] Frontend: `npx oxlint src/` shows no NEW issues vs before; `npm run build` succeeds.
- [ ] Both repos: `git fetch origin` → rebase if origin moved (stash-dance around it) → push `main`.
- [ ] Post-deploy sanity: builder loads, testimonials title renders, restore no longer unpublishes.

## Explicitly out of scope
- Testimonial avatar photos (role line only, this round).
- Auto-converting existing heading+paragraph FAQ pages to qa blocks (new pages/patterns only).
- "Remove image" hero button — already exists (the X in the upload field).
- Cropping/resizing uploads — hints only this round.

---

### Task 10 (frontend, added on user request): Optional background colour/gradient for every homepage section

**Goal:** the hero got gradients in Task 4; extend an optional background (solid colour or two-colour gradient) to the other five sections (Products, About, Gallery, Testimonials, Contact). Default (nothing set) must render EXACTLY as today.

**Approach:** one wrapper, not five section-file edits. Backgrounds live in `theme.builder.<section>.bg` / `.bg2` (empty string = default). The homepage render walk (`StorefrontPreview.jsx` ~line 813) and the custom-page section-block branch (~line 657) wrap each rendered section in a `<div>` carrying the background style.

**Files:**
- Modify: `FRONT/src/pages/dashboard/StorefrontPreview.jsx`
- Modify: `FRONT/src/pages/dashboard/Website.jsx`

- [ ] **StorefrontPreview.jsx** — near the SECTION_RENDERERS build (~line 403), add:

```js
  // Optional per-section background (solid or two-colour gradient) from the
  // section editors. Empty = no wrapper style, sections render as always.
  const sectionBgStyle = (styleKey) => {
    const cfg = builder[styleKey] || {}
    if (!cfg.bg) return undefined
    return {
      background: cfg.bg2
        ? `linear-gradient(135deg, ${cfg.bg} 0%, ${cfg.bg2} 100%)`
        : cfg.bg,
    }
  }
```

Homepage walk becomes:

```jsx
{sectionOrder.map(id => {
  const { Component, show, styleKey } = SECTION_RENDERERS[id]
  if (!show) return null
  return (
    <div key={id} style={sectionBgStyle(styleKey)}>
      <Component variant={sectionStyles[styleKey] || 'boutique'} ctx={ctx} />
    </div>
  )
})}
```

Custom-page section-block branch (`if (b.type === 'section')`) wraps the same way:

```jsx
return (
  <div key={i} style={sectionBgStyle(b.sectionType)}>
    <Renderer variant={b.variant || 'boutique'} ctx={ctx} />
  </div>
)
```

(`builder` is already in scope in StorefrontPreviewBody; hero is excluded automatically because `sectionBgStyle('hero')` is only applied where hero is NOT rendered through this walk — verify hero renders separately/first; if hero IS in the walk, special-case `styleKey === 'hero'` to return undefined so the hero's own background stays in charge.)

- [ ] **Website.jsx** — add a small shared control component near `DesignAccordionSection`:

```jsx
// Optional per-section background: solid colour, or gradient when a second
// colour is set. Empty string = theme default. Used by every section editor.
function SectionBackgroundControl({ bg, bg2, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Section background <span className="font-normal text-gray-400">(optional)</span></label>
      <div className="flex items-center gap-3 border border-gray-100 rounded-lg p-3">
        <input type="color" className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
          value={bg || '#ffffff'}
          onChange={e => onChange({ bg: e.target.value, bg2 })} />
        <input type="color" className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0"
          value={bg2 || '#ffffff'}
          onChange={e => onChange({ bg, bg2: e.target.value })} />
        <span className="text-[11px] text-gray-400 leading-snug flex-1">
          First colour fills the section; add the second for a gradient. Pick light colours — section text stays dark.
        </span>
        {(bg || bg2) && (
          <button type="button" onClick={() => onChange({ bg: '', bg2: '' })}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-500 underline flex-shrink-0">Default</button>
        )}
      </div>
    </div>
  )
}
```

- [ ] Drop `<SectionBackgroundControl bg={sectionForm.sectionBg ?? ''} bg2={sectionForm.sectionBg2 ?? ''} onChange={({ bg, bg2 }) => setSectionForm(f => ({ ...f, sectionBg: bg, sectionBg2: bg2 }))} />` at the BOTTOM of each section editor for ids 2, 3, 4, 5, 6 (NOT the hero — it has its own Background group).
- [ ] `openEditor` seeds for ids 2/3/4/5/6 each gain: `sectionBg: b.<key>?.bg || '', sectionBg2: b.<key>?.bg2 || ''` (keys: products/about/gallery/testimonials/contact).
- [ ] `saveSection` branches for ids 2/3/4/5/6: each `builder.<key>` object gains `bg: sectionForm.sectionBg ?? builder.<key>?.bg ?? ''` and `bg2: sectionForm.sectionBg2 ?? builder.<key>?.bg2 ?? ''` (for id 3, use the `prevAbout` pattern already there).
- [ ] BOTH `liveBuilder` preview branches for ids 2/3/4/5/6 gain the same two fields with `sectionForm.sectionBg ?? baseBuilder.<key>?.bg ?? ''` fallbacks — this is what makes the preview follow the pickers live.
- [ ] Verify: `npx oxlint` both files (no NEW issues; the `domain` warning pre-exists), `npm run build` succeeds.
- [ ] Commit both files: `feat: optional background colour or gradient for every storefront section`
