import { useState, useEffect } from 'react'
import { X, Trash2, Upload, Plus } from 'lucide-react'
import { resolveImageUrl } from '../../lib/utils'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const CATEGORIES = [
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'new-arrival', label: 'New Arrival' },
  { value: 'featured', label: 'Featured' },
  { value: 'discount', label: 'Discount' },
  { value: 'regular', label: 'Regular' },
  { value: 'others', label: 'Others' },
]

const inputClass = "w-full px-3.5 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
const labelClass = "text-sm font-medium text-gray-700 block mb-1.5"

function Collapse({ title, subtitle, open: initialOpen, children }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left active:bg-gray-50">
        <div>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className={`text-gray-400 transition-transform flex-shrink-0 ml-3 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="px-4 sm:px-5 pb-5 space-y-5">{children}</div>}
    </div>
  )
}

export default function ProductForm({ initialData, onSubmit, loading, error }) {
  const isEdit = !!initialData

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('regular')
  const [stock, setStock] = useState(0)
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [brand, setBrand] = useState('')
  const [sku, setSku] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState([])
  const [unit, setUnit] = useState('piece')
  const [compareAtPrice, setCompareAtPrice] = useState('')

  const [specs, setSpecs] = useState([])
  const [features, setFeatures] = useState([])
  const [faqs, setFaqs] = useState([])

  const [quickAdd, setQuickAdd] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setPrice(initialData.priceMinor != null ? String(initialData.priceMinor / 100) : '')
      setCategory(initialData.category || 'regular')
      setStock(initialData.stock ?? 0)
      setDescription(initialData.description || '')
      setBrand(initialData.brand || '')
      setSku(initialData.sku || '')
      setTags(initialData.tags || [])
      setUnit(initialData.unit || 'piece')
      setCompareAtPrice(initialData.compareAtPrice != null ? String(initialData.compareAtPrice / 100) : '')
      setSpecs(initialData.specifications || [])
      setFeatures(initialData.features || [])
      setFaqs(initialData.faqs || [])
      if (initialData.imageUrl) setPreviewUrl(resolveImageUrl(initialData.imageUrl))
    }
  }, [initialData])

  const reset = () => {
    setName('')
    setPrice('')
    setCategory('regular')
    setStock(0)
    setDescription('')
    setBrand('')
    setSku('')
    setTags([])
    setTagsInput('')
    setUnit('piece')
    setCompareAtPrice('')
    setSpecs([])
    setFeatures([])
    setFaqs([])
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const addTag = () => {
    const t = tagsInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagsInput('')
  }

  const buildPayload = () => {
    const p = {
      name: name.trim(),
      price: Number(price) || 0,
      category,
      stock: Number(stock) || 0,
      description: description.trim() || undefined,
      brand: brand.trim() || undefined,
      sku: sku.trim() || undefined,
      tags,
      unit,
      compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : undefined,
      specifications: specs.filter(s => s.key && s.value),
      features: features.filter(f => f.title),
      faqs: faqs.filter(f => f.question),
    }
    Object.keys(p).forEach(k => { if (p[k] === undefined) delete p[k] })
    return p
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit(buildPayload(), selectedFile)
    if (quickAdd && !isEdit) {
      reset()
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    }
  }

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const updSpec = (i, k, v) => setSpecs(specs.map((s, j) => j === i ? { ...s, [k]: v } : s))
  const delSpec = (i) => setSpecs(specs.filter((_, j) => j !== i))

  const addFeature = () => setFeatures([...features, { title: '', description: '' }])
  const updFeature = (i, k, v) => setFeatures(features.map((f, j) => j === i ? { ...f, [k]: v } : f))
  const delFeature = (i) => setFeatures(features.filter((_, j) => j !== i))

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }])
  const updFaq = (i, k, v) => setFaqs(faqs.map((f, j) => j === i ? { ...f, [k]: v } : f))
  const delFaq = (i) => setFaqs(faqs.filter((_, j) => j !== i))

  const SubmitButton = (
    <button
      type="submit"
      disabled={loading || !name.trim()}
      className="flex-1 sm:flex-initial px-6 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 active:opacity-80 transition disabled:opacity-50"
      style={{ background: PRIMARY }}
    >
      {loading ? 'Saving...' : isEdit ? 'Update Product' : quickAdd ? 'Save & Add Another' : 'Save Product'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:pb-4">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</div>}
      {justSaved && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl">
          Saved! Form cleared — add your next product.
        </div>
      )}

      {/* === CORE FIELDS — always visible === */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Product Info</h3>

        <div>
          <label className={labelClass}>
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Premium Ankara Gown"
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Price (₦) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Stock</label>
            <input
              type="number"
              inputMode="numeric"
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
              min="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Old Price (₦)</label>
            <input
              type="number"
              inputMode="decimal"
              value={compareAtPrice}
              onChange={e => setCompareAtPrice(e.target.value)}
              placeholder="For showing discounts"
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Short Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of the product..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Image */}
        <div>
          <label className={labelClass}>Product Image</label>
          <div className="flex flex-col xs:flex-row items-start gap-4">
            {previewUrl ? (
              <div className="relative flex-shrink-0">
                <img src={previewUrl} alt="preview" className="h-28 w-28 sm:h-32 sm:w-32 object-cover rounded-xl border border-gray-100" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl('') }}
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 flex-shrink-0">
                <span className="text-xs text-center px-2">No image</span>
              </div>
            )}
            <div className="flex-1 w-full">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 active:bg-gray-50 cursor-pointer transition">
                <Upload size={15} />
                {previewUrl ? 'Change photo' : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handleImageSelect} className="sr-only" />
              </label>
              <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, max 5MB.</p>
            </div>
          </div>
        </div>
      </div>

      {/* === QUICK ADD TOGGLE (only for create mode) === */}
      {!isEdit && (
        <label className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50">
          <input
            type="checkbox"
            checked={quickAdd}
            onChange={e => setQuickAdd(e.target.checked)}
            className="w-4.5 h-4.5 rounded flex-shrink-0"
            style={{ width: 18, height: 18 }}
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Quick Add Mode</span>
            <p className="text-xs text-gray-400">Form clears after saving so you can add another product fast</p>
          </div>
        </label>
      )}

      {/* === ADVANCED DETAILS (collapsible) === */}
      <Collapse title="More Details" subtitle="Helps your AI agent sell better" open={isEdit}>
        {/* Brand & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Brand</label>
            <input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="e.g. Ankara Styles"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="Product code"
              className={inputClass}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags</label>
          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2.5">
              {tags.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 text-xs font-medium rounded-lg" style={{ background: CREAM, color: '#6b7280' }}>
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="p-0.5 hover:text-red-500 active:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="e.g. native, wedding, asoebi"
              className={`flex-1 ${inputClass}`}
            />
            <button type="button" onClick={addTag} className="px-4 py-3 sm:py-2.5 text-sm font-medium text-white rounded-xl flex-shrink-0 active:opacity-80" style={{ background: PRIMARY }}>Add</button>
          </div>
        </div>

        {/* Unit */}
        <div>
          <label className={labelClass}>Unit</label>
          <select value={unit} onChange={e => setUnit(e.target.value)} className={inputClass}>
            <option value="piece">Piece</option>
            <option value="yard">Yard (ankara fabric)</option>
            <option value="kg">Kilogram</option>
            <option value="litre">Litre</option>
            <option value="pair">Pair</option>
            <option value="set">Set</option>
            <option value="dozen">Dozen</option>
          </select>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-2.5 gap-3">
            <span className="text-sm font-medium text-gray-700">Specifications <span className="block sm:inline text-xs text-gray-400 font-normal">e.g. Material, Size, Colour</span></span>
            <button type="button" onClick={addSpec} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 active:bg-blue-50" style={{ color: PRIMARY, border: `1px solid ${PRIMARY}` }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {specs.length === 0 && <p className="text-xs text-gray-400">None added yet.</p>}
          <div className="space-y-2.5">
            {specs.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 p-2.5 sm:p-0 rounded-xl bg-gray-50 sm:bg-transparent">
                <div className="flex gap-2 flex-1">
                  <input value={s.key} onChange={e => updSpec(i, 'key', e.target.value)} placeholder="e.g. Material" className="flex-1 px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                  <input value={s.value} onChange={e => updSpec(i, 'value', e.target.value)} placeholder="e.g. 100% Cotton" className="flex-1 px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                </div>
                <button type="button" onClick={() => delSpec(i)} aria-label="Remove specification" className="self-end sm:self-center p-2 sm:p-1 text-gray-400 hover:text-red-500 active:text-red-500 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <div className="flex items-center justify-between mb-2.5 gap-3">
            <span className="text-sm font-medium text-gray-700">Key Features <span className="block sm:inline text-xs text-gray-400 font-normal">For AI to highlight during recommendations</span></span>
            <button type="button" onClick={addFeature} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 active:bg-blue-50" style={{ color: PRIMARY, border: `1px solid ${PRIMARY}` }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {features.length === 0 && <p className="text-xs text-gray-400">None added yet.</p>}
          <div className="space-y-2.5">
            {features.map((f, i) => (
              <div key={i} className="flex gap-2 items-start p-2.5 rounded-xl bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={f.title} onChange={e => updFeature(i, 'title', e.target.value)} placeholder="Feature title" className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                  <textarea value={f.description} onChange={e => updFeature(i, 'description', e.target.value)} rows={2} placeholder="Brief description" className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none resize-none bg-white" />
                </div>
                <button type="button" onClick={() => delFeature(i)} aria-label="Remove feature" className="p-2 sm:p-1 text-gray-400 hover:text-red-500 active:text-red-500 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="flex items-center justify-between mb-2.5 gap-3">
            <span className="text-sm font-medium text-gray-700">FAQs <span className="block sm:inline text-xs text-gray-400 font-normal">AI answers customer questions from these</span></span>
            <button type="button" onClick={addFaq} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 active:bg-blue-50" style={{ color: PRIMARY, border: `1px solid ${PRIMARY}` }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {faqs.length === 0 && <p className="text-xs text-gray-400">None added yet.</p>}
          <div className="space-y-2.5">
            {faqs.map((f, i) => (
              <div key={i} className="flex gap-2 items-start p-2.5 rounded-xl bg-gray-50">
                <div className="flex-1 space-y-2">
                  <input value={f.question} onChange={e => updFaq(i, 'question', e.target.value)} placeholder="Question" className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none bg-white" />
                  <textarea value={f.answer} onChange={e => updFaq(i, 'answer', e.target.value)} rows={2} placeholder="Answer" className="w-full px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none resize-none bg-white" />
                </div>
                <button type="button" onClick={() => delFaq(i)} aria-label="Remove FAQ" className="p-2 sm:p-1 text-gray-400 hover:text-red-500 active:text-red-500 flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Collapse>

      {/* === SUBMIT — sticky on mobile so it's reachable without scrolling back up === */}
      <div className="fixed sm:static bottom-0 left-0 right-0 sm:mt-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-100 px-4 sm:px-0 py-3 sm:py-0 flex gap-3 z-20" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.04)' }}>
        {SubmitButton}
        {quickAdd && !isEdit && (
          <button
            type="button"
            onClick={() => { reset(); setQuickAdd(false) }}
            className="px-4 py-3 sm:py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition"
          >
            Exit Quick Add
          </button>
        )}
      </div>
    </form>
  )
}