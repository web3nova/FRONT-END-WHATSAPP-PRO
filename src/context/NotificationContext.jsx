import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, X, AlertTriangle } from 'lucide-react'

const PRIMARY = '#4166F5'
const NotificationContext = createContext(null)

let idCounter = 0

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null) // { title, message, confirmLabel, danger, resolve }
  const resolveRef = useRef(null)

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    if (duration) setTimeout(() => dismissToast(id), duration)
    return id
  }, [dismissToast])

  toast.success = (msg, duration) => toast(msg, 'success', duration)
  toast.error = (msg, duration) => toast(msg, 'error', duration)
  toast.info = (msg, duration) => toast(msg, 'info', duration)

  // Returns a Promise<boolean> — resolves true if confirmed, false if cancelled.
  const confirmAction = useCallback(({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setConfirmState({ title, message, confirmLabel, cancelLabel, danger })
    })
  }, [])

  const closeConfirm = (result) => {
    resolveRef.current?.(result)
    resolveRef.current = null
    setConfirmState(null)
  }

  return (
    <NotificationContext.Provider value={{ toast, confirmAction }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => {
          const Icon = t.type === 'error' ? AlertCircle : t.type === 'info' ? AlertTriangle : CheckCircle2
          const styles = t.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : t.type === 'info'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-green-50 border-green-200 text-green-700'
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-lg max-w-sm transition-all duration-150 ${styles}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40" onClick={() => closeConfirm(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${confirmState.danger ? 'bg-red-50' : 'bg-blue-50'}`}>
                <AlertTriangle size={18} className={confirmState.danger ? 'text-red-500' : 'text-blue-500'} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{confirmState.title}</h3>
                {confirmState.message && <p className="text-sm text-gray-500 mt-1">{confirmState.message}</p>}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition"
                style={{ background: confirmState.danger ? '#dc2626' : PRIMARY }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider')
  return ctx
}
