import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../lib/apiConfig'
import { getStoredAccessToken, getAuthHeaders } from '../../lib/auth'

export default function ProductNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('regular')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    const urls = files.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setImages(prev => [...prev, ...urls])
  }

  const handleRemoveImage = (i) => setImages(imgs => imgs.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const token = getStoredAccessToken()
    if (!token) return setError('You must be signed in to add products.')

    setLoading(true)
    try {
      const payload = { name, price: Number(price) || 0, category, description }

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `Request failed (${res.status})`)
      }

      navigate('/dashboard/products')
    } catch (err) {
      setError(err.message || 'Could not create product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Product</h1>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
        <div>
          <label className="text-sm font-medium">Product name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" required />
        </div>

        <div>
          <label className="text-sm font-medium">Price (N)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" required />
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <input value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded-lg" rows={4} />
        </div>

        <div>
          <label className="text-sm font-medium">Images</label>
          <div className="flex gap-2 mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
                <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs">x</button>
              </div>
            ))}
            <input type="file" accept="image/*" multiple onChange={handleImages} />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{loading ? 'Saving…' : 'Save Product'}</button>
          <button type="button" onClick={() => navigate('/dashboard/products')} className="px-4 py-2 border rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  )
}
