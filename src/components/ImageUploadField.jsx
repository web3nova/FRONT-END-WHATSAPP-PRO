import { useRef, useState } from 'react'
import { Image, Link, Upload, Loader } from 'lucide-react'
import { API_BASE } from '../lib/apiConfig'
import { getStoredAccessToken } from '../lib/auth'

const PRIMARY = '#4166F5'

export default function ImageUploadField({ label, value, onChange, hint, aspect }) {
  const fileInputRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    setUploading(true)
    try {
      const token = getStoredAccessToken()
      const body = new FormData()
      body.append('image', file)
      const res = await fetch(`${API_BASE}/website/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.message || 'Could not upload image.')
      }
      // Uploaded files carry a storageKey (for later deletion); URLs pasted into
      // the text field are plain strings — callers normalize both shapes.
      onChange(json?.data || json)
    } catch (err) {
      setError(err.message || 'Could not upload image.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Link size={14} className="text-gray-300" />
          </div>
          <input
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
            placeholder="Paste an image URL"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            disabled={uploading}
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload from device"
          title="Upload from device"
          className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 bg-white hover:bg-gray-50 transition disabled:opacity-50"
        >
          {uploading ? (
            <Loader size={14} className="text-gray-400 animate-spin" />
          ) : (
            <Upload size={14} className="text-gray-500" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div
          className="w-10 h-10 rounded-lg border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50 overflow-hidden"
          style={value ? { borderStyle: 'solid', borderColor: PRIMARY } : {}}
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <Image size={14} className="text-gray-300" />
          )}
        </div>
      </div>
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400 italic mt-1">{hint}</p>
      ) : null}
    </div>
  )
}
