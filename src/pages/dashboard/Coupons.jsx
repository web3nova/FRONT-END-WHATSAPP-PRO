import { useEffect, useState } from 'react'
import { Plus, Tag, Trash2, Edit2, X, Percent } from 'lucide-react'
import Modal from '../../components/Modal'
import { useNotify } from '../../context/NotificationContext'
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/couponsApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const inputClass = "w-full px-3.5 py-3 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
const labelClass = "text-sm font-medium text-gray-700 block mb-1.5"

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className={`relative inline-flex items-center flex-shrink-0 ${disabled ? 'opacity-50' : 'cursor-pointer'}`} style={{ width: 44, height: 26 }}>
      <div className={`absolute inset-0 rounded-full transition ${checked ? 'bg-blue-500' : 'bg-gray-200'}`} />
      <div className="absolute w-5 h-5 bg-white rounded-full shadow-sm top-1 transition" style={{ left: checked ? '21px' : '3px' }} />
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
    </label>
  )
}

function formatValue(c) {
  if (c.type === 'percent') return `${c.value}%`
  const minor = Number(c.value || 0)
  return `₦${(minor / 100).toLocaleString()}`
}

function formatMinSubtotal(c) {
  if (!c.minSubtotal) return null
  return `₦${(Number(c.minSubtotal) / 100).toLocaleString()} min`
}

const EMPTY_FORM = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  expiresAt: '',
  maxUses: '',
  active: true,
}

