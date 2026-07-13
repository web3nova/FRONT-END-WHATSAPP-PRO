import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { acceptInvite } from '../../api/teamApi'

const PRIMARY = '#4166F5'

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Invalid invite link.</p>
          <Link to="/login" className="text-sm font-semibold" style={{ color: PRIMARY }}>Go to login</Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    try {
      await acceptInvite(token, name, password)
      navigate('/login?invited=1')
    } catch (err) {
      setError(err.message || 'Failed to accept invite. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F8F4E8' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/BizIq8.png" alt="BizIQ" className="h-9 w-auto mx-auto mb-1" />
          <h1 className="text-xl font-bold text-gray-900">You've been invited!</h1>
          <p className="text-sm text-gray-500 mt-1">Set up your account to join the team.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name</label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Choose a Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50 pr-10"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !name.trim() || password.length < 8}
              className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: PRIMARY }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Setting up…' : 'Accept & Join Team'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="font-semibold" style={{ color: PRIMARY }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
