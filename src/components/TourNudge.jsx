import { X, Compass } from 'lucide-react'

// Matches the dashboard card language: white, rounded-2xl, border-gray-100,
// soft shadow, #4166F5 primary action, Manrope-weighted label.
export default function TourNudge({ label, onStart, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-[90] sm:max-w-xs bg-white border border-gray-100 shadow-[0_12px_32px_rgba(15,23,42,0.12)] rounded-2xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff' }}>
        <Compass size={16} style={{ color: '#4166F5' }} />
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1 leading-snug" style={{ fontFamily: "'Manrope', sans-serif" }}>{label}</span>
      <button onClick={onStart} className="text-xs font-semibold text-white px-3 py-2 rounded-xl hover:opacity-90 transition flex-shrink-0" style={{ background: '#4166F5' }}>Show me</button>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-gray-300 hover:text-gray-500 flex-shrink-0"><X size={15} /></button>
    </div>
  )
}
