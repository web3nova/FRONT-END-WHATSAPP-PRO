import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders } from '../../lib/auth'
import ProductForm from './ProductForm'

export default function ProductNew() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setSuccess('')
    const token = getStoredAccessToken()
    if (!token) return setError('You must be signed in to add products.')

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `Request failed (${res.status})`)
      }

      const data = await res.json().catch(() => null)
      const product = data?.data || data

      if (file && product?.id) {
        await uploadImage(product.id, file)
      }

      setSuccess('Product saved!')
      setTimeout(() => setSuccess(''), 3000)

      navigate('/dashboard/products')
    } catch (err) {
      setError(err.message || 'Could not create product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-sm text-gray-400 mt-0.5">Start with the basics — add more details later to help your AI agent sell better.</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl">
          <Check size={16} /> {success}
        </div>
      )}

      <ProductForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  )
}
