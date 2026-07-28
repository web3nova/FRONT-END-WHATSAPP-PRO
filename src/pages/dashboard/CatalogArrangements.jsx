import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Plus, Trash2,
  Loader2, CheckCircle2, AlertCircle, X, ChevronRight,
  Globe, ShoppingBag, RefreshCw,
  Search, Star, Tag,
} from 'lucide-react'
import {
  getCommerceStatus, detectCommerce, autoSetupCommerce, setupCommerce, enableCommerce, syncArrangement, syncAllProducts,
  listArrangements, getArrangement, createArrangement, updateArrangement,
  deleteArrangement, setDefaultArrangement,
  createSection, updateSection, deleteSection,
  addItemToSection, removeItemFromSection,
  listProducts,
} from '../../api/commerceApi'
import { resolveImageUrl } from '../../lib/utils'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

// Plain function (not a hook) so every component in this file can call
// toast(msg, type) directly without prop-drilling a callback down through
// arrangement -> section -> item. Dispatches a DOM event that <ToastHost/>
// (mounted once, below) picks up and renders as a real non-blocking toast —
// previously this used alert(), which blocks the entire tab on every sync/
// save action and looks like a browser error dialog, not part of the app.
let toastId = 0
function toast(msg, type = 'success') {
  window.dispatchEvent(new CustomEvent('biziq:toast', { detail: { id: ++toastId, msg, type } }))
}

