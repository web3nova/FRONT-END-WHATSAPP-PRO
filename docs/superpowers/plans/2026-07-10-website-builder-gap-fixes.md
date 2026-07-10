# Website Builder Gap Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 9 confirmed gaps in the website builder found in the 2026-07-10 audit (item #2 of the original 10 — Navigation tab losing saved menus — was found to be already handled at `Website.jsx:1237` and is dropped).

**Architecture:** Two repos. Backend fixes (Tasks 1–2) land in `BACK-END-WHATSAPP-PRO` (Express/Prisma, deployed on Render, auto-migrates). Frontend fixes (Tasks 3–10) land in `FRONT-END-WHATSAPP-PRO` (React/Vite SPA on Vercel). Task 10 adds a Vercel Routing Middleware at the frontend repo root so social-media crawlers get server-rendered OG tags. No database migrations are needed — the per-page SEO description rides inside the existing `content` JSON column (`z.record(z.unknown())` already accepts it).

**Tech Stack:** Express, Prisma, Zod (backend); React 18, Vite, react-router, Tailwind (frontend); Vercel Routing Middleware (edge runtime).

---

## ⚠️ Repo workflow rules (apply to EVERY task)

Both working trees have ~100+ permanently dirty files (CRLF-only noise). Deviating from these rules has previously swept all of them into a commit.

