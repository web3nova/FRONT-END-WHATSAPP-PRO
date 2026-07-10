# Builder Feedback Round 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7 issues from the user's second QA doc (Biziq 2.docx): expiring image URLs (critical), invisible back-to-editor label, small product-modal image, description-polluted search, About text duplicated in hero, and the storefront rendering desktop layout on real phones (root cause of "layouts look bad on devices") plus mobile product-card polish.

**Architecture:** Task 1 is backend (stable public asset URLs via a redirect route — no schema change). Tasks 2–4 are frontend, strictly sequential (shared files). The responsive fix (Task 4) introduces `device="auto"`: the live storefront detects the real viewport, while the builder's desktop/mobile toggle keeps working exactly as before.

**Tech Stack:** Express + S3-presigner (backend); React 18, Vite, Tailwind (frontend).

---

## ⚠️ Repo workflow rules (every task)

1. After editing any file: `sed -i 's/\r$//' <file>` before staging.
2. Stage ONLY intended files by exact path. NEVER `git add -A` / `git add .` / `commit -a`.
3. NO `Co-Authored-By` trailer.
4. Do not push (controller pushes at the end). Never touch stashes ("website builder + analytics frontend work", "dev4-wiring-work" are protected).
5. Work directly on `main` in each repo.
6. Verify: `node --check` (backend) / `npx oxlint <files>` + `npm run build` (frontend). The `domain` unused-param warning in StorefrontPreview.jsx:148 is pre-existing. No test harness exists; don't invent one.

Paths: `BACK` = `/mnt/c/Users/USER/BACK-END-WHATSAPP-PRO`, `FRONT` = `/mnt/c/Users/USER/FRONT-END-WHATSAPP-PRO`.

---

### Task 1 (backend, CRITICAL): Stable public URLs for website images

**Bug:** `uploadAsset` returns `storage.getSignedUrl(key)` — a 1-hour presigned URL — and the builder stores it permanently (gallery, hero background, About image, page images, share image). Everything breaks an hour after upload.

**Fix:** a public, unauthenticated redirect route `GET /assets/website-images/...` that 302s to a fresh signed URL, and the website module returns that stable URL from uploads and the media library. Only `website-images/` keys are servable — these are storefront-public by nature. Other modules' use of `uploadAsset` (private docs etc.) is NOT touched.

**Files:**
- Modify: `BACK/src/modules/website/website.service.js` (uploadImage, listMedia)
- Modify: `BACK/src/modules/website/website.routes.js` (+ public route)
- Modify: `BACK/src/modules/website/website.controller.js` (+ controller)

- [ ] **Controller** (website.controller.js — add after `getStorefront`; `config` may need importing from `../../config/index.js`, check existing import conventions in the file first):

```js
// Public, unauthenticated. Stored image URLs point here so they never expire —
// each hit redirects to a fresh short-lived signed URL. Only website-images/*
// is servable: those are storefront-public by definition.
export const getPublicAsset = asyncHandler(async (req, res) => {
  const key = req.params[0] ? `website-images/${req.params[0]}` : '';
  if (!key || key.includes('..')) {
    throw new BadRequestError('Invalid asset key.');
  }
  const url = await websiteService.getPublicAssetUrl(key);
  res.set('Cache-Control', 'public, max-age=1800');
  return res.redirect(302, url);
});
```

- [ ] **Service** (website.service.js — add near uploadImage; `getAssetUrl` is already imported there):

