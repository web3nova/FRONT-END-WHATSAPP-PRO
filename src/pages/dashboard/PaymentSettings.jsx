import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, HelpCircle, Plus, Trash2, Loader, CreditCard, AlertCircle } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders } from '../../lib/auth'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'
// Must match backend's SECRET_PLACEHOLDER in payment-config.service.js — sending
// this back for a secret field means "keep whatever's already stored server-side."
const SECRET_PLACEHOLDER = '__UNCHANGED__'

const inputClass = "w-full px-3.5 py-3 md:py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
const labelClass = "text-sm font-medium text-gray-700 block mb-1.5"

function Section({ title, desc, children, dataTour }) {
  return (
    <div data-tour={dataTour} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        {desc && <p className="text-sm text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className={`relative w-11 h-6.5 rounded-full transition flex-shrink-0 ${checked ? 'bg-blue-500' : 'bg-gray-200'}`} style={{ width: 44, height: 26 }}>
        <div className="absolute w-5 h-5 bg-white rounded-full shadow-sm top-1 transition"
          style={{ left: checked ? '21px' : '3px' }}
        />
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      </div>
    </label>
  )
}

export default function PaymentSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showRouteModal, setShowRouteModal] = useState(false)

  const EMPTY_CONFIG = {
    manual: { isActive: false, bankAccount: null },
    paystack: { isActive: false, publicKey: '', secretKey: '' },
    monnify: { isActive: false, apiKey: '', secretKey: '', contractCode: '' },
    blockradar: { isActive: false, apiKey: '', walletId: '', webhookUrl: '' },
    otherProviders: [],
    preferredProvider: 'manual',
  }
  const [config, setConfig] = useState(EMPTY_CONFIG)
  const [savedConfig, setSavedConfig] = useState(null)
  const isDirty = savedConfig !== null && JSON.stringify(config) !== JSON.stringify(savedConfig)
  const [banks, setBanks] = useState([])
  const [resolving, setResolving] = useState(false)
  const [resolvedName, setResolvedName] = useState('')
  // Secret fields load pre-masked (e.g. "••••1234") from the server. We only
  // want to send a real replacement value when the user actually retypes one —
  // otherwise we'd overwrite the stored secret with its own masked display text.
  const [editedSecrets, setEditedSecrets] = useState(() => new Set())
  const updateSecret = (path, value) => {
    setEditedSecrets(prev => new Set(prev).add(path))
    update(path, value)
  }

  useEffect(() => {
    let ignore = false
    async function load() {
      const token = getStoredAccessToken()
      if (!token) return
      try {
        const [configRes, banksRes] = await Promise.all([
          fetch(`${API_BASE}/payment-config`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/payment-config/banks`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ])
        if (configRes.ok) {
          const body = await configRes.json()
          const data = body?.data || body
          const loaded = data?.data || data
          if (!ignore && loaded) {
            setConfig(loaded)
            setSavedConfig(loaded)
          }
        }
        if (banksRes?.ok) {
          const body = await banksRes.json()
          const list = body?.data || []
          if (!ignore) setBanks(list)
        }
      } catch {
        // use defaults
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const verifyAccount = useCallback(async (accountNumber, bankCode) => {
    if (!accountNumber || accountNumber.length !== 10 || !bankCode) {
      setResolvedName('')
      return
    }
    setResolving(true)
    setResolvedName('')
    const token = getStoredAccessToken()
    try {
      const res = await fetch(`${API_BASE}/payment-config/resolve-account?accountNumber=${accountNumber}&bankCode=${bankCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (res.ok && body?.data?.accountName) {
        const name = body.data.accountName
        setResolvedName(name)
        update('manual.bankAccount.accountName', name)
      }
    } catch {
      // verification unavailable — manual entry works fine
    } finally {
      setResolving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (path, value) => {
    setConfig(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]] = { ...obj[keys[i]] }
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
    setSaved(false)
  }

  const handleSave = async () => {
    setError('')
    setSaved(false)
    const token = getStoredAccessToken()
    if (!token) return

    setSaving(true)
    try {
      const payload = {
        manual: config.manual,
        paystack: { ...config.paystack, secretKey: editedSecrets.has('paystack.secretKey') ? config.paystack?.secretKey : SECRET_PLACEHOLDER },
        monnify: {
          ...config.monnify,
          apiKey: editedSecrets.has('monnify.apiKey') ? config.monnify?.apiKey : SECRET_PLACEHOLDER,
          secretKey: editedSecrets.has('monnify.secretKey') ? config.monnify?.secretKey : SECRET_PLACEHOLDER,
        },
        blockradar: { ...config.blockradar, apiKey: editedSecrets.has('blockradar.apiKey') ? config.blockradar?.apiKey : SECRET_PLACEHOLDER },
        otherProviders: config.otherProviders.map((p, i) => ({
          ...p,
          secretKey: editedSecrets.has(`otherProviders.${i}.secretKey`) ? p.secretKey : SECRET_PLACEHOLDER,
        })),
        preferredProvider: config.preferredProvider,
      }

      const res = await fetch(`${API_BASE}/payment-config`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || 'Failed to save')
      }

      setSaved(true)
      setSavedConfig(payload)
      setShowRouteModal(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const addOtherProvider = () => {
    update('otherProviders', [...config.otherProviders, { name: '', isActive: true, publicKey: '', secretKey: '', webhookUrl: '' }])
  }

  const updateOtherProvider = (i, field, value) => {
    const list = [...config.otherProviders]
    list[i] = { ...list[i], [field]: value }
    update('otherProviders', list)
  }

  const removeOtherProvider = (i) => {
    update('otherProviders', config.otherProviders.filter((_, j) => j !== i))
    setEditedSecrets(prev => {
      const next = new Set()
      for (const key of prev) {
        const match = key.match(/^otherProviders\.(\d+)\.secretKey$/)
        if (!match) { next.add(key); continue }
        const idx = Number(match[1])
        if (idx === i) continue
        next.add(idx > i ? `otherProviders.${idx - 1}.secretKey` : key)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Loader size={16} className="animate-spin" />
        Loading payment settings...
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure how your customers pay you.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {saved && <span className="flex items-center gap-1 text-sm text-green-600 flex-shrink-0"><Check size={14} /> Saved</span>}
          {isDirty && (
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 active:opacity-80 transition disabled:opacity-50" style={{ background: PRIMARY }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual Bank Transfer */}
      <Section title="Bank Transfer (Manual)" desc="Customers pay via bank transfer and you verify manually.">
        <Toggle label="Accept bank transfers" checked={config.manual?.isActive || false} onChange={e => update('manual.isActive', e.target.checked)} />
        {config.manual?.isActive && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.length > 0 ? (
                <div>
                  <label className={labelClass}>Bank</label>
                  <select
                    value={config.manual?.bankAccount?.bankCode || ''}
                    onChange={e => {
                      const code = e.target.value
                      const bank = banks.find(b => b.code === code)
                      update('manual.bankAccount.bankCode', code)
                      update('manual.bankAccount.bankName', bank?.name || '')
                      setResolvedName('')
                    }}
                    className={inputClass}
                  >
                    <option value="">Select bank</option>
                    {banks.map(b => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input
                    value={config.manual?.bankAccount?.bankName || ''}
                    onChange={e => {
                      update('manual.bankAccount.bankName', e.target.value)
                      update('manual.bankAccount.bankCode', '')
                    }}
                    placeholder="e.g. Access Bank"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1">Bank list unavailable — type your bank name manually.</p>
                </div>
              )}
              <div>
                <label className={labelClass}>Account Number</label>
                <div className="relative">
                  <input
                    value={config.manual?.bankAccount?.accountNumber || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      update('manual.bankAccount.accountNumber', val)
                      if (val.length === 10 && config.manual?.bankAccount?.bankCode) {
                        verifyAccount(val, config.manual.bankAccount.bankCode)
                      } else {
                        setResolvedName('')
                      }
                    }}
                    placeholder="0123456789"
                    inputMode="numeric"
                    maxLength={10}
                    className={`${inputClass} pr-10`}
                  />
                  {resolving && <Loader size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                </div>
              </div>
            </div>
            {resolvedName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-sm text-green-700">
                <Check size={16} className="flex-shrink-0" />
                <span className="min-w-0"><strong>{resolvedName}</strong> — account verified</span>
              </div>
            )}
            <div>
              <label className={labelClass}>Account Name</label>
              <div className="relative">
                <input
                  value={config.manual?.bankAccount?.accountName || ''}
                  onChange={e => update('manual.bankAccount.accountName', e.target.value)}
                  placeholder="e.g. Ada's Fashion House"
                  className={`${inputClass} pr-10`}
                />
                {resolving && <Loader size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {resolvedName
                  ? 'Verified against bank records.'
                  : 'If a valid account is entered, the name fills automatically. Otherwise type it manually.'}
              </p>
            </div>
          </div>
        )}
      </Section>

      {/* Paystack */}
      <Section dataTour="payments-providers" title="Paystack" desc="Accept card payments, USSD, and bank transfers via Paystack.">
        <Toggle label="Enable Paystack" checked={config.paystack?.isActive || false} onChange={e => update('paystack.isActive', e.target.checked)} />
        {config.paystack?.isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelClass}>Public Key</label>
              <input value={config.paystack?.publicKey || ''} onChange={e => update('paystack.publicKey', e.target.value)} placeholder="pk_live_xxxxxxxxxxxx" className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <input value={config.paystack?.secretKey || ''} onChange={e => updateSecret('paystack.secretKey', e.target.value)} placeholder="sk_live_xxxxxxxxxxxx" type="password" className={`${inputClass} font-mono text-xs`} />
            </div>
          </div>
        )}
      </Section>

      {/* Monnify */}
      <Section title="Monnify" desc="Accept payments via Monnify (card, bank transfer, USSD).">
        <Toggle label="Enable Monnify" checked={config.monnify?.isActive || false} onChange={e => update('monnify.isActive', e.target.checked)} />
        {config.monnify?.isActive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className={labelClass}>API Key</label>
              <input value={config.monnify?.apiKey || ''} onChange={e => updateSecret('monnify.apiKey', e.target.value)} placeholder="MK_PROD_XXXXXXXX" type="password" className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <input value={config.monnify?.secretKey || ''} onChange={e => updateSecret('monnify.secretKey', e.target.value)} placeholder="xxxxxxxxxxxx" type="password" className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Contract Code</label>
              <input value={config.monnify?.contractCode || ''} onChange={e => update('monnify.contractCode', e.target.value)} placeholder="xxxxxxxxxxxx" className={`${inputClass} font-mono text-xs`} />
            </div>
          </div>
        )}
      </Section>

      {/* Blockradar */}
      <Section title="Blockradar" desc="Accept crypto payments (USDT, ETH, BTC, etc.) via Blockradar.">
        <Toggle label="Enable Blockradar" checked={config.blockradar?.isActive || false} onChange={e => update('blockradar.isActive', e.target.checked)} />
        {config.blockradar?.isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelClass}>API Key</label>
              <input value={config.blockradar?.apiKey || ''} onChange={e => updateSecret('blockradar.apiKey', e.target.value)} placeholder="br_live_xxxxxxxxxxxx" type="password" className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Wallet ID</label>
              <input value={config.blockradar?.walletId || ''} onChange={e => update('blockradar.walletId', e.target.value)} placeholder="Master wallet ID from your Blockradar dashboard" className={`${inputClass} font-mono text-xs`} />
              <p className="text-xs text-gray-400 mt-1">Create a master wallet on Blockradar first — customer deposit addresses are generated from it.</p>
            </div>
            <div>
              <label className={labelClass}>Webhook URL <span className="text-gray-400 font-normal">(optional)</span></label>
              <input value={config.blockradar?.webhookUrl || ''} onChange={e => update('blockradar.webhookUrl', e.target.value)} placeholder="https://yourdomain.com/webhook/blockradar" className={`${inputClass} font-mono text-xs`} />
            </div>
          </div>
        )}
      </Section>

      {/* Other Providers */}
      <Section title="Other Payment Providers" desc="Add custom payment gateways (e.g. Flutterwave, Remita, Interswitch).">
        {config.otherProviders?.map((p, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 space-y-3" style={{ background: CREAM }}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-700">Provider {i + 1}</span>
              <button type="button" onClick={() => removeOtherProvider(i)} aria-label={`Remove provider ${i + 1}`} className="p-2 -m-2 text-gray-400 hover:text-red-500 active:text-red-500 flex-shrink-0"><Trash2 size={15} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={p.name} onChange={e => updateOtherProvider(i, 'name', e.target.value)} placeholder="Provider name (e.g. Flutterwave)" className={inputClass} />
              <input value={p.publicKey || ''} onChange={e => updateOtherProvider(i, 'publicKey', e.target.value)} placeholder="Public / API Key" className={`${inputClass} font-mono text-xs`} />
              <input value={p.secretKey || ''} onChange={e => { setEditedSecrets(prev => new Set(prev).add(`otherProviders.${i}.secretKey`)); updateOtherProvider(i, 'secretKey', e.target.value) }} placeholder="Secret Key" type="password" className={`${inputClass} font-mono text-xs`} />
              <input value={p.webhookUrl || ''} onChange={e => updateOtherProvider(i, 'webhookUrl', e.target.value)} placeholder="Webhook URL (optional)" className={`${inputClass} font-mono text-xs`} />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input type="checkbox" checked={p.isActive} onChange={e => updateOtherProvider(i, 'isActive', e.target.checked)} className="rounded" style={{ width: 18, height: 18 }} />
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>
        ))}
        <button type="button" onClick={addOtherProvider} className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-medium rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400 active:border-blue-300 transition">
          <Plus size={15} /> Add Provider
        </button>
      </Section>

      {/* Preferred Provider */}
      <Section title="Default Payment Method" desc="Select which payment method is shown first to customers.">
        <select value={config.preferredProvider || 'manual'} onChange={e => update('preferredProvider', e.target.value)} className={`w-full sm:max-w-xs ${inputClass}`}>
          <option value="manual">Bank Transfer (Manual)</option>
          <option value="paystack">Paystack</option>
          <option value="monnify">Monnify</option>
          <option value="blockradar">Blockradar (Crypto)</option>
          <option value="other">Other Provider</option>
        </select>
      </Section>

      {/* Need Help */}
      <div className="rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3" style={{ background: CREAM }}>
        <div className="flex items-start gap-3">
          <HelpCircle size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900">Need help setting up payments?</h3>
            <p className="text-sm text-gray-500 mt-1">Our compliance team can help you integrate Paystack, Monnify, Flutterwave, or any other payment gateway. We handle the technical setup so you can start receiving payments immediately.</p>
            <a href="mailto:support@bizai.com" className="inline-block mt-3 w-full sm:w-auto text-center px-4 py-2.5 sm:py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 active:opacity-80 transition" style={{ background: PRIMARY }}>
              Contact Compliance Team
            </a>
          </div>
        </div>
      </div>

      {/* Save Button — pinned to the bottom of the screen on mobile so it's reachable
          without scrolling back up, wherever you are on the page; a normal inline
          button on desktop where there's no need for it. */}
      {isDirty && (
        <div className="hidden sm:flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 active:opacity-80 transition disabled:opacity-50" style={{ background: PRIMARY }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {isDirty && (
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3"
          style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.06)' }}
        >
          {saved && <span className="flex items-center gap-1 text-sm text-green-600 flex-shrink-0"><Check size={14} /> Saved</span>}
          <button onClick={handleSave} disabled={saving} className="flex-1 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-sm active:opacity-80 transition disabled:opacity-50" style={{ background: PRIMARY }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Post-save routing prompt */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5 sm:p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#dce5fd' }}>
              <CreditCard size={18} style={{ color: PRIMARY }} />
            </div>
            <div className="text-sm font-semibold text-gray-900">Payment settings saved</div>
            <p className="text-sm text-gray-500 mt-1">
              Would you like to update your products now to make sure they're ready to sell with these payment options?
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowRouteModal(false); navigate('/dashboard') }}
                className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 active:bg-gray-50"
              >
                No, go to dashboard
              </button>
              <button
                onClick={() => { setShowRouteModal(false); navigate('/dashboard/products') }}
                className="flex-1 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-xl active:opacity-80"
                style={{ background: PRIMARY }}
              >
                Yes, update products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}