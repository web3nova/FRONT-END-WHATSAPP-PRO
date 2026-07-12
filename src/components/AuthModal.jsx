import { useState, useEffect } from 'react'
import { X, Loader, LogIn, UserPlus, Globe, Fingerprint } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { API_BASE } from '../lib/apiConfig'

const VENDOR_COLORS = {
  primary: '#4166F5',
  secondary: '#1a1a2e',
  accent: '#10b981',
  danger: '#ef4444',
  background: '#ffffff',
  surface: '#f9fafb',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthModal({ tenantId, open, onClose, onSuccess, theme = {} }) {
  const colors = { ...VENDOR_COLORS, ...theme }

  const { login, signup, customer, token } = useCustomerAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState('phone')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !open) return

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      const s = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (s && s.parentNode) s.parentNode.removeChild(s)
    }
  }, [open])

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true)
    setError('')

    try {
      const idToken = response.credential
      if (!idToken) throw new Error('Google authentication failed')

      const res = await fetch(`${API_BASE}/customer-auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, idToken }),
      })

      const body = await res.json()
      if (!res.ok) throw new Error(body?.message || 'Google authentication failed')

      const result = body?.data ?? body
      if (result.token && result.customer) {
        // Store the returned customer and token directly via the auth context
        // by using the signup flow with received data
        localStorage.setItem('customer_token', result.token)
        localStorage.setItem('customer_data', JSON.stringify(result.customer))
        // Reload to pick up the new auth state
        window.location.reload()
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Google auth error:', err)
      setError(err.message || 'Google authentication failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID || googleLoading) return

    setGoogleLoading(true)
    setError('')

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.error('Google OAuth not displayed:', notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.log('Google OAuth skipped')
        } else if (notification.isDismissedMoment()) {
          console.log('Google OAuth dismissed')
        }
      })
    } catch (err) {
      console.error('Google button error:', err)
      setError('Failed to initialize Google login. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    if (!tenantId || passkeyLoading) return
    setPasskeyLoading(true)
    setError('')

    try {
      // Start passkey auth
      const startRes = await fetch(`${API_BASE}/customer-auth/passkey/login/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      const startBody = await startRes.json()
      if (!startRes.ok) throw new Error(startBody?.message || 'Passkey auth failed')
      const startData = startBody?.data ?? startBody

      // Use WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(startData.challenge), c => c.charCodeAt(0)),
          rpId: startData.rpId || window.location.hostname,
          allowCredentials: [],
          userVerification: 'preferred',
        },
        signal: new AbortController().signal,
      })

      if (!credential) throw new Error('Passkey authentication cancelled')

      // Complete passkey auth
      const completeRes = await fetch(`${API_BASE}/customer-auth/passkey/login/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          credential: {
            id: credential.id,
            type: credential.type,
            rawId: credential.id,
            response: credential.response ? {
              clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
              authenticatorData: arrayBufferToBase64(credential.response.authenticatorData),
              signature: arrayBufferToBase64(credential.response.signature),
              userHandle: credential.response.userHandle
                ? arrayBufferToBase64(credential.response.userHandle)
                : null,
            } : null,
          },
        }),
      })
      const completeBody = await completeRes.json()
      if (!completeRes.ok) throw new Error(completeBody?.message || 'Passkey verification failed')
      const completeData = completeBody?.data ?? completeBody

      if (completeData.token && completeData.customer) {
        localStorage.setItem('customer_token', completeData.token)
        localStorage.setItem('customer_data', JSON.stringify(completeData.customer))
        window.location.reload()
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Passkey error:', err)
      setError(err.message || 'Passkey authentication failed. Please try again.')
    } finally {
      setPasskeyLoading(false)
    }
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (authMethod === 'email') {
      if (mode === 'signup' && !name.trim()) { setError('Please enter your full name'); return }
      if (!email.trim()) { setError('Please enter your email address'); return }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('Please enter a valid email address'); return }
    } else {
      if (!phone.trim()) { setError('Please enter your phone number'); return }
      if (phone.trim().length < 10) { setError('Please enter a valid phone number'); return }
    }
    if (!password) { setError('Please enter a password'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (mode === 'signup') {
      if (!confirmPassword) { setError('Please confirm your password'); return }
      if (password !== confirmPassword) { setError('Passwords do not match'); return }
    }

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

  const switchAuthMethod = () => {
    setAuthMethod(current => current === 'phone' ? 'email' : 'phone')
    setError('')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl"
        style={{
          borderTop: `4px solid ${colors.primary}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: colors.background }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {mode === 'login' ? 'Sign in to your account' : 'Join our community'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                authMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                authMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {authMethod === 'email' ? (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="08012345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? '\u{1F441}\u{FE0F}' : '\u{1F441}\u{FE0F}\u{200D}\u{1F5E8}'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            {loading ? (
              <><Loader size={18} className="animate-spin" /> Please wait…</>
            ) : mode === 'login' ? (
              <><LogIn size={18} /> Sign In</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <>
                  <Globe size={18} style={{ color: '#4285F4' }} />
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={loading || passkeyLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passkeyLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <>
                  <Fingerprint size={18} style={{ color: colors.secondary }} />
                  <span className="text-sm font-medium text-gray-700">Passkey</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: colors.primary }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError('') }}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: colors.primary }}
                >
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
