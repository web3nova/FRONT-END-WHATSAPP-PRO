import { useState } from 'react'
import { X, Loader, User, LogIn, UserPlus } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const INK = '#1a1a2e'

export default function AuthModal({ tenantId, open, onClose, onSuccess }) {
  const { login, signup } = useCustomerAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return }
    if (!phone.trim()) { setError('Please enter your phone number'); return }
    if (phone.trim().length < 10) { setError('Please enter a valid phone number'); return }
    if (!password) { setError('Please enter a password'); return }
    if (mode === 'signup' && password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(tenantId, name.trim(), phone.trim(), password)
      } else {
        await login(tenantId, phone.trim(), password)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-sm mx-auto rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: INK }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Full Name</label>
              <input
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Phone Number</label>
            <input
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition"
              placeholder="08012345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: INK }}
          >
            {loading ? (
              <><Loader size={15} className="animate-spin" /> Please wait…</>
            ) : mode === 'login' ? (
              <><LogIn size={15} /> Sign In</>
            ) : (
              <><UserPlus size={15} /> Create Account</>
            )}
          </button>

          <div className="text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError('') }} className="font-semibold underline underline-offset-2" style={{ color: INK }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }} className="font-semibold underline underline-offset-2" style={{ color: INK }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
