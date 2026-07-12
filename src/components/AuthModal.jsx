import { useState, useEffect } from 'react'
import { X, Loader, User, LogIn, UserPlus, Mail, Chrome, Fingerprint } from 'lucide-react'
import { useCustomerAuth } from '../context/CustomerAuthContext'

// Vendor custom theme colors - easily customizable per vendor
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

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthModal({ tenantId, open, onClose, onSuccess, theme = {} }) {
  const colors = { ...VENDOR_COLORS, ...theme }
  
  const { login, signup, googleLogin } = useCustomerAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState('phone') // 'phone' or 'email'
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    
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
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true)
    setError('')
    
    try {
      const idToken = response.credential
      if (!idToken) throw new Error('Google authentication failed')
      
      const backendApiUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5173'
      const res = await fetch(`${backendApiUrl}/customer-auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          idToken,
          name: response.name,
          email: response.email,
          picture: response.picture,
        }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Google authentication failed')
      }
      
      await login(tenantId, response.email, data.tempPassword || 'google-oauth')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (authMethod === 'email') {
      if (mode === 'signup' && !name.trim()) { setError('Please enter your full name'); return }
      if (!email.trim()) { setError('Please enter your email address'); return }
      if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) { setError('Please enter a valid email address'); return }
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
        if (authMethod === 'email') {
          await signup(tenantId, name.trim(), email.trim(), password)
        } else {
          await signup(tenantId, name.trim(), phone.trim(), password)
        }
      } else {
        if (authMethod === 'email') {
          await login(tenantId, email.trim(), password)
        } else {
          await login(tenantId, phone.trim(), password)
        }
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
        className="bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl" \n        style={{ \n          borderTop: `4px solid ${colors.primary}`,\n          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'\n        }}\n        onClick={e => e.stopPropagation()}\n      >\n        <div className=\"px-8 py-6 border-b border-gray-100 flex items-center justify-between\" style={{ backgroundColor: colors.background }}>\n          <div>\n            <h2 className=\"text-xl font-bold\" style={{ color: colors.textPrimary }}>\n              {mode === 'login' ? 'Welcome Back' : 'Create Account'}\n            </h2>\n            <p className=\"text-sm mt-1\" style={{ color: colors.textSecondary }}>\n              {mode === 'login' ? 'Sign in to your account' : 'Join our community'}\n            </p>\n          </div>\n          <button \n            onClick={onClose} \n            className=\"p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100\"\n          >\n            <X size={20} />\n          </button>\n        </div>\n\n        <form onSubmit={handleSubmit} className=\"px-8 py-6 space-y-5\">\n          {error && (\n            <div className=\"bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg\">\n              {error}\n            </div>\n          )}\n\n          {/* Authentication Method Toggle */}\n          <div className=\"flex rounded-lg bg-gray-100 p-1\">\n            <button\n              type=\"button\"\n              onClick={() => setAuthMethod('phone')}\n              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
        authMethod === 'phone'\n                  ? 'bg-white text-gray-900 shadow-sm'\n                  : 'text-gray-600 hover:text-gray-900'\n              }`}\n            >\n              Phone\n            </button>\n            <button\n              type=\"button\"\n              onClick={() => setAuthMethod('email')}\n              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
        authMethod === 'email'\n                  ? 'bg-white text-gray-900 shadow-sm'\n                  : 'text-gray-600 hover:text-gray-900'\n              }`}\n            >\n              Email\n            </button>\n          </div>\n\n          {mode === 'signup' && (\n            <div>\n              <label className=\"block text-sm font-bold text-gray-700 mb-2\">Full Name</label>\n              <input\n                className=\"w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400\"\n                placeholder=\"Enter your full name\"\n                value={name}\n                onChange={e => setName(e.target.value)}\n                disabled={loading}\n              />\n            </div>\n          )}\n\n          {authMethod === 'email' ? (\n            <div>\n              <label className=\"block text-sm font-bold text-gray-700 mb-2\">Email Address</label>\n              <input\n                type=\"email\"\n                className=\"w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400\"\n                placeholder=\"your@email.com\"\n                value={email}\n                onChange={e => setEmail(e.target.value)}\n                disabled={loading}\n              />\n            </div>\n          ) : (\n            <div>\n              <label className=\"block text-sm font-bold text-gray-700 mb-2\">Phone Number</label>\n              <input\n                type=\"tel\"\n                className=\"w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400\"\n                placeholder=\"08012345678\"\n                value={phone}\n                onChange={e => setPhone(e.target.value)}\n                disabled={loading}\n              />\n            </div>\n          )}\n\n          <div>\n            <label className=\"block text-sm font-bold text-gray-700 mb-2\">Password</label>\n            <div className=\"relative\">\n              <input\n                type={showPassword ? 'text' : 'password'}\n                className=\"w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400\"\n                placeholder=\"Enter your password\"\n                value={password}\n                onChange={e => setPassword(e.target.value)}\n                disabled={loading}\n              />\n              <button\n                type=\"button\"\n                onClick={() => setShowPassword(!showPassword)}\n                className=\"absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors\"\n                disabled={loading}\n              >\n                {showPassword ? '👁️' : '👁️‍🗨'}\n              </button>\n            </div>\n            <p className=\"text-xs text-gray-500 mt-1\">Minimum 8 characters</p>\n          </div>\n\n          {mode === 'signup' && (\n            <div>\n              <label className=\"block text-sm font-bold text-gray-700 mb-2\">Confirm Password</label>\n              <input\n                type=\"password\"\n                className=\"w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400\"\n                placeholder=\"Confirm your password\"\n                value={confirmPassword}\n                onChange={e => setConfirmPassword(e.target.value)}\n                disabled={loading}\n              />\n            </div>\n          )}\n\n          <button\n            type=\"submit\"\n            disabled={loading}\n            className=\"w-full py-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg\"\n            style={{ backgroundColor: colors.primary }}\n          >\n            {loading ? (\n              <><Loader size={18} className=\"animate-spin\" /> Please wait…</>\n            ) : mode === 'login' ? (\n              <><LogIn size={18} /> Sign In</>\n            ) : (\n              <><UserPlus size={18} /> Create Account</>\n            )}\n          </button>\n\n          {/* Divider */}\n          <div className=\"relative my-6\">\n            <div className=\"absolute inset-0 flex items-center\">\n              <div className=\"w-full border-t border-gray-200\" />\n            </div>\n            <div className=\"relative flex justify-center text-sm\">\n              <span className=\"px-4 bg-white text-gray-500\">Or continue with</span>\n            </div>\n          </div>\n\n          {/* Social Sign In Options */}\n          <div className=\"grid grid-cols-2 gap-3\">\n            {/* Google Sign In */}\n            <button\n              type=\"button\"\n              onClick={handleGoogleLogin}\n              disabled={googleLoading || loading}\n              className=\"flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed\"\n            >\n              {googleLoading ? (\n                <Loader size={16} className=\"animate-spin\" />\n              ) : (\n                <>\n                  <Chrome size={18} style={{ color: '#4285F4' }} />\n                  <span className=\"text-sm font-medium text-gray-700\">Google</span>\n                </>\n              )}\n            </button>\n\n            {/* Passkey / Bi-pattern Sign In */}\n            <button\n              type=\"button\"\n              onClick={() => setError('Passkey sign-in is coming soon!')}\n              disabled={loading}\n              className=\"flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed\"\n            >\n              <Fingerprint size={18} style={{ color: colors.secondary }} />\n              <span className=\"text-sm font-medium text-gray-700\">Passkey</span>\n            </button>\n          </div>\n\n          <div className=\"text-center text-xs text-gray-500 mt-4\">\n            {mode === 'login' ? (\n              <>Don't have an account?{' '}\n                <button \n                  type=\"button\" \n                  onClick={() => { setMode('signup'); setError('') }} \n                  className=\"font-semibold transition-colors hover:underline\"\n                  style={{ color: colors.primary }}\n                >\n                  Sign up\n                </button>\n              </>\n            ) : (\n              <>Already have an account?{' '}\n                <button \n                  type=\"button\" \n                  onClick={() => { setMode('login'); setError('') }} \n                  className=\"font-semibold transition-colors hover:underline\"\n                  style={{ color: colors.primary }}\n                >\n                  Sign in\n                </button>\n              </>\n            )}\n          </div>\n        </form>\n      </div>\n    </div>\n  )\n}