export default function Coupons() {
  const { toast, confirmAction } = useNotify()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await listCoupons()
      setCoupons(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load coupons.')
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      code: c.code || '',
      type: c.type || 'percent',
      value: c.type === 'percent' ? String(c.value ?? '') : String(Number(c.value || 0) / 100),
      minSubtotal: c.minSubtotal != null ? String(Number(c.minSubtotal) / 100) : '',
      expiresAt: c.expiresAt ? String(c.expiresAt).slice(0, 10) : '',
      maxUses: c.maxUses != null ? String(c.maxUses) : '',
      active: c.active !== false,
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const handleToggleActive = async (c) => {
    const id = c.id || c._id
    setTogglingId(id)
    try {
      await updateCoupon(id, { active: !c.active })
      setCoupons(prev => prev.map(x => (x.id || x._id) === id ? { ...x, active: !c.active } : x))
    } catch (err) {
      toast.error(err.message || 'Could not update coupon.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (c) => {
    const id = c.id || c._id
    const ok = await confirmAction({
      title: 'Delete coupon?',
      message: `"${c.code}" will be permanently removed.`,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return

    setDeletingId(id)
    try {
      await deleteCoupon(id)
      setCoupons(prev => prev.filter(x => (x.id || x._id) !== id))
      toast.success('Coupon deleted')
    } catch (err) {
      toast.error(err.message || 'Could not delete coupon.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const code = form.code.trim().toUpperCase()
    if (!code) return setFormError('Enter a coupon code.')

    let value
    if (form.type === 'percent') {
      value = Math.min(100, Math.max(1, Math.round(Number(form.value) || 0)))
    } else {
      const naira = Number(form.value) || 0
      if (naira <= 0) return setFormError('Enter a value greater than 0.')
      value = Math.round(naira * 100)
    }

    const payload = {
      code,
      type: form.type,
      value,
      active: form.active,
    }
    if (form.minSubtotal) payload.minSubtotal = Math.round(Number(form.minSubtotal) * 100)
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString()
    if (form.maxUses) payload.maxUses = Math.round(Number(form.maxUses))

    setSaving(true)
    try {
      if (editing) {
        const id = editing.id || editing._id
        const updated = await updateCoupon(id, payload)
        setCoupons(prev => prev.map(x => (x.id || x._id) === id ? { ...x, ...updated } : x))
        toast.success('Coupon updated')
      } else {
        const created = await createCoupon(payload)
        setCoupons(prev => [created, ...prev])
        toast.success('Coupon created')
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message || 'Could not save coupon.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-tour="coupons-root" className="space-y-4 sm:space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400 mt-0.5">{coupons.length} coupon{coupons.length === 1 ? '' : 's'} for your storefront</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-semibold text-white rounded-xl shadow-sm active:opacity-80 hover:opacity-90 transition w-full sm:w-auto"
          style={{ background: PRIMARY }}
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          Loading coupons...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {!loading && coupons.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 px-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: CREAM }}>
            <Tag size={22} className="text-gray-400" />
          </div>
          <div className="text-sm font-semibold text-gray-700 mt-1">No coupons yet</div>
          <p className="text-xs text-gray-400 max-w-xs">Create a coupon code to offer discounts at checkout.</p>
          <button onClick={openCreate} className="mt-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: PRIMARY }}>
            New Coupon
          </button>
        </div>
      )}

      {coupons.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="sm:hidden space-y-2.5">
            {coupons.map((c) => {
              const id = c.id || c._id
              return (
                <div key={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        <Tag size={13} className="text-gray-300 flex-shrink-0" />
                        {c.code}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatValue(c)} off{formatMinSubtotal(c) ? ` · ${formatMinSubtotal(c)}` : ''}
                      </div>
                    </div>
                    <Toggle checked={c.active !== false} disabled={togglingId === id} onChange={() => handleToggleActive(c)} />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ''} used
                    {c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 active:bg-gray-50">
                      <Edit2 size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(c)} disabled={deletingId === id} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border border-red-100 text-red-500 active:bg-red-50 disabled:opacity-50">
                      <Trash2 size={13} /> {deletingId === id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop / tablet: table */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: CREAM }}>
                  {['Code', 'Discount', 'Min. Subtotal', 'Uses', 'Expires', 'Active', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => {
                  const id = c.id || c._id
                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-gray-300 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-900">{c.code}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          {c.type === 'percent' && <Percent size={12} className="text-gray-400" />}
                          {formatValue(c)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatMinSubtotal(c) || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3.5">
                        <Toggle checked={c.active !== false} disabled={togglingId === id} onChange={() => handleToggleActive(c)} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-300 hover:text-blue-600 rounded-lg">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(c)} disabled={deletingId === id} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg disabled:opacity-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Coupon' : 'New Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{formError}</div>
          )}

          <div>
            <label className={labelClass}>Code</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="SAVE20"
              className={`${inputClass} font-mono tracking-wider`}
              maxLength={30}
            />
          </div>

          <div>
            <label className={labelClass}>Discount type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'percent' }))}
                className="flex-1 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition"
                style={form.type === 'percent' ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                Percent off
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, type: 'fixed' }))}
                className="flex-1 px-3.5 py-2.5 text-sm font-medium rounded-xl border transition"
                style={form.type === 'fixed' ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                Fixed amount
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Value ({form.type === 'percent' ? '%' : '₦'})</label>
            <input
              type="number"
              min={form.type === 'percent' ? 1 : 1}
              max={form.type === 'percent' ? 100 : undefined}
              value={form.value}
              onChange={e => {
                let v = e.target.value
                if (form.type === 'percent' && v !== '') {
                  v = String(Math.min(100, Math.max(0, Number(v))))
                }
                setForm(f => ({ ...f, value: v }))
              }}
              placeholder={form.type === 'percent' ? '20' : '1000'}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min. subtotal <span className="text-gray-400 font-normal">(optional, ₦)</span></label>
              <input
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={e => setForm(f => ({ ...f, minSubtotal: e.target.value }))}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max uses <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="Unlimited"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Expires <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className={inputClass}
            />
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
            <span className="text-sm font-medium text-gray-700">Active</span>
            <Toggle checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={closeModal} disabled={saving} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 active:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl active:opacity-80 disabled:opacity-50" style={{ background: PRIMARY }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