1. **After editing any file**, strip CRs before staging: `sed -i 's/\r$//' <file>`
2. **Stage only intended files by exact path.** NEVER `git add -A`, `git add .`, or `git commit -a`.
3. **No `Co-Authored-By` trailer** on any commit.
4. Work on a feature branch `website-builder-gap-fixes` in each repo; integration at the end is rebase on `origin/main` → `merge --ff-only` → push to main (the user's approved default).
5. Never touch the two pre-existing stashes (`website builder + analytics frontend work`, `dev4-wiring-work`).

**Testing note:** neither repo has a working automated test harness (backend `"test": "node --test"` exists but `tests/unit` and `tests/integration` are empty and services are bound to a live Prisma client; frontend has no test runner at all). Adding a harness is out of scope. Each task therefore ends with concrete verification: `node --check` / `npm run lint` / `npm run build`, plus exact manual verification steps against the dev servers. Backend dev server: `npm run dev` in `BACK-END-WHATSAPP-PRO` (requires `.env` with `DATABASE_URL`). Frontend dev server: `npm run dev` in `FRONT-END-WHATSAPP-PRO`.

**Paths:** `BACK` = `/mnt/c/Users/USER/BACK-END-WHATSAPP-PRO`, `FRONT` = `/mnt/c/Users/USER/FRONT-END-WHATSAPP-PRO` (WSL view of `C:\Users\USER\...`).

---

### Task 1: Restore-revision must clear the pending draft (bug #1, backend)

**Why:** `restoreRevision` writes the snapshot to the live columns but leaves the `draft` column intact. `getSettings` (controller) merges `draft` over live, so after a restore the editor still shows the pre-restore draft with "unpublished changes", and the next Publish silently overwrites the restore with the stale draft.

**Files:**
- Modify: `BACK/src/modules/website/website.service.js:294-301` (the `restoreRevision` function)

- [ ] **Step 1: Create the feature branch**

```bash
cd /mnt/c/Users/USER/BACK-END-WHATSAPP-PRO
git stash push -m "pre-existing CRLF noise" && git fetch origin && git checkout -b website-builder-gap-fixes origin/main && git stash pop || true
# resolve any pop conflicts with: git checkout --ours <file>
```

- [ ] **Step 2: Change `restoreRevision` to discard the draft**

Current code (end of `website.service.js`, ~line 294):

```js
export async function restoreRevision(tenantId, id) {
  const business = await requireBusiness(tenantId);
  const revision = await prisma.websiteSettingsRevision.findUnique({ where: { id } });
  if (!revision || revision.businessId !== business.id) {
    throw new NotFoundError('Revision not found.');
  }
  return updateLiveSettings(tenantId, revision.snapshot);
}
```

Replace the final `return` line so it becomes:

```js
export async function restoreRevision(tenantId, id) {
  const business = await requireBusiness(tenantId);
  const revision = await prisma.websiteSettingsRevision.findUnique({ where: { id } });
  if (!revision || revision.businessId !== business.id) {
    throw new NotFoundError('Revision not found.');
  }
  // A pending draft would shadow the restored state in the editor (getSettings
  // merges draft over live) and the next publish would overwrite the restore,
  // so restoring — an explicit choice of a whole state — discards the draft.
  return updateLiveSettings(tenantId, { ...revision.snapshot, draft: null });
}
```

(`draft` is a nullable Json column; `updateLiveSettings` passes `data` straight into the Prisma `upsert`'s `update`/`create`, so `draft: null` clears it in both branches. The revision `snapshot` never contains a `draft` key — it is destructured out in `snapshotCurrentLive` — so there is no key collision.)

- [ ] **Step 3: Syntax check + strip CRs**

```bash
sed -i 's/\r$//' src/modules/website/website.service.js
node --check src/modules/website/website.service.js
```
Expected: no output (exit 0).

- [ ] **Step 4: Manual verification (requires dev server + auth token)**

With `npm run dev` running and `$TOKEN` a valid tenant JWT:

```bash
# 1. Stage a draft edit
curl -s -X PUT localhost:PORT/api/website/settings -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"seo":{"title":"DRAFT TITLE"}}'
# 2. List revisions, grab an id
curl -s localhost:PORT/api/website/settings/revisions -H "Authorization: Bearer $TOKEN"
# 3. Restore it
curl -s -X POST localhost:PORT/api/website/settings/revisions/<id>/restore -H "Authorization: Bearer $TOKEN"
# 4. GET settings — hasUnpublishedChanges must now be false and seo.title must NOT be "DRAFT TITLE"
curl -s localhost:PORT/api/website/settings -H "Authorization: Bearer $TOKEN"
```
(Adjust the path prefix to match how `src/app.js` mounts the website router.) If no dev DB is available, verification is by code review of the diff plus Step 3.

- [ ] **Step 5: Commit**

```bash
git add src/modules/website/website.service.js
git commit -m "fix: restoring a settings revision discards the pending draft"
```

---

### Task 2: Discard-draft endpoint (bug #6, backend half)

**Why:** Once edits are staged into `draft`, the merchant's only exits are Publish or a revision restore. There is no way to just throw the draft away and go back to the live state.

**Files:**
- Modify: `BACK/src/modules/website/website.service.js` (add `discardDraft` after `publishSettings`, ~line 258)
- Modify: `BACK/src/modules/website/website.controller.js` (add controller after `publishSettings`, ~line 92)
- Modify: `BACK/src/modules/website/website.routes.js` (add route after the `/settings/publish` route)

- [ ] **Step 1: Add the service function**

In `website.service.js`, directly after the `publishSettings` function:

```js
// Throw away staged draft edits, reverting the editor to the live state.
// The live columns are untouched, so no revision snapshot is taken.
export async function discardDraft(tenantId) {
  const business = await requireBusiness(tenantId);
  return prisma.websiteSettings.upsert({
    where: { businessId: business.id },
    create: { businessId: business.id, ...defaultSettings },
    update: { draft: null },
  });
}
```

- [ ] **Step 2: Add the controller**

In `website.controller.js`, directly after the `publishSettings` controller (mirror `getSettings`'s merged response shape so the frontend can reuse the row as-is):

```js
export const discardDraft = asyncHandler(async (req, res) => {
  const { draft, ...settings } = await websiteService.discardDraft(getTenantId(req));
  return ok(res, { ...settings, hasUnpublishedChanges: false });
});
```

- [ ] **Step 3: Add the route**

In `website.routes.js`, directly after the `/settings/publish` route registration:

```js
/**
 * @openapi
 * /website/settings/discard:
 *   post:
 *     tags: [Website]
 *     summary: Discard staged draft changes, reverting the editor to the live settings
 *     responses:
 *       200: { description: Live website settings (draft cleared) }
 */
router.post('/settings/discard', websiteController.discardDraft);
```

- [ ] **Step 4: Syntax check + strip CRs**

```bash
sed -i 's/\r$//' src/modules/website/website.service.js src/modules/website/website.controller.js src/modules/website/website.routes.js
node --check src/modules/website/website.service.js && node --check src/modules/website/website.controller.js && node --check src/modules/website/website.routes.js
```
Expected: exit 0.

- [ ] **Step 5: Manual verification** — stage a draft edit (PUT `/website/settings` with any field), POST `/website/settings/discard`, then GET `/website/settings` and confirm `hasUnpublishedChanges: false` and the staged field reverted.

- [ ] **Step 6: Commit**

```bash
git add src/modules/website/website.service.js src/modules/website/website.controller.js src/modules/website/website.routes.js
git commit -m "feat: POST /website/settings/discard to drop staged draft edits"
```

---

### Task 3: Discard-changes button in the builder (bug #6, frontend half)

**Files:**
- Modify: `FRONT/src/pages/dashboard/Website.jsx` (handler after `publishChanges` ~line 561; button in the header actions row ~line 1155)

- [ ] **Step 1: Create the feature branch (frontend repo)**

```bash
cd /mnt/c/Users/USER/FRONT-END-WHATSAPP-PRO
git stash push -m "pre-existing CRLF noise" && git fetch origin && git checkout -b website-builder-gap-fixes origin/main && git stash pop || true
# resolve any pop conflicts with: git checkout --ours <file>
```

- [ ] **Step 2: Add the `discardChanges` handler**

In `Website.jsx`, directly after the `publishChanges` function (after its closing `}`, ~line 561):

```js
  // Throw away staged edits and fall back to the live site's settings. The
  // response is the merged live row, so re-seed settings + section state from
  // it and clear every draft-local form, same shapes as the initial load.
  const discardChanges = async () => {
    if (savingSettings) return
    if (!window.confirm('Discard all unpublished changes? Your live site stays as it is.')) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/website/settings/discard`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Discard failed')
      const body = await res.json().catch(() => null)
      const live = body?.data || body
      setSettings(live)
      if (Array.isArray(live?.sections) && live.sections.length) {
        const merged = defaultSections.map(ds => {
          const found = live.sections.find(s => s.name === ds.name || s.id === ds.id)
          return found ? { ...ds, active: found.active ?? ds.active } : ds
        })
        setSections(merged)
        setActiveSectionFlags(merged.map(s => s.active))
      }
      setNavDraft(null)
      setEditingSectionId(null)
      setSectionForm({})
      setCustomThemeForm({})
      setDesignForm({})
    } catch (err) {
      console.error('Failed to discard draft:', err)
      setSaveError('Could not discard changes. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }
```

- [ ] **Step 3: Add the button**

In the header actions row (the `div` holding the History / Preview / Publish buttons, ~line 1155), insert between the Preview button and the Publish button:

```jsx
          {settings?.hasUnpublishedChanges && (
            <button
              onClick={discardChanges}
              disabled={savingSettings}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60"
            >
              <X size={15} /> Discard
            </button>
          )}
```

(`X` is already imported from `lucide-react` at the top of the file.)

- [ ] **Step 4: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/Website.jsx
npm run lint
```
Expected: no new errors versus the pre-change baseline (run lint before editing if a baseline is needed).

- [ ] **Step 5: Manual verification** — `npm run dev`, log in, open Website, change anything (e.g. toggle a section), confirm a "Discard" button appears next to Publish, click it, confirm the change reverts and the button disappears.

- [ ] **Step 6: Commit**

```bash
git add src/pages/dashboard/Website.jsx
git commit -m "feat: discard unpublished website changes from the builder header"
```

---

### Task 4: "Take offline" (unpublish) control (bug #7)

**Files:**
- Modify: `FRONT/src/pages/dashboard/Website.jsx` (handler after `discardChanges`; UI in the domain card status row ~line 1205)

- [ ] **Step 1: Add the `unpublishSite` handler**

Directly after the `discardChanges` function added in Task 3:

```js
  // Take the live storefront offline. `published` is a live-only column that
  // bypasses draft (see backend updateSettings), so this takes effect
  // immediately; publishChanges already handles turning it back on.
  const unpublishSite = async () => {
    if (savingSettings) return
    if (!window.confirm('Take your site offline? Visitors will see "storefront not found" until you publish again.')) return
    const token = getStoredAccessToken()
    if (!token) return
    setSavingSettings(true)
    setSaveError('')
    try {
      const res = await fetch(`${API_BASE}/website/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: false }),
      })
      if (!res.ok) throw new Error('Unpublish failed')
      setSettings(s => ({ ...(s || {}), published: false }))
    } catch (err) {
      console.error('Failed to unpublish:', err)
      setSaveError('Could not take the site offline. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }
```

- [ ] **Step 2: Add the control to the domain card**

In the domain card's status row (the flex div containing the `Live`/`Draft` chip and the Visit Site button, ~line 1205), insert right after the Live/Draft chip `div`:

```jsx
            {settings?.published && (
              <button
                onClick={unpublishSite}
                disabled={savingSettings}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition underline flex-shrink-0 disabled:opacity-60"
              >
                Take offline
              </button>
            )}
```

Note the existing Publish button's disabled/label logic (`settings?.published && !settings?.hasUnpublishedChanges`) already re-enables and re-labels itself once `published` is false — no change needed there. `publishChanges` also already writes `published: true` explicitly for the not-published case, so republishing works.

- [ ] **Step 3: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/Website.jsx
npm run lint
```

- [ ] **Step 4: Manual verification** — with a published site: click "Take offline", confirm; status chip flips to "Draft", opening `/storefront/<tenantId>` in an incognito tab shows the 404 "Storefront Unavailable" card; click Publish Changes; storefront loads again.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/Website.jsx
git commit -m "feat: take-site-offline control in the website builder"
```

---

### Task 5: Fix "Open Live Site" fabricated domain in full-screen preview (bug #3)

**Why:** `WebsitePreview.jsx:66` fabricates `brandname.web3nova.com` when the tenant has no custom domain, so the "Open Live Site" button is a dead link for most tenants.

**Files:**
- Modify: `FRONT/src/pages/dashboard/WebsitePreview.jsx:64-67` and the anchor at `:105-114`

- [ ] **Step 1: Compute a real live URL**

Replace lines 64–67:

```js
  const brandName = business?.displayName || 'Your Brand'
  const whatsapp = business?.whatsappNumber || ''
  const domain = business?.domain || `${brandName.toLowerCase().replace(/\s+/g, '')}.web3nova.com`
  const activeTheme = { ...(THEMES[settings?.theme?.templateId] || THEMES.minimal), ...(settings?.theme?.customTheme || {}), sectionStyles: settings?.theme?.sectionStyles || {} }
```

with:

```js
  const brandName = business?.displayName || 'Your Brand'
  const whatsapp = business?.whatsappNumber || ''
  // Same fallback as Website.jsx: custom domain if connected, else the
  // platform-hosted storefront URL. Never a fabricated domain.
  const liveUrl = business?.domain
    ? `https://${business.domain}`
    : `${window.location.origin}/storefront/${business?.tenantId || ''}`
  const domain = business?.domain || `${window.location.host}/storefront/${business?.tenantId || ''}`
  const activeTheme = { ...(THEMES[settings?.theme?.templateId] || THEMES.minimal), ...(settings?.theme?.customTheme || {}), sectionStyles: settings?.theme?.sectionStyles || {} }
```

(`domain` stays as a display-only string — it's shown in the mobile top bar and passed to `StorefrontPreview` for cosmetic chrome.)

- [ ] **Step 2: Point the anchor at `liveUrl`**

In the "Open Live Site" anchor (~line 105), change `href={`https://${domain}`}` to `href={liveUrl}`.

- [ ] **Step 3: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/WebsitePreview.jsx
npm run lint
```

- [ ] **Step 4: Manual verification** — as a tenant without a custom domain, open Website → Preview → "Open Live Site"; it must open `<origin>/storefront/<tenantId>` and load the storefront.

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/WebsitePreview.jsx
git commit -m "fix: Open Live Site links to the real storefront URL, not a fabricated domain"
```

---

### Task 6: Redirect unknown page slugs on the live storefront (bug #4)

**Why:** `/storefront/:tenantId/<garbage>` silently renders Home under the wrong URL — no 404, no canonical redirect.

**Files:**
- Modify: `FRONT/src/pages/dashboard/StorefrontPreview.jsx:53-101` (the `RoutedStorefrontPreview` component)

- [ ] **Step 1: Move the path helpers above the effect and redirect on no-match**

In `RoutedStorefrontPreview`, the `base`/`homePath`/`shopPath`/`pagePath` constants (currently ~line 84, after the `useEffect`) must move to just before the `useEffect` so the effect can use `homePath`. Then change the effect's final branch. Current effect body (~lines 64–83):

```js
  useEffect(() => {
    if (!viewParam) {
      setView('home')
      setActivePage(null)
      return
    }
    if (viewParam === 'shop') {
      setView('shop')
      setActivePage(null)
      return
    }
    // Custom page slug. `pages` may still be loading on first mount — this
    // effect re-runs when they land, so links straight to a page slug still
    // deep-link correctly once data lands.
    const match = pages.find(p => p.slug === viewParam)
    if (match) {
      setActivePage(match)
      setView('page')
    }
  }, [viewParam, pages])
```

New version (helpers moved above, unknown slug redirects):

```js
  const base = tenantId ? `/storefront/${tenantId}` : ''
  const homePath = base || '/'
  const shopPath = `${base}/shop`
  const pagePath = (slug) => `${base}/${slug}`

  useEffect(() => {
    if (!viewParam) {
      setView('home')
      setActivePage(null)
      return
    }
    if (viewParam === 'shop') {
      setView('shop')
      setActivePage(null)
      return
    }
    const match = pages.find(p => p.slug === viewParam)
    if (match) {
      setActivePage(match)
      setView('page')
    } else {
      // Unknown or unpublished slug. `pages` is complete by the time this
      // mounts (StorefrontPage only renders us after data lands), so redirect
      // to the canonical home URL instead of silently rendering Home under a
      // wrong address.
      navigate(homePath, { replace: true })
    }
  }, [viewParam, pages])
```

Delete the now-duplicated `base`/`homePath`/`shopPath`/`pagePath` block from its old position below the effect. The `nav` object below continues to reference the same names — no other changes.

- [ ] **Step 2: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/StorefrontPreview.jsx
npm run lint
```

- [ ] **Step 3: Manual verification** — open `/storefront/<tenantId>/definitely-not-a-page`; the URL must snap back to `/storefront/<tenantId>` (replace, no history entry). A real published page slug must still deep-link correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dashboard/StorefrontPreview.jsx
git commit -m "fix: redirect unknown storefront page slugs to the canonical home URL"
```

---

### Task 7: Make section nav links reliable on the routed storefront (bug #5)

**Why:** `scrollToSection` (`StorefrontPreview.jsx:156`) navigates home then scrolls after a single fixed 50 ms timeout. On the routed live site the home sections may not have mounted yet, so the scroll silently no-ops.

**Files:**
- Modify: `FRONT/src/pages/dashboard/StorefrontPreview.jsx:156-162`

- [ ] **Step 1: Replace the single timeout with a bounded retry**

Current:

```js
  const scrollToSection = (key) => {
    setNavOpen(false)
    navigateHome()
    setTimeout(() => {
      document.getElementById(sectionId(key))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }
```

New:

```js
  const scrollToSection = (key) => {
    setNavOpen(false)
    navigateHome()
    // On the routed storefront navigateHome() triggers a real route change,
    // so the target section may not be mounted yet — poll briefly (up to ~1s)
    // instead of hoping one 50ms tick is enough.
    let attempts = 0
    const tryScroll = () => {
      const el = document.getElementById(sectionId(key))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (attempts++ < 20) setTimeout(tryScroll, 50)
    }
    setTimeout(tryScroll, 50)
  }
```

- [ ] **Step 2: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/StorefrontPreview.jsx
npm run lint
```

- [ ] **Step 3: Manual verification** — on the live storefront, go to `/storefront/<tenantId>/shop`, then click a nav link pointing at a home section (e.g. "About"); the page must navigate home AND scroll to the section. Repeat from a custom page.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dashboard/StorefrontPreview.jsx
git commit -m "fix: section nav links scroll reliably after routed navigation"
```

---

### Task 8: Per-view document titles + per-page SEO description (bug #8)

**Why:** the live storefront sets `document.title` and meta description once from site-level settings; navigating to Shop or a custom page never updates them, and pages have no description field at all. The description rides inside the page's existing `content` JSON (backend `content: z.record(z.unknown())` already accepts arbitrary keys — no backend change).

**Files:**
- Modify: `FRONT/src/pages/dashboard/StorefrontPreview.jsx` (`RoutedStorefrontPreview`, add an effect)
- Modify: `FRONT/src/pages/dashboard/Website.jsx` (PageForm field ~line 144; edit-seeding ~line 781; `savePage` ~line 824; `openPageEditor` seeding)

- [ ] **Step 1: Sync title/description with the current view (routed storefront only)**

In `RoutedStorefrontPreview` (`StorefrontPreview.jsx`), after the existing view-syncing `useEffect` from Task 6, add:

```js
  // Keep the tab title and meta description in sync with the current view.
  // StorefrontPage sets the site-level tags once on load; this layers the
  // per-view value on top, on the live (routed) storefront only — the
  // unrouted builder preview must never touch the dashboard's title.
  const { business, settings } = props
  useEffect(() => {
    const brand = business?.displayName || ''
    const siteTitle = settings?.seo?.title || brand
    if (view === 'shop') {
      document.title = brand ? `Shop — ${brand}` : 'Shop'
    } else if (view === 'page' && activePage) {
      document.title = brand ? `${activePage.title} — ${brand}` : activePage.title
      const desc = activePage.content?.seoDescription
      if (desc) {
        let tag = document.querySelector('meta[name="description"]')
        if (!tag) {
          tag = document.createElement('meta')
          tag.setAttribute('name', 'description')
          document.head.appendChild(tag)
        }
        tag.content = desc
      }
    } else if (siteTitle) {
      document.title = siteTitle
    }
  }, [view, activePage, business, settings])
```

(`RoutedStorefrontPreview` receives `business`/`settings` via `{...props}` — destructure them as shown.)

- [ ] **Step 2: Add the description field to PageForm**

In `Website.jsx`'s `PageForm` component, after the Title/Slug grid (`</div>` closing the `grid grid-cols-2` at ~line 144), insert:

```jsx
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Search &amp; share description <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
          rows={2}
          placeholder="Shown in search results and link previews for this page."
          value={pageForm.seoDescription ?? ''}
          onChange={e => setPageForm(f => ({ ...f, seoDescription: e.target.value }))}
        />
      </div>
```

- [ ] **Step 3: Seed and save the field**

In the edit-seeding code (~line 781, inside `openPageEditor` where `existingBlocks` is built), add `seoDescription` to the `setPageForm` call that seeds the form for an existing page — alongside `title`, `slug`, `published`, `blocks`:

```js
      seoDescription: p.content?.seoDescription || '',
```

In `savePage` (~line 824), change:

```js
      const content = { blocks }
```

to:

```js
      const content = { blocks }
      if (pageForm.seoDescription?.trim()) content.seoDescription = pageForm.seoDescription.trim()
```

- [ ] **Step 4: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/StorefrontPreview.jsx src/pages/dashboard/Website.jsx
npm run lint
```

- [ ] **Step 5: Manual verification** — (a) edit a custom page, set a description, save, re-open the editor and confirm it round-trips; (b) on the live storefront navigate Home → Shop → custom page and watch the tab title change at each step; (c) on the custom page, inspect `<meta name="description">` in devtools and confirm it shows the page's description; (d) confirm the dashboard builder preview does NOT change the dashboard tab title.

- [ ] **Step 6: Commit**

```bash
git add src/pages/dashboard/StorefrontPreview.jsx src/pages/dashboard/Website.jsx
git commit -m "feat: per-view storefront titles and per-page SEO description"
```

---

### Task 9: Pages tab reflects real section state (bug #9)

**Why:** `pageList` (`Website.jsx:31-36`) is a hardcoded constant that always shows About/Contact as "published" even when those sections are toggled off.

**Files:**
- Modify: `FRONT/src/pages/dashboard/Website.jsx:31-36` (constant) and the render at `:1254` (badge style)

- [ ] **Step 1: Replace the constant with a derivation**

Replace the module-level constant:

```js
const pageList = [
  { name: 'Home', path: '/', status: 'published', sectionId: 1 },
  { name: 'Shop / Products', path: '/shop', status: 'published', sectionId: 2 },
  { name: 'About', path: '/about', status: 'published', sectionId: 3 },
  { name: 'Contact', path: '/contact', status: 'published', sectionId: 6 },
]
```

with a function:

```js
// Home/Shop are always live; About/Contact mirror their section toggles so
// the Pages tab doesn't claim "published" for a hidden section.
function builtInPages(sections, flags) {
  const isActive = (id) => {
    const idx = sections.findIndex(s => s.id === id)
    return idx === -1 ? true : !!flags[idx]
  }
  return [
    { name: 'Home', path: '/', status: 'published', sectionId: 1 },
    { name: 'Shop / Products', path: '/shop', status: 'published', sectionId: 2 },
    { name: 'About', path: '/about', status: isActive(3) ? 'published' : 'hidden', sectionId: 3 },
    { name: 'Contact', path: '/contact', status: isActive(6) ? 'published' : 'hidden', sectionId: 6 },
  ]
}
```

Inside the `Website` component (near the other derived values, e.g. after `activeOutlook` ~line 342), add:

```js
  const pageList = builtInPages(sections, activeSectionFlags)
```

- [ ] **Step 2: Style the "hidden" badge distinctly**

In the render (~line 1270), change the status badge's fixed style:

```jsx
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={{ background: '#dce5fd', color: PRIMARY }}
                      >
```

to:

```jsx
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={p.status === 'published' ? { background: '#dce5fd', color: PRIMARY } : { background: '#f3f4f6', color: '#9ca3af' }}
                      >
```

- [ ] **Step 3: Lint + strip CRs**

```bash
sed -i 's/\r$//' src/pages/dashboard/Website.jsx
npm run lint
```

- [ ] **Step 4: Manual verification** — toggle the About section off in the Sections tab; the Pages tab must show About as grey "hidden"; toggle back on, it returns to "published".

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/Website.jsx
git commit -m "fix: Pages tab shows hidden status for toggled-off sections"
```

---

### Task 10: Server-side OG tags for crawlers (bug #10)

**Why:** OG/meta tags are injected client-side (`StorefrontPage.jsx:40-67`); WhatsApp/Facebook/Twitter crawlers don't execute JS, so shared storefront links show no preview card — the most damaging gap for a WhatsApp-commerce product. Fix: a Vercel Routing Middleware at the frontend repo root that detects crawler user-agents on storefront URLs, fetches the public storefront payload from the backend, and returns a minimal HTML document with the tags. Real browsers fall through to the SPA untouched.

**Known limitation (accepted):** if `seo.ogImage` stores a time-limited signed R2 URL, the image in cached link previews can eventually expire. Fixing that (a stable public image route) is out of scope; note it in the commit message.

**Files:**
- Create: `FRONT/middleware.js` (repo root, next to `vercel.json`)

- [ ] **Step 1: Create `middleware.js`**

```js
// Vercel Routing Middleware (edge). Social/chat crawlers don't execute JS,
// so the SPA's client-side og-tag injection is invisible to them — shared
// storefront links show no preview card. For known crawler user-agents on
// storefront URLs, serve a minimal HTML document with the tags instead.
// Real browsers (and any error path) fall through to the SPA untouched.

const BOT_RE = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|slackbot|discord|pinterest|snapchat|googlebot|bingbot/i

// Hosts where the SPA itself lives — storefronts appear under /storefront/:tenantId.
// Any other host is a tenant's custom domain, where the storefront is the root.
const PLATFORM_HOSTS = new Set(['biziq.online', 'www.biziq.online', 'localhost'])

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  if (!BOT_RE.test(ua)) return

  const url = new URL(request.url)
  const host = url.hostname
  const isPlatformHost = PLATFORM_HOSTS.has(host) || host.endsWith('.vercel.app')

  let query = null
  if (isPlatformHost) {
    const m = url.pathname.match(/^\/storefront\/([^/]+)/)
    if (m) query = `tenantId=${encodeURIComponent(m[1])}`
  } else {
    query = `domain=${encodeURIComponent(host)}`
  }
  if (!query) return

  // Same backend base URL the SPA uses (VITE_API_URL in Vercel project env).
  const apiBase = process.env.VITE_API_URL
  if (!apiBase) return

  try {
    const res = await fetch(`${apiBase}/website/storefront?${query}`)
    if (!res.ok) return
    const body = await res.json()
    const data = body?.data || body
    const business = data?.business || {}
    const seo = data?.settings?.seo || {}
    const title = escapeHtml(seo.title || business.displayName || 'Storefront')
    const description = escapeHtml(seo.description || business.description || `Shop ${seo.title || business.displayName || ''}`.trim())
    const image = escapeHtml(seo.ogImage || business.logoUrl || '')
    const pageUrl = escapeHtml(url.href)

    const html = `<!doctype html><html><head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${image ? `<meta property="og:image" content="${image}">` : ''}
<meta property="og:url" content="${pageUrl}">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
</head><body>${title}</body></html>`

    return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } })
  } catch {
    return
  }
}

export const config = {
  // Storefront paths on platform hosts; root/shop/page paths for custom
  // domains. Non-storefront platform paths produce no query above and fall
  // through even for bots.
  matcher: ['/storefront/:path*', '/', '/shop', '/:view'],
}
```

- [ ] **Step 2: Strip CRs + lint**

```bash
sed -i 's/\r$//' middleware.js
npm run lint
```

- [ ] **Step 3: Verify env var exists on Vercel**

`VITE_API_URL` is already a Vite build-time var for the SPA — confirm it is set as a Vercel *project* environment variable (middleware reads it at runtime via `process.env`). Check with `vercel env ls` or in the dashboard. If it's only in a local `.env`, add it to the Vercel project for Production + Preview before deploying.

- [ ] **Step 4: Manual verification (needs a preview deploy — middleware doesn't run under `vite dev`)**

```bash
# after a Vercel preview deploy:
curl -s -A "WhatsApp/2.23.20" https://<preview-url>/storefront/<tenantId> | head -20
# Expect: the minimal HTML doc with og:title / og:description / og:image
curl -s -A "Mozilla/5.0" https://<preview-url>/storefront/<tenantId> | head -5
# Expect: the SPA's index.html (Vite asset tags), NOT the minimal doc
```
Then paste a real storefront URL into a WhatsApp chat and confirm a preview card renders.

- [ ] **Step 5: Commit**

```bash
git add middleware.js
git commit -m "feat: serve OG meta tags to social crawlers via edge middleware

Known limitation: og:image may be a time-limited signed URL; a stable
public image route is follow-up work."
```

---

### Task 11: Integration — push both repos

- [ ] **Step 1: Backend** — in `BACK`: `git fetch origin && git rebase origin/main && git checkout main && git merge --ff-only website-builder-gap-fixes && git push origin main` (stash-dance around the rebase/checkout if the CRLF noise interferes: `git stash push -m "pre-existing CRLF noise"` … `git stash pop`, resolve pop conflicts with `git checkout --ours`).
- [ ] **Step 2: Frontend** — same sequence in `FRONT`.
- [ ] **Step 3: Verify deploys** — Render auto-deploys backend from main (no migrations in this work, so no drift risk); Vercel auto-deploys frontend. Re-run the Task 10 curl checks against production.

---

## Out of scope (explicitly)

- `sitemap.xml` / `robots.txt` per tenant (mentioned alongside bug #10 in the audit; needs its own design for multi-tenant custom domains).
- Stable public URL for `og:image` (see Task 10 limitation).
- Original bug #2 (Navigation tab losing saved menus) — already handled at `Website.jsx:1237`; no work needed.
- Adding a test harness to either repo.