function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const item = e.detail
      setToasts((prev) => [...prev, item])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id))
      }, 4000)
    }
    window.addEventListener('biziq:toast', handler)
    return () => window.removeEventListener('biziq:toast', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-sm text-white animate-[fadeIn_0.15s_ease-out]"
          style={{ background: t.type === 'error' ? '#DC2626' : PRIMARY }}
        >
          {t.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default function CatalogArrangementsPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [arrangements, setArrangements] = useState([])
  const [selectedArrangement, setSelectedArrangement] = useState(null)

  const loadStatus = async () => {
    setLoading(true)
    try {
      const s = await getCommerceStatus()
      setStatus(s)
      if (s.status !== 'not_setup') {
        const arr = await listArrangements()
        setArrangements(arr)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStatus() }, [])

  let content
  if (loading) {
    content = (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={24} className="animate-spin text-gray-300" />
        <span className="text-sm text-gray-400">Checking for existing catalog…</span>
      </div>
    )
  } else if (error) {
    content = (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
      </div>
    )
  } else if (!status || status.status === 'not_setup') {
    content = <CommerceSetup onComplete={loadStatus} />
  } else if (selectedArrangement) {
    content = (
      <ArrangementDetail
        arrangementId={selectedArrangement}
        onBack={() => setSelectedArrangement(null)}
        onUpdate={loadStatus}
      />
    )
  } else {
    content = (
      <ArrangementsList
        arrangements={arrangements}
        status={status}
        onSelect={setSelectedArrangement}
        onRefresh={loadStatus}
      />
    )
  }

  return (
    <>
      {content}
      <ToastHost />
    </>
  )
}

// ── Commerce Setup ──────────────────────────────────────────

function CommerceSetup({ onComplete }) {
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState('')
  const [reasonMessage, setReasonMessage] = useState('')
  const [businessManagerId, setBusinessManagerId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Try to set the catalog up end-to-end automatically: reuse an existing
  // catalog if the WABA already has one, otherwise resolve the owning Business
  // Manager and create + enable one — no manual ID entry unless we truly can't.
  const handleAutoSetup = async () => {
    setDetecting(true)
    setError('')
    setReasonMessage('')
    try {
      const result = await autoSetupCommerce()
      if (result.status === 'active' || result.status === 'partial' || result.hasCatalog) {
        onComplete()
      } else {
        setError('not_found')
        if (result.reason === 'create_failed' && result.message) setReasonMessage(result.message)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setDetecting(false)
    }
  }

  const handleCreateCatalog = async () => {
    if (!businessManagerId.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      await setupCommerce(businessManagerId.trim())
      await enableCommerce()
      onComplete()
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  // Attempt full auto-setup on mount — creates the catalog automatically for
  // businesses that connected WhatsApp through us, without any manual step.
  useEffect(() => { handleAutoSetup() }, [])

  if (detecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={24} className="animate-spin text-gray-300" />
        <span className="text-sm text-gray-400">Setting up your WhatsApp catalog…</span>
      </div>
    )
  }

  if (error === 'not_found') {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#dce5fd' }}>
            <ShoppingBag size={26} style={{ color: PRIMARY }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't set up your catalog automatically</h2>
          <p className="text-sm text-gray-500">We tried to create and connect a catalog to your WhatsApp Business account, but couldn't finish it on our own{reasonMessage ? ':' : '.'}</p>
          {reasonMessage && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-3 inline-block">{reasonMessage}</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="text-sm text-gray-700 leading-relaxed">
            <p className="mb-2">To get started:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600">
              <li>Go to <strong>Meta Business Settings</strong> → Commerce Manager</li>
              <li>Create a catalog (or use an existing one)</li>
              <li>Connect it to your WhatsApp Business number</li>
              <li>Come back here and click <strong>Check Again</strong></li>
            </ol>
          </div>
          <button
            onClick={handleAutoSetup}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Create a catalog from here</h3>
            <p className="text-sm text-gray-500">
              We normally pick up your Business Manager automatically when you connect WhatsApp. If it wasn't detected, paste the ID below and we'll create and connect a catalog for you.
            </p>
            <a
              href="https://business.facebook.com/settings/info"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold mt-1 inline-block"
              style={{ color: PRIMARY }}
            >
              Find your Business Manager ID in Meta Business Settings →
            </a>
          </div>
          <input
            value={businessManagerId}
            onChange={e => setBusinessManagerId(e.target.value)}
            placeholder="Business Manager ID"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          />
          {createError && (
            <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{createError}</div>
          )}
          <button
            onClick={handleCreateCatalog}
            disabled={creating || !businessManagerId.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
            style={{ background: PRIMARY }}
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? 'Creating…' : 'Create Catalog'}
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
        <button
          onClick={handleAutoSetup}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition"
          style={{ background: PRIMARY }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return null
}

// ── Arrangements List ───────────────────────────────────────

function ArrangementsList({ arrangements, status, onSelect, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSegment, setNewSegment] = useState('')
  const [creating, setCreating] = useState(false)
  const [syncingAll, setSyncingAll] = useState(false)

  const handleSyncAll = async () => {
    setSyncingAll(true)
    try {
      const res = await syncAllProducts()
      const parts = []
      if (res.synced) parts.push(`Synced ${res.synced} product(s) to WhatsApp`)
      if (res.removed) parts.push(`removed ${res.removed} stale item(s) no longer in your catalog`)
      toast(parts.length ? parts.join(', ') : (res.message || 'Nothing to sync'))
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSyncingAll(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createArrangement({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        customerSegment: newSegment.trim() || null,
      })
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      setNewSegment('')
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this arrangement? This cannot be undone.')) return
    try {
      await deleteArrangement(id)
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await setDefaultArrangement(id)
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Catalog Arrangements</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {status.commerceEnabled ? 'Shopping is enabled on your WhatsApp profile' : 'Set up your catalog arrangement'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!status.commerceEnabled && (
            <button
              onClick={async () => { try { await enableCommerce(); onRefresh(); toast('Commerce enabled') } catch (e) { toast(e.message, 'error') } }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition"
              style={{ background: PRIMARY }}
            >
              <Globe size={13} /> Enable Shopping
            </button>
          )}
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            title="Push every active product straight to your WhatsApp catalog — no arrangement needed"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50"
          >
            {syncingAll ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {syncingAll ? 'Syncing…' : 'Sync all products'}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            <Plus size={14} /> New Arrangement
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Create Arrangement</h3>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Arrangement name (e.g. Default Catalog)"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Short description (optional)"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          />
          <input
            value={newSegment}
            onChange={e => setNewSegment(e.target.value)}
            placeholder="Customer segment tag (optional, e.g. vip)"
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {arrangements.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          <Package size={32} className="mx-auto mb-3 text-gray-300" />
          No arrangements yet. Create one to start organizing your products.
        </div>
      ) : (
        <div className="grid gap-3">
          {arrangements.map(a => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition cursor-pointer"
              onClick={() => onSelect(a.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dce5fd' }}>
                    <Package size={18} style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{a.name}</span>
                      {a.isDefault && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: PRIMARY }}>Default</span>
                      )}
                    </div>
                    {a.description && <div className="text-xs text-gray-400 truncate">{a.description}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">{a._count?.sections ?? 0} sections</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!a.isDefault && (
                    <button
                      onClick={e => { e.stopPropagation(); handleSetDefault(a.id) }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition"
                      title="Set as default"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(a.id) }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Arrangement Detail ──────────────────────────────────────

function ArrangementDetail({ arrangementId, onBack, onUpdate }) {
  const [arrangement, setArrangement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const a = await getArrangement(arrangementId)
      setArrangement(a)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [arrangementId])

  const [showNewSection, setShowNewSection] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [creatingSection, setCreatingSection] = useState(false)

  const handleCreateSection = async () => {
    if (!sectionName.trim()) return
    setCreatingSection(true)
    try {
      await createSection({ arrangementId, name: sectionName.trim() })
      setSectionName('')
      setShowNewSection(false)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setCreatingSection(false)
    }
  }

  const handleDeleteSection = async (id) => {
    if (!confirm('Delete this section and all items in it?')) return
    try {
      await deleteSection(id)
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleSync = async () => {
    try {
      const result = await syncArrangement(arrangementId)
      toast(`Synced ${result.synced} products to Facebook catalog`)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</div>
    )
  }

  if (!arrangement) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{arrangement.name}</h2>
            {arrangement.description && <p className="text-sm text-gray-400">{arrangement.description}</p>}
          </div>
          {arrangement.isDefault && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white self-start mt-1" style={{ background: PRIMARY }}>Default</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-white hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            <RefreshCw size={13} /> Sync to Facebook
          </button>
        </div>
      </div>

      {arrangement.sections?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-sm text-gray-400 mb-4">No sections yet. Create your first section to organize products.</div>
          <button
            onClick={() => setShowNewSection(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl mx-auto hover:opacity-90 transition"
            style={{ background: PRIMARY }}
          >
            <Plus size={14} /> Add Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {arrangement.sections.map((section, si) => (
            <SectionCard
              key={section.id}
              section={section}
              arrangementId={arrangementId}
              onDelete={() => handleDeleteSection(section.id)}
              onRefresh={load}
              isFirst={si === 0}
              isLast={si === arrangement.sections.length - 1}
            />
          ))}
          <button
            onClick={() => setShowNewSection(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
          >
            <Plus size={16} className="inline mr-1" /> Add Section
          </button>
        </div>
      )}

      {showNewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">New Section</h3>
            <input
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder="e.g. New Arrivals, Best Sellers"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSection}
                disabled={creatingSection || !sectionName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60"
                style={{ background: PRIMARY }}
              >
                {creatingSection ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Create
              </button>
              <button onClick={() => { setShowNewSection(false); setSectionName('') }} className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section Card ────────────────────────────────────────────

function SectionCard({ section, arrangementId, onDelete, onRefresh, isFirst, isLast }) {
  const navigate = useNavigate()
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const searchProducts = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await listProducts({ q: q.trim(), limit: 20 })
      setSearchResults(res?.items ?? res ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAddProduct = async (productId) => {
    try {
      await addItemToSection({ sectionId: section.id, productId })
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromSection(itemId)
      onRefresh()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100" style={{ background: CREAM }}>
        <div className="flex items-center gap-2 min-w-0">
          <Tag size={15} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900">{section.name}</span>
          {section.description && <span className="text-xs text-gray-400">— {section.description}</span>}
          <span className="text-xs text-gray-400 ml-1">({section._count?.items ?? section.items?.length ?? 0} items)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddProduct(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            title="Add product"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
            title="Delete section"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {section.items?.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {section.items.map((item, ii) => (
            <div
              key={item.id}
              onClick={() => item.product?.id && navigate(`/dashboard/products/${item.product.id}/edit`)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer"
              title="View product details"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product?.imageUrl ? (
                  <img src={resolveImageUrl(item.product.imageUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={14} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Unknown product'}</div>
                <div className="text-xs text-gray-400">
                  ₦{((item.customPriceMinor ?? item.product?.priceMinor ?? 0) / 100).toLocaleString()}
                  {item.product?.sku && ` · SKU: ${item.product.sku}`}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id) }}
                className="p-1 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50 transition"
                title="Remove from section"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-xs text-gray-400">
          No products in this section
        </div>
      )}

      {showAddProduct && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2" style={{ background: '#fafafa' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); searchProducts(e.target.value) }}
              placeholder="Search products to add…"
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none"
              autoFocus
            />
          </div>
          {searching && <div className="text-xs text-gray-400 text-center">Searching…</div>}
          {searchResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {searchResults.filter(p => !section.items?.find(i => i.productId === p.id)).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-white rounded-lg transition"
                >
                  <Plus size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">{p.name}</span>
                  <span className="text-gray-400 flex-shrink-0">₦{(p.priceMinor / 100).toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => { setShowAddProduct(false); setSearchQuery(''); setSearchResults([]) }} className="text-xs text-gray-400 hover:text-gray-600">
            Done adding
          </button>
        </div>
      )}
    </div>
  )
}
