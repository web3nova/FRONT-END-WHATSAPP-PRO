import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Trash2, Send, Bot, RefreshCw, X } from 'lucide-react'
import { fetchDocuments, uploadDocument } from '../../api/knowledgeApi'
import { sendChatMessage, clearMemory } from '../../api/aiApi'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const statusConfig = {
  ready: { icon: CheckCircle, color: PRIMARY, bg: '#dce5fd', label: 'Indexed' },
  processing: { icon: Clock, color: '#d97706', bg: CREAM, label: 'Processing' },
  failed: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
  pending: { icon: Clock, color: '#6b7280', bg: '#f3f4f6', label: 'Pending' },
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]
const ALLOWED_EXT = '.pdf, .docx, .txt'
const MAX_SIZE_MB = 15

export default function Knowledge() {
  const [docs, setDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [docsError, setDocsError] = useState('')

  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')

  const [chat, setChat] = useState([])
  const [testInput, setTestInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)
  // Stable conversation ID for the test chat — one per page session
  const conversationId = useRef(`test-${crypto.randomUUID()}`)

  const loadDocs = useCallback(async () => {
    setDocsLoading(true)
    setDocsError('')
    try {
      const data = await fetchDocuments()
      setDocs(data)
    } catch (err) {
      setDocsError(err.message || 'Failed to load documents')
    } finally {
      setDocsLoading(false)
    }
  }, [])

  useEffect(() => { loadDocs() }, [loadDocs])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, aiLoading])

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file) return

    setUploadError('')

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(`Unsupported file type. Please upload ${ALLOWED_EXT}`)
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${MAX_SIZE_MB}MB`)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      await uploadDocument(file, setUploadProgress)
      await loadDocs()
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const sendTest = async () => {
    const message = testInput.trim()
    if (!message || aiLoading) return

    setTestInput('')
    setAiError('')
    setChat(prev => [...prev, { from: 'user', text: message }])
    setAiLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await sendChatMessage({ conversationId: conversationId.current, message, signal: controller.signal })
      clearTimeout(timeout)
      setChat(prev => [...prev, { from: 'ai', text: res.reply || 'No response received.' }])
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out. The AI took too long to respond.'
        : (err.message || 'AI failed to respond. Please try again.')
      setChat(prev => [...prev, { from: 'ai', text: `⚠️ ${msg}`, error: true }])
      setAiError(msg)
    } finally {
      setAiLoading(false)
    }
  }

  const handleClearChat = async () => {
    setChat([])
    setAiError('')
    try {
      await clearMemory(conversationId.current)
    } catch {
      // non-fatal
    }
    conversationId.current = `test-${crypto.randomUUID()}`
  }

  const indexedDocs = docs.filter(d => d.status === 'ready')
  const totalChunks = docs.reduce((a, d) => a + (d._count?.chunks ?? 0), 0)
  const lastUpload = docs[0]?.createdAt ? formatDate(docs[0].createdAt) : '—'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-400 mt-0.5">Upload documents to train your AI assistant</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition w-full sm:w-auto disabled:opacity-60"
          style={{ background: PRIMARY }}
        >
          <Upload size={15} /> {uploading ? `Uploading ${uploadProgress}%…` : 'Upload Document'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Documents', value: docsLoading ? '…' : docs.length },
          { label: 'Indexed Chunks', value: docsLoading ? '…' : totalChunks },
          { label: 'Indexed', value: docsLoading ? '…' : indexedDocs.length },
          { label: 'Last Upload', value: docsLoading ? '…' : lastUpload },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm border border-gray-100">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs sm:text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Upload + Document List */}
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXT}
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-colors cursor-pointer"
            style={dragging ? { borderColor: PRIMARY, background: '#dce5fd' } : { borderColor: '#e5e7eb', background: CREAM }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: dragging ? PRIMARY : '#dce5fd' }}>
              <Upload size={22} style={{ color: dragging ? '#fff' : PRIMARY }} />
            </div>
            {uploading ? (
              <>
                <div className="text-sm font-semibold text-gray-900 mb-2">Uploading…</div>
                <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs mx-auto">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: PRIMARY }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">{uploadProgress}%</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-900 mb-1">Drop files here to upload</div>
                <div className="text-xs text-gray-400 mb-3">Supports PDF, DOCX, TXT · Max {MAX_SIZE_MB}MB per file</div>
                <button
                  type="button"
                  className="text-xs font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
                  style={{ background: PRIMARY }}
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{uploadError}</span>
              <button onClick={() => setUploadError('')} className="ml-auto"><X size={13} /></button>
            </div>
          )}

          {/* Document list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Uploaded Documents</h2>
              <button onClick={loadDocs} className="p-1 text-gray-400 hover:text-gray-600 transition">
                <RefreshCw size={13} />
              </button>
            </div>

            {docsLoading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Loading documents…</div>
            ) : docsError ? (
              <div className="px-5 py-8 text-center text-sm text-red-500">{docsError}</div>
            ) : docs.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No documents yet. Upload one above.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {docs.map(doc => {
                  const s = statusConfig[doc.status] ?? statusConfig.pending
                  const Icon = s.icon
                  return (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CREAM }}>
                          <FileText size={16} style={{ color: PRIMARY }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{doc.filename}</div>
                          <div className="text-xs text-gray-400">
                            {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 border-t border-gray-50 pt-2 sm:border-0 sm:pt-0">
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
                          <Icon size={11} />
                          {s.label}
                        </span>
                        {doc.status === 'failed' && (
                          <button onClick={loadDocs} className="p-1 text-gray-300 hover:text-blue-500 transition">
                            <RefreshCw size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Test Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[420px] sm:h-[480px]">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#dce5fd' }}>
              <Bot size={16} style={{ color: PRIMARY }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Test AI Responses</h2>
              <p className="text-xs text-gray-400">Ask questions to test what your AI knows</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {chat.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }} />
                Live
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f9fafb' }}>
            {chat.length === 0 && !aiLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#dce5fd' }}>
                  <Bot size={18} style={{ color: PRIMARY }} />
                </div>
                <p className="text-sm text-gray-500 font-medium">Ask your AI anything</p>
                <p className="text-xs text-gray-400">Try: "What are your delivery timelines?" or "What sizes do you carry?"</p>
              </div>
            )}

            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={m.from === 'user'
                    ? { background: PRIMARY, color: '#fff', borderBottomRightRadius: 4 }
                    : { background: CREAM, color: '#1e293b', borderBottomLeftRadius: 4 }}
                >
                  {m.from === 'ai' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot size={11} style={{ color: PRIMARY }} />
                      <span className="text-xs font-semibold" style={{ color: PRIMARY }}>AI Agent</span>
                    </div>
                  )}
                  {m.text}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background: CREAM, borderBottomLeftRadius: 4 }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Bot size={11} style={{ color: PRIMARY }} />
                    <span className="text-xs font-semibold" style={{ color: PRIMARY }}>AI Agent</span>
                  </div>
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: PRIMARY, animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: PRIMARY, animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: PRIMARY, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {aiError && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex items-center gap-2">
              <AlertCircle size={12} />
              {aiError}
              <button onClick={() => setAiError('')} className="ml-auto"><X size={11} /></button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendTest()}
              disabled={aiLoading}
              className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none disabled:opacity-60"
              placeholder="Ask your AI a question…"
            />
            <button
              onClick={sendTest}
              disabled={aiLoading || !testInput.trim()}
              className="p-2.5 rounded-xl text-white hover:opacity-90 transition disabled:opacity-40"
              style={{ background: PRIMARY }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