```js
// Stable app-hosted URL for a website image. Stored in builder JSON instead
// of a presigned URL (those expire after an hour — the bug this fixes).
export function publicAssetUrl(storageKey) {
  return `${config.appUrl}/assets/${storageKey.replace(/^website-images\//, 'website-images/')}`;
}

export async function getPublicAssetUrl(storageKey) {
  return getAssetUrl(storageKey);
}
```

Check what `config` is called/imported in this file (other services import `{ config }` from `../../config/index.js`); add the import if missing. NOTE: the stable URL path shape must match the route below — `${config.appUrl}/assets/website-images/<tenant>/<file>`. Simplify `publicAssetUrl` to just `` `${config.appUrl}/assets/${storageKey}` `` since keys already start with `website-images/`.

- [ ] In `uploadImage`, return the stable URL instead of the signed one:

```js
  return { url: publicAssetUrl(asset.storageKey), storageKey: asset.storageKey };
```

- [ ] In `listMedia`, the mapped items currently use `url: await getAssetUrl(m.storageKey)` — replace with `url: publicAssetUrl(m.storageKey)` (and drop the now-unneeded `Promise.all`/`async` mapping if nothing else awaits — keep it simple and synchronous if possible). Media-library picks get stored in builder JSON, so they must be stable too.
- [ ] **Route** (website.routes.js — on the PUBLIC router, next to the existing public storefront route):

```js
/**
 * @openapi
 * /assets/website-images/{path}:
 *   get:
 *     tags: [Website]
 *     summary: Public website image — redirects to a fresh signed URL
 *     responses:
 *       302: { description: Redirect to the image }
 */
publicWebsiteRoutes.get(/^\/assets\/website-images\/(.+)$/, websiteController.getPublicAsset);
```

IMPORTANT: find where `publicWebsiteRoutes` is mounted (grep `publicWebsiteRoutes` across `src/`). The stable URL is `${config.appUrl}/assets/website-images/...` — if the public router is mounted under a prefix (e.g. `/api/website`), either mount this route so the final path is exactly `/assets/website-images/...` at the app root (preferred: register directly in app.js next to the public-routes mounting), or adjust `publicAssetUrl` to produce the real final path. The stored URL and the served route MUST agree — verify by tracing the mount chain, and state in your report what final path shape you shipped. Also confirm `config.appUrl` is set correctly for production (it defaults to localhost:4000 — if a `RENDER_EXTERNAL_URL` or similar is used elsewhere for absolute URLs, follow that existing convention).

With the regex route, `req.params[0]` is the capture group — the controller code above assumes exactly that.

- [ ] Old stored signed URLs remain broken by design (test data; user re-uploads). State this in the commit body.
- [ ] `sed -i 's/\r$//'` all three files; `node --check` each → exit 0.
- [ ] Commit: `fix: website images get stable public URLs — stored presigned links expired after an hour`

---

### Task 2 (frontend): Back-to-editor always labeled; search matches name/category only; hero stops showing About text

**Files:** Modify `FRONT/src/pages/dashboard/WebsitePreview.jsx`, `FRONT/src/pages/dashboard/StorefrontPreview.jsx`, `FRONT/src/pages/dashboard/storefronts/sections/HeroSection.jsx`.

- [ ] WebsitePreview.jsx: the back button's label `<span className="hidden sm:inline">Back to editor</span>` is invisible on narrow screens — change to `<span>Editor</span>` shown at all widths (keep the ArrowLeft icon).
- [ ] StorefrontPreview.jsx `shopProducts` filter (~line 278): drop the description clause:

```js
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
```

- [ ] HeroSection.jsx `BoutiqueHero`: it renders `aboutText` under the headline (`{aboutText && (<div className=…>{aboutText}</div>)}`) — a leftover from before the hero had its own subtitle. Remove that block and drop `aboutText` from the destructure. Verify no other hero variant uses `aboutText`.
- [ ] Lint all three + `npm run build` → success.
- [ ] Commit all three: `fix: visible preview back label, name/category-only search, hero no longer duplicates About text`

---

### Task 3 (frontend): Product modal image fills its space

**Files:** Modify `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (modal image block ~line 441).

- [ ] Replace the letterboxed image block:

```jsx
            <div className="relative flex items-center justify-center" style={{ background: PASTELS[0], minHeight: 220 }}>
              {selectedProduct.imageUrl
                ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full object-contain" style={{ maxHeight: 300 }} />
                : <div className="text-5xl opacity-20 py-10">📦</div>}
```

with an edge-to-edge cover image:

```jsx
            <div className="relative" style={{ background: PASTELS[0] }}>
              {selectedProduct.imageUrl
                ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full object-cover" style={{ maxHeight: 440, minHeight: 280 }} />
                : <div className="flex items-center justify-center text-5xl opacity-20" style={{ minHeight: 220 }}>📦</div>}
```

Keep the close button exactly as is (it's absolutely positioned in this container — verify it still overlays correctly).
- [ ] Lint + `npm run build` → success.
- [ ] Commit: `feat: product modal image fills the panel edge-to-edge`

---

### Task 4 (frontend): Real-viewport responsiveness + mobile product-card polish

**Root cause:** `StorefrontPage.jsx` renders `<StorefrontPreview … device="desktop" />`, so real phones get the desktop layout squeezed — all `isMobile` styling only ever ran in the builder's preview toggle.

**Files:** Modify `FRONT/src/pages/dashboard/StorefrontPreview.jsx`, `FRONT/src/pages/StorefrontPage.jsx`, `FRONT/src/pages/dashboard/storefronts/sections/ProductsSection.jsx`.

- [ ] **`device="auto"`.** In `StorefrontPreviewBody`, replace `const isMobile = device === 'mobile'` with:

```js
  // 'auto' = live storefront: follow the real viewport. Explicit
  // 'desktop'/'mobile' = builder preview toggle, unchanged behavior.
  const [viewportMobile, setViewportMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  )
  useEffect(() => {
    if (device !== 'auto') return
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = (e) => setViewportMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [device])
  const isMobile = device === 'auto' ? viewportMobile : device === 'mobile'
```

(`useState`/`useEffect` are already imported in the file.)
- [ ] StorefrontPage.jsx: change `device="desktop"` to `device="auto"` in its `<StorefrontPreview …>` call.
- [ ] Leave WebsitePreview.jsx and Website.jsx passing explicit `desktop`/`mobile` — the builder toggle must keep behaving exactly as before.
- [ ] **Product cards on phones.** READ `ProductsSection.jsx` fully first. Fix the mobile failure mode (cramped many-across cards with names truncated to "aka…"):
  - Any horizontal card strip / grid that renders more than 2 columns when `isMobile`: switch to `grid grid-cols-2 gap-3` on mobile (keep desktop as is).
  - Product names on mobile: no single-line hard `truncate` — use 2-line clamp instead (`display:-webkit-box` pattern or Tailwind `line-clamp-2` if available in the config; otherwise inline style `{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }`).
  - Price/badge sizes: keep readable (≥11px), badges may drop to icon/short form on mobile.
  - Also check the homepage category chips/circles row: if it squeezes on mobile, make it horizontally scrollable (`overflow-x-auto`, `flex-nowrap`, hidden scrollbar) instead of shrinking.
- [ ] **Quick per-variant sanity pass** (visual reasoning over the code, no pixel work): for Hero, Gallery, Testimonials, Contact variants confirm `isMobile` branches exist and produce a single-column, non-overflowing layout. Fix only clear offenders (e.g. fixed widths >360px, >2 columns on mobile, font sizes >40px). Note anything larger in your report instead of redesigning.
- [ ] Lint all edited files + `npm run build` → success.
- [ ] Commit: `fix: live storefront adapts to real device viewport; mobile product cards readable`

---

### Task 5: Integration

- [ ] Frontend + backend: final `npm run build` / `node --check`, then controller pushes both repos (stash-dance: `git stash push -m "temp CRLF"`, fetch, rebase, push, pop; resolve pop conflicts with `git checkout --ours`).
- [ ] Post-deploy: re-upload one gallery image and confirm its URL starts with the backend host `/assets/website-images/…` and still loads after an hour (user can verify next session); open the live storefront on a phone and confirm the mobile layout engages.

## Out of scope
- Re-signing/migrating already-stored expired URLs (user re-uploads test images).
- Full mobile visual redesign (only the concrete offenders above).
- Product images from the products module (different storage path; check later if the same expiry bug applies there).
