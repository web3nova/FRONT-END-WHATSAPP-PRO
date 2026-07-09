import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Send, Bot, UserCheck, Phone, MoreHorizontal,
  Zap, CheckCheck, AlertCircle, FileText, ShoppingBag, ChevronLeft, X,
  Link2, Loader2, CheckCircle2,
} from 'lucide-react'
import { fetchWhatsappAccount, connectWhatsapp } from '../../api/whatsappApi'
import { listConversations, getConversationMessages, takeOverConversation, releaseConversation, sendStaffMessage, subscribeToEvents } from '../../api/conversationsApi'
import { createOrder } from '../../api/ordersApi'
import { createQuote } from '../../api/quotesApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name, phone) {
  if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (phone || '??').slice(-2).toUpperCase()
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatTimeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ─── Facebook SDK ─────────────────────────────────────────────────────────────

function loadFbSdk(appId) {
  return new Promise((resolve) => {
    if (window.FB) { resolve(window.FB); return }
    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v20.0' })
      resolve(window.FB)
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  })
}

// ─── Connect Banner ───────────────────────────────────────────────────────────

function ConnectBanner({ onConnected }) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  const META_APP_ID = import.meta.env.VITE_META_APP_ID
  const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID

  const handleConnect = async () => {
    setError('')

    if (!META_APP_ID || !META_CONFIG_ID) {
      setError('META_APP_ID / META_CONFIG_ID not configured. Add VITE_META_APP_ID and VITE_META_CONFIG_ID to your .env file.')
      return
    }

    setConnecting(true)
    try {
      const FB = await loadFbSdk(META_APP_ID)

      let sessionInfo = {}
      const messageListener = (e) => {
        if (typeof e.data === 'string') {
          try {
            const data = JSON.parse(e.data)
            if (data.type === 'WA_EMBEDDED_SIGNUP') sessionInfo = data.data || {}
          } catch { /* non-JSON messages */ }
        }
      }
      window.addEventListener('message', messageListener)

      await new Promise((resolve, reject) => {
        FB.login(
          (response) => {
            window.removeEventListener('message', messageListener)
            if (response.authResponse?.code) resolve(response.authResponse.code)
            else reject(new Error(response.status === 'unknown' ? 'Popup closed' : 'Meta login failed'))
          },
          {
            config_id: META_CONFIG_ID,
            response_type: 'code',
            override_default_response_type: true,
            extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
          }
        )
      }).then(async (code) => {
        await connectWhatsapp({
          code,
          redirectUri: '',
          wabaId: sessionInfo.waba_id ?? '',
          phoneNumberId: sessionInfo.phone_number_id ?? '',
        })
        onConnected()
      })
    } catch (err) {
      setError(err.message || 'Connection failed. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="max-w-md w-full mx-auto text-center px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: '#dce5fd' }}
        >
          <Link2 size={28} style={{ color: PRIMARY }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect your WhatsApp</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Link your WhatsApp Business number to start receiving messages and let your AI agent handle customer conversations automatically.
        </p>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-left">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60"
          style={{ background: PRIMARY }}
        >
          {connecting
            ? <><Loader2 size={16} className="animate-spin" /> Connecting…</>
            : <><Link2 size={16} /> Connect via Meta Embedded Signup</>
          }
        </button>

        <p className="text-xs text-gray-400 mt-4">
          You'll be guided through Meta's secure WhatsApp Business setup. This takes about 2 minutes.
        </p>
      </div>
    </div>
  )
}

// ─── Connected Badge ──────────────────────────────────────────────────────────

const STATUS_STYLES = {
  CONNECTED:    { color: '#16a34a', label: 'Connected' },
  PENDING:      { color: '#d97706', label: 'Pending Review' },
  FLAGGED:      { color: '#dc2626', label: 'Flagged' },
  RESTRICTED:   { color: '#dc2626', label: 'Restricted' },
  RATE_LIMITED: { color: '#d97706', label: 'Rate Limited' },
}

function ConnectedBadge({ account }) {
  const statusStyle = STATUS_STYLES[account.status] ?? STATUS_STYLES.CONNECTED

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: statusStyle.color }}>
        <CheckCircle2 size={13} />
        WhatsApp Connected
      </div>
      <span className="text-xs text-gray-400">
        {account.phoneNumber || `ID: ${account.phoneNumberId}`}
      </span>
      {account.status && (
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${statusStyle.color}18`, color: statusStyle.color }}
        >
          {statusStyle.label}
        </span>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  // WhatsApp account connection
  const [account, setAccount] = useState(undefined) // undefined = loading, null = not connected
  const [accountLoading, setAccountLoading] = useState(true)

  // Conversations
  const [conversations, setConversations] = useState([])
  const [convsLoading, setConvsLoading] = useState(true)
  const [convsError, setConvsError] = useState('')

  // Active conversation
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgsLoading, setMsgsLoading] = useState(false)

  // UI state
  const [filter, setFilter] = useState('all')
  const [mobilePanel, setMobilePanel] = useState('list')
  const [togglingMode, setTogglingMode] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Generate Quotation modal
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ description: '', amountNaira: '' })
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [quoteError, setQuoteError] = useState('')

  // Create Order modal
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ product: '', size: '', amountNaira: '', status: 'pending' })
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')

  const messagesEndRef = useRef(null)

  // Load WhatsApp account status
  const loadAccount = useCallback(async () => {
    setAccountLoading(true)
    try {
      const acc = await fetchWhatsappAccount()
      setAccount(acc)
    } catch {
      setAccount(null)
    } finally {
      setAccountLoading(false)
    }
  }, [])

  useEffect(() => { loadAccount() }, [loadAccount])

  // ?conversation=<id> — deep link from a notification click
  const [searchParams, setSearchParams] = useSearchParams()
  const deepLinkId = searchParams.get('conversation')

  // Load conversations once account is confirmed connected
  useEffect(() => {
    if (!account?.verified) return
    let ignore = false
    setConvsLoading(true)
    listConversations({ limit: 50 })
      .then(({ data }) => {
        if (!ignore) {
          setConversations(data)
          if (data.length) setSelectedId(prev => prev ?? data[0].id)
        }
      })
      .catch(err => { if (!ignore) setConvsError(err.message) })
      .finally(() => { if (!ignore) setConvsLoading(false) })
    return () => { ignore = true }
  }, [account])

  // Select the deep-linked conversation once it exists in the loaded list,
  // then clear the param so refresh/back doesn't re-trigger it.
  useEffect(() => {
    if (!deepLinkId || !conversations.length) return
    const target = conversations.find(c => c.id === deepLinkId)
    if (target) {
      setSelectedId(target.id)
      setMobilePanel('chat')
      setSearchParams({}, { replace: true })
    }
  }, [deepLinkId, conversations])

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedId) { setMessages([]); return }
    let ignore = false
    setMsgsLoading(true)
    getConversationMessages(selectedId, { limit: 100 })
      .then(({ data }) => { if (!ignore) setMessages(data) })
      .catch(() => { if (!ignore) setMessages([]) })
      .finally(() => { if (!ignore) setMsgsLoading(false) })
    return () => { ignore = true }
  }, [selectedId])

  // Keep a stable ref to selectedId so the SSE handler can read it without re-subscribing
  const selectedIdRef = useRef(selectedId)
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

  // SSE — real-time message delivery (runs once account is verified)
  useEffect(() => {
    if (!account?.verified) return
    const unsubscribe = subscribeToEvents({
      onMessage: (event, data) => {
        if (event === 'new_message' || event === 'ai_message' || event === 'staff_message') {
          const { conversationId, message } = data
          if (conversationId === selectedIdRef.current) {
            setMessages(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message])
          }
          setConversations(prev => {
            const existing = prev.find(c => c.id === conversationId)
            if (!existing) {
              listConversations({ limit: 50 }).then(({ data: d }) => setConversations(d)).catch(() => {})
              return prev
            }
            const updated = { ...existing, updatedAt: new Date().toISOString() }
            return [updated, ...prev.filter(c => c.id !== conversationId)]
          })
        }
        if (event === 'conversation_updated') {
          const { conversationId, status } = data
          setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status } : c))
        }
      }
    })
    return unsubscribe
  }, [account])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selected = conversations.find(c => c.id === selectedId)

  const filteredConvs = conversations.filter(c => {
    if (filter === 'open') return c.status === 'open' || c.status === 'human'
    if (filter === 'closed') return c.status === 'closed'
    return true
  })

  const handleConvSelect = (id) => {
    setSelectedId(id)
    setMobilePanel('chat')
  }

  const handleToggleMode = async () => {
    if (!selectedId || togglingMode) return
    const isHuman = selected?.status === 'human'
    setTogglingMode(true)
    try {
      if (isHuman) {
        await releaseConversation(selectedId)
        setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, status: 'open' } : c))
      } else {
        await takeOverConversation(selectedId)
        setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, status: 'human' } : c))
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setTogglingMode(false)
    }
  }

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !selectedId || sending) return
    setSending(true)
    try {
      const msg = await sendStaffMessage(selectedId, text)
      setInputText('')
      // SSE will deliver the staff_message event but add optimistically too
      setMessages(prev => prev.some(m => m.id === msg?.message?.id) ? prev : [...prev, {
        id: msg?.message?.id || `tmp-${Date.now()}`,
        conversationId: selectedId,
        role: 'staff',
        content: text,
        createdAt: new Date().toISOString(),
      }])
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleCreateQuote = async e => {
    e.preventDefault()
    if (!quoteForm.amountNaira || isNaN(Number(quoteForm.amountNaira))) {
      setQuoteError('Enter a valid amount.')
      return
    }
    setQuoteSubmitting(true)
    setQuoteError('')
    try {
      await createQuote({
        customerId: selected?.customer?.id,
        conversationId: selectedId,
        amountMinor: Math.round(Number(quoteForm.amountNaira) * 100),
        currency: 'NGN',
        details: { item: quoteForm.description },
      })
      setShowQuoteModal(false)
      setQuoteForm({ description: '', amountNaira: '' })
      showToast('Quotation sent to customer via WhatsApp.')
    } catch (err) {
      setQuoteError(err.message)
    } finally {
      setQuoteSubmitting(false)
    }
  }

  const handleCreateOrder = async e => {
    e.preventDefault()
    if (!orderForm.amountNaira || isNaN(Number(orderForm.amountNaira))) {
      setOrderError('Enter a valid amount.')
      return
    }
    setOrderSubmitting(true)
    setOrderError('')
    try {
      await createOrder({
        customerId: selected?.customer?.id,
        status: orderForm.status,
        totalMinor: Math.round(Number(orderForm.amountNaira) * 100),
        items: orderForm.product
          ? [{ name: orderForm.product, ...(orderForm.size ? { size: orderForm.size } : {}) }]
          : [],
        ...(orderForm.size ? { measurements: { size: orderForm.size } } : {}),
      })
      setShowOrderModal(false)
      setOrderForm({ product: '', size: '', amountNaira: '', status: 'pending' })
      showToast('Order logged successfully.')
    } catch (err) {
      setOrderError(err.message)
    } finally {
      setOrderSubmitting(false)
    }
  }

  // ── Loading / not connected states ──────────────────────────────────────────

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (!account || !account.verified) {
    return <ConnectBanner onConnected={loadAccount} />
  }

  // ── Main inbox UI ────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl border text-sm shadow-lg ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col min-h-[600px] lg:h-[calc(100vh-64px-48px)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">

        <ConnectedBadge account={account} />

        <div className="flex flex-1 min-h-0">

          {/* ── Left: Conversation list ── */}
          <div
            className={`${mobilePanel === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 flex-col border-r border-gray-100 flex-shrink-0`}
            style={{ background: CREAM }}
          >
            <div className="px-4 pt-4 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 text-base">WhatsApp Inbox</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: PRIMARY }}>
                  {conversations.filter(c => c.status === 'open' || c.status === 'human').length} open
                </span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none"
                  placeholder="Search conversations…"
                />
              </div>
              <div className="flex gap-1 mt-2">
                {[['all', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition"
                    style={filter === key
                      ? { background: PRIMARY, color: '#fff' }
                      : { background: 'white', color: '#6b7280' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {convsLoading ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
              ) : convsError ? (
                <div className="px-4 py-6 text-center text-sm text-red-400">{convsError}</div>
              ) : filteredConvs.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">No conversations.</div>
              ) : (
                filteredConvs.map(conv => {
                  const displayName = conv.customer?.name || conv.customer?.phone || 'Unknown'
                  const isHuman = conv.status === 'human'
                  const isOpen = conv.status === 'open'
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleConvSelect(conv.id)}
                      className="w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors"
                      style={selectedId === conv.id ? { background: '#dce5fd' } : { background: 'transparent' }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: PRIMARY }}
                        >
                          {initials(conv.customer?.name, conv.customer?.phone)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">{displayName}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(conv.updatedAt)}</span>
                          </div>
                          <div className="text-xs text-gray-400 truncate mb-1.5">{conv.customer?.phone}</div>
                          <div
                            className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
                            style={isHuman
                              ? { background: '#fef9c3', color: '#92400e' }
                              : isOpen
                                ? { background: '#dce5fd', color: PRIMARY }
                                : { background: '#f3f4f6', color: '#6b7280' }}
                          >
                            {isHuman ? <UserCheck size={10} /> : isOpen ? <Bot size={10} /> : <X size={10} />}
                            {isHuman ? 'Staff' : isOpen ? 'AI' : 'Closed'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* ── Middle: Chat window ── */}
          <div className={`${mobilePanel === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0`}>
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                Select a conversation
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-3 lg:px-5 border-b border-gray-100 flex-shrink-0 bg-white">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button
                      className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-xl"
                      onClick={() => setMobilePanel('list')}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: PRIMARY }}
                    >
                      {initials(selected.customer?.name, selected.customer?.phone)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selected.customer?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone size={10} />
                        {selected.customer?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMode}
                      disabled={togglingMode}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50"
                      style={selected.status !== 'human'
                        ? { background: '#dce5fd', color: PRIMARY, borderColor: '#c7d2fb' }
                        : { background: '#fef9c3', color: '#92400e', borderColor: '#fde68a' }}
                    >
                      {selected.status !== 'human' ? <Bot size={13} /> : <UserCheck size={13} />}
                      {togglingMode ? '…' : selected.status !== 'human' ? 'AI Handling' : 'Staff Handling'}
                    </button>

                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#f9fafb' }}>
                  {msgsLoading ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                      Loading messages…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                      No messages yet.
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isCustomer = msg.role === 'customer'
                      const isAi = msg.role === 'ai'
                      return (
                        <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                          <div className="max-w-[72%]">
                            {!isCustomer && (
                              <div className="flex items-center justify-end gap-1 mb-1">
                                {isAi
                                  ? <Bot size={11} style={{ color: PRIMARY }} />
                                  : <UserCheck size={11} className="text-gray-400" />}
                                <span
                                  className="text-xs font-medium"
                                  style={{ color: isAi ? PRIMARY : '#6b7280' }}
                                >
                                  {isAi ? 'AI Agent' : 'Staff'}
                                </span>
                              </div>
                            )}
                            <div
                              className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm"
                              style={isCustomer
                                ? { background: CREAM, color: '#1e293b', borderBottomLeftRadius: 4 }
                                : { background: isAi ? PRIMARY : '#374151', color: '#fff', borderBottomRightRadius: 4 }}
                            >
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                              <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                              {!isCustomer && <CheckCheck size={12} className="text-blue-400" />}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 px-4 py-3 bg-white flex-shrink-0">
                  {selected.status !== 'human' && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <Bot size={13} style={{ color: PRIMARY }} />
                      <span className="text-xs" style={{ color: PRIMARY }}>AI is handling this conversation · </span>
                      <button
                        onClick={handleToggleMode}
                        disabled={togglingMode}
                        className="text-xs font-semibold underline disabled:opacity-50"
                        style={{ color: PRIMARY }}
                      >
                        Take over as Staff
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={1}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                      }}
                      placeholder={selected.status !== 'human' ? 'AI is responding automatically…' : 'Type a message…'}
                      disabled={selected.status !== 'human' || sending}
                      className="flex-1 resize-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ maxHeight: 100 }}
                    />
                    <button
                      disabled={selected.status !== 'human' || !inputText.trim() || sending}
                      onClick={handleSend}
                      className="p-2.5 rounded-xl text-white transition disabled:opacity-40 flex-shrink-0"
                      style={{ background: PRIMARY }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Right: Context panel ── */}
          <div className="hidden xl:flex w-72 flex-col border-l border-gray-100 flex-shrink-0 overflow-y-auto bg-white">
            {selected ? (
              <>
                {/* Customer info */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: PRIMARY }}
                    >
                      {initials(selected.customer?.name, selected.customer?.phone)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selected.customer?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-400">{selected.customer?.phone}</div>
                      <div className="text-xs mt-0.5 capitalize" style={{ color: PRIMARY }}>
                        {selected.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Conversation Info
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Channel',  value: selected.channel || 'whatsapp' },
                      { label: 'Status',   value: selected.status },
                      { label: 'Messages', value: messages.length },
                      { label: 'Updated',  value: formatTimeAgo(selected.updatedAt) },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900 capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="px-4 py-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Quick Actions
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setQuoteForm({ description: '', amountNaira: '' }); setQuoteError(''); setShowQuoteModal(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ background: PRIMARY }}
                    >
                      <FileText size={15} />
                      Generate Quotation
                    </button>
                    <button
                      onClick={() => { setOrderForm({ product: '', size: '', amountNaira: '', status: 'pending' }); setOrderError(''); setShowOrderModal(true) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                      style={{ background: '#dce5fd', color: PRIMARY }}
                    >
                      <ShoppingBag size={15} />
                      Create Order
                    </button>
                  </div>
                </div>

                {/* AI status */}
                <div className="px-4 pb-4 mt-auto">
                  <div className="rounded-xl p-3 border border-gray-100" style={{ background: CREAM }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={13} style={{ color: PRIMARY }} />
                      <span className="text-xs font-semibold" style={{ color: PRIMARY }}>AI Status</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selected.status === 'open'
                        ? 'Conversation is active. AI is monitoring incoming messages.'
                        : 'This conversation has been closed.'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400 px-4 text-center">
                Select a conversation to see details
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Generate Quotation Modal */}
      {showQuoteModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowQuoteModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Generate Quotation</h2>
                <p className="text-xs text-gray-400 mt-0.5">For: {selected.customer?.name || selected.customer?.phone}</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleCreateQuote} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Item / Description</label>
                <input
                  type="text"
                  value={quoteForm.description}
                  onChange={e => setQuoteForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Bridal Gown with beadwork"
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount (₦) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                  <input
                    type="number" min="0" step="any" required
                    value={quoteForm.amountNaira}
                    onChange={e => setQuoteForm(f => ({ ...f, amountNaira: e.target.value }))}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300"
                  />
                </div>
              </div>
              {quoteError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{quoteError}</div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={quoteSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60" style={{ background: PRIMARY }}>
                  {quoteSubmitting ? 'Saving…' : 'Save Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowOrderModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Create Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">For: {selected.customer?.name || selected.customer?.phone}</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product / Item</label>
                <input type="text" value={orderForm.product} onChange={e => setOrderForm(f => ({ ...f, product: e.target.value }))} placeholder="e.g. Corset Dress" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Size <span className="text-gray-300 font-normal">(optional)</span></label>
                <input type="text" value={orderForm.size} onChange={e => setOrderForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. M, L, 42" className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Amount (₦) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                  <input type="number" min="0" step="any" required value={orderForm.amountNaira} onChange={e => setOrderForm(f => ({ ...f, amountNaira: e.target.value }))} placeholder="0" className="w-full pl-7 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={orderForm.status} onChange={e => setOrderForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-300">
                  {[['pending','Pending'],['confirmed','Confirmed'],['paid','Paid'],['fulfilled','Fulfilled'],['cancelled','Cancelled']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              {orderError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{orderError}</div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={orderSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition disabled:opacity-60" style={{ background: PRIMARY }}>
                  {orderSubmitting ? 'Creating…' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
