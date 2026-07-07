import { Image, Link } from 'lucide-react'

const PRIMARY = '#4166F5'

export default function ImageUploadField({ label, value, onChange, hint, aspect }) {
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
          />
        </div>
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
      {hint && <p className="text-xs text-gray-400 italic mt-1">{hint}</p>}
    </div>
  )
}
