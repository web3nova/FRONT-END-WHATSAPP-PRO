import { useState, useEffect } from 'react'
import { X, Loader, LogIn, UserPlus, Globe, Fingerprint } from 'lucide-react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
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
  const [isFedCMUnsupported, setIsFedCMUnsupported] = useState(false)
  // After a fresh signup, offer to add a passkey before closing.
  const [passkeyOffer, setPasskeyOffer] = useState(null) // { token, customer } | null
  const [passkeyRegistering, setPasskeyRegistering] = useState(false)
  const [passkeyOfferError, setPasskeyOfferError] = useState('')

  const passkeySupported = typeof window !== 'undefined' && !!window.PublicKeyCredential

  // Clear any pending passkey offer when the modal closes, so reopening never
  // shows a stale offer tied to an old signup token.
  useEffect(() => {
    if (!open) {
      setPasskeyOffer(null)
      setPasskeyOfferError('')
      setPasskeyRegistering(false)
    }
  }, [open])

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

  // Result listener for the fallback Google popup (backend posts from its own origin).
  useEffect(() => {
    if (!open) return
    const apiOrigin = new URL(API_BASE, window.location.origin).origin
    function onMessage(event) {
      if (event.origin !== apiOrigin) return
      const data = event.data
      if (data?.type === 'GOOGLE_LOGIN_SUCCESS' && data.token && data.customer) {
        localStorage.setItem('customer_token', data.token)
        localStorage.setItem('customer_data', JSON.stringify(data.customer))
        onSuccess?.()
        onClose()
        window.location.reload()
      } else if (data?.type === 'GOOGLE_LOGIN_ERROR') {
        setError(data.error || 'Google authentication failed')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
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
        localStorage.setItem('customer_token', result.token)
        localStorage.setItem('customer_data', JSON.stringify(result.customer))
        window.location.reload()
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Google auth error:', err)
      if (err.message.includes('FedCM') || err.message.includes('NetworkError') || err.message.includes('SecurityError')) {
        setError('Google OAuth is currently unavailable. Please try phone/email login or restart your browser.')
      } else {
        setError(err.message || 'Google authentication failed. Please try again.')
      }
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
          const reason = notification.getNotDisplayedReason()
          console.error('Google OAuth not displayed:', reason)
          
          if (reason === 'UnconditionalBlock' || reason === 'UserBlocked' || reason === 'WebOAuthDisabled') {
            setError('Google OAuth disabled by browser. Use phone/email login.')
          } else if (reason === 'ProviderConfigFileNotListed') {
            setError('Google OAuth origin not configured. Please use phone/email login.')
          } else if (reason === 'OriginNotAllowed') {
            setError('Origin not authorized for Google OAuth. Please use phone/email login.')
          } else {
            setError('Google OAuth unavailable. Use phone/email login.')
          }
        } else if (notification.isSkippedMoment()) {
          console.log('Google OAuth skipped')
        } else if (notification.isDismissedMoment()) {
          console.log('Google OAuth dismissed')
        }
      })
    } catch (err) {
      console.error('Google button error:', err)
      
      if (err.message.includes('FedCM') || err.message.includes('NetworkError') || err.message.includes('ProviderConfigFileNotListed') || err.message.includes('OriginNotAllowed')) {
        setError('Google OAuth requires browser support. Use phone/email login.')
      } else if (err.message.includes('SecurityError') || err.message.includes('SecurityError: The relying party ID')) {
        setError('Auth security configuration issue. Use phone/email login.')
      } else {
        setError('Google login unavailable. Use phone/email login.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleFallbackGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) return

    setError('')
    try {
      const redirectUri = `${API_BASE}/customer-auth/google/callback`
      const state = encodeURIComponent(JSON.stringify({ tenantId, origin: window.location.origin }))
      window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code&scope=${encodeURIComponent('openid profile email')}` +
        `&prompt=consent&state=${state}`,
        '_blank',
      )
      setError('Redirected to Google for authentication. Check your browser for the login window.')
    } catch (err) {
      console.error('Fallback Google sign-in error:', err)
      setError('Unable to initiate Google OAuth. Please use phone/email login.')
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
      const optionsJSON = startBody?.data ?? startBody

      const credential = await startAuthentication({ optionsJSON })

      // Complete passkey auth
      const completeRes = await fetch(`${API_BASE}/customer-auth/passkey/login/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, credential }),
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
        const result = await signup(tenantId, name.trim(), phone.trim(), email.trim(), password)
        // Offer to set up a passkey right after signup — the moment it's most
        // useful. Only when the browser supports WebAuthn; otherwise just finish.
        if (passkeySupported && result?.token && result?.customer?.id) {
          setPasskeyOffer({ token: result.token, customer: result.customer })
          setLoading(false)
          return
        }
      } else {
        await login(tenantId, phone.trim(), email.trim(), password)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Register a passkey for the just-created account, then finish.
  const handleAddPasskey = async () => {
    if (!passkeyOffer || passkeyRegistering) return
    setPasskeyRegistering(true)
    setPasskeyOfferError('')
    const { token: freshToken, customer: freshCustomer } = passkeyOffer
    try {
      const startRes = await fetch(`${API_BASE}/customer-auth/passkey/register/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
        body: JSON.stringify({ customerId: freshCustomer.id, tenantId }),
      })
      const startBody = await startRes.json()
      if (!startRes.ok) throw new Error(startBody?.message || 'Could not start passkey setup')
      const optionsJSON = startBody?.data ?? startBody

      const credential = await startRegistration({ optionsJSON })

      const completeRes = await fetch(`${API_BASE}/customer-auth/passkey/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
        body: JSON.stringify({ customerId: freshCustomer.id, credential }),
      })
      const completeBody = await completeRes.json()
      if (!completeRes.ok) throw new Error(completeBody?.message || 'Could not save passkey')
      finishAfterSignup()
    } catch (err) {
      // A user cancelling the browser prompt is not an error worth blocking on —
      // but surface real failures so they can retry or skip.
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        setPasskeyOfferError('Passkey setup was cancelled. You can add one later from your account.')
      } else {
        setPasskeyOfferError(err.message || 'Passkey setup failed. You can add one later from your account.')
      }
      setPasskeyRegistering(false)
    }
  }

  const finishAfterSignup = () => {
    setPasskeyOffer(null)
    setPasskeyRegistering(false)
    onSuccess?.()
    onClose()
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

        {passkeyOffer ? (
          <div className="px-8 py-8 space-y-5 text-center">
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: colors.background }}>
              <Fingerprint size={26} style={{ color: colors.primary }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>Set up a passkey?</h3>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                Sign in instantly next time with your fingerprint, face, or device PIN — no password to remember.
              </p>
            </div>
            {passkeyOfferError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg text-left">
                {passkeyOfferError}
              </div>
            )}
            <button
              type="button"
              onClick={handleAddPasskey}
              disabled={passkeyRegistering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition disabled:opacity-60"
              style={{ background: colors.primary }}
            >
              {passkeyRegistering ? <Loader size={18} className="animate-spin" /> : <Fingerprint size={18} />}
              {passkeyRegistering ? 'Setting up…' : 'Add a passkey'}
            </button>
            <button
              type="button"
              onClick={finishAfterSignup}
              disabled={passkeyRegistering}
              className="w-full py-2.5 text-sm font-medium transition disabled:opacity-60"
              style={{ color: colors.textSecondary }}
            >
              Skip for now
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
