import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, PackageX } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders, clearStoredAuth } from '../../lib/auth'
import ProductForm from './ProductForm'

const PRIMARY = '#4166F5'

export default function ProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [retryTick, setRetryTick] = useState(0)

  useEffect(() => {
    let ignore = false

    async function loadProduct() {
      try {
        setLoading(true)
        setFetchError('')

        const token = getStoredAccessToken()
        if (!token) {
          clearStoredAuth()
          throw new Error('You need to sign in.')
        }

        const res = await fetch(`${API_BASE}/products/${id}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            clearStoredAuth()
            throw new Error('Session expired. Please sign in again.')
          }
          if (res.status === 404) {
            throw new Error('This product no longer exists.')
          }
          throw new Error(`Request failed (${res.status})`)
        }

        const data = await res.json().catch(() => null)
        const payload = data?.data || data

        if (!ignore) setProduct(payload)
      } catch (err) {
        if (!ignore) setFetchError(err.message || 'Could not load product.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProduct()
    return () => { ignore = true }
  }, [id, retryTick])

  const uploadImage = async (productId, file) => {
    const token = getStoredAccessToken()
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`${API_BASE}/products/${productId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      console.warn('Image upload failed:', body?.message || res.status)
    }
  }

  const handleSubmit = async (payload, file) => {
    setError('')
    const token = getStoredAccessToken()
    if (!token) return setError('You must be signed in.')

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `Request failed (${res.status})`)
      }

      if (file) {
        await uploadImage(id, file)
      }

      navigate('/dashboard/products')
    } catch (err) {
      setError(err.message || 'Could not update product.')
      // Bring the error into view, especially on long forms on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const BackLink = () => (
    <button
      onClick={() => navigate('/dashboard/products')}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition -ml-1 px-1 py-1"
    >
      <ArrowLeft size={16} /> Back to Products
    </button>
  )

  // Loading state — skeleton instead of a bare sentence, so the layout doesn't jump
  if (loading) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded-lg" />
            <div className="h-4 w-32 bg-gray-100 rounded-lg" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4">
            <div className="h-36 sm:h-44 w-full bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Fetch failed or product missing — give a real recovery path instead of a dead-end sentence
  if (fetchError || !product) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="bg-white rounded-2xl border border-gray-100 py-14 px-6 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50">
            {fetchError?.toLowerCase().includes('no longer exists') ? (
              <PackageX size={22} className="text-red-400" />
            ) : (
              <AlertCircle size={22} className="text-red-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-gray-700 mt-1">
            {fetchError || 'Product not found.'}
          </div>
          <p className="text-xs text-gray-400 max-w-xs">
            {fetchError?.toLowerCase().includes('sign in')
              ? 'Sign in again to continue editing this product.'
              : 'It may have been removed, or there was a problem loading it.'}
          </p>
          <div className="flex gap-2 mt-3">
            {!fetchError?.toLowerCase().includes('sign in') && (
              <button
                onClick={() => setRetryTick(t => t + 1)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard/products')}
              className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition"
              style={{ background: PRIMARY }}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-6">
      <BackLink />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-400 mt-0.5 truncate">{product.name}</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <ProductForm initialData={product} onSubmit={handleSubmit} loading={saving} error={error} />
    </div>
  )
}