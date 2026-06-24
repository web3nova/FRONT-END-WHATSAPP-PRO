import { useState } from 'react'
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Trash2, Search, Send, Bot, RefreshCw } from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const documents = [
  { id: 1, name: 'pricing.pdf', size: '124 KB', chunks: 18, status: 'indexed', uploaded: 'Jun 20, 2026' },
  { id: 2, name: 'product-catalog.pdf', size: '2.4 MB', chunks: 142, status: 'indexed', uploaded: 'Jun 18, 2026' },
  { id: 3, name: 'faq.txt', size: '48 KB', chunks: 32, status: 'indexed', uploaded: 'Jun 15, 2026' },
  { id: 4, name: 'measurement-guide.pdf', size: '380 KB', chunks: 54, status: 'indexed', uploaded: 'Jun 10, 2026' },
  { id: 5, name: 'delivery-policy.docx', size: '22 KB', chunks: 8, status: 'processing', uploaded: 'Jun 24, 2026' },
  { id: 6, name: 'fabric-guide.pdf', size: '1.1 MB', chunks: 0, status: 'failed', uploaded: 'Jun 24, 2026' },
]

const testMessages = [
  { from: 'user', text: 'How much is a corset dress?' },
  { from: 'ai', text: 'Our Corset Dress starts at ₦80,000. The price may vary depending on fabric choice and customisation. Would you like me to generate a formal quotation?' },
  { from: 'user', text: 'What is the delivery timeline?' },
  { from: 'ai', text: 'For custom orders, our standard delivery timeline is 10–14 working days. For rush orders (within 7 days), an additional ₦10,000–₦20,000 fee applies depending on the item.' },
]

const statusConfig = {
  indexed: { icon: CheckCircle, color: PRIMARY, bg: '#dce5fd', label: 'Indexed' },
  processing: { icon: Clock, color: '#d97706', bg: CREAM, label: 'Processing' },
  failed: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', label: 'Failed' },
}

export default function Knowledge() {
  const [dragging, setDragging] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [chat, setChat] = useState(testMessages)

  const sendTest = () => {
    if (!testInput.trim()) return
    setChat(prev => [
      ...prev,
      { from: 'user', text: testInput },
      { from: 'ai', text: 'Searching knowledge base... (Connect backend to get live AI responses)' },
    ])
    setTestInput('')
  }

  const totalChunks = documents.filter(d => d.status === 'indexed').reduce((a, d) => a + d.chunks, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-400 mt-0.5">Upload documents to train your AI assistant</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
          <Upload size={15} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Documents', value: documents.length },
          { label: 'Indexed Chunks', value: totalChunks },
          { label: 'AI Confidence', value: '92%' },
          { label: 'Last Trained', value: 'Today' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Upload + Document List */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false) }}
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer"
            style={dragging ? { borderColor: PRIMARY, background: '#dce5fd' } : { borderColor: '#e5e7eb', background: CREAM }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: dragging ? PRIMARY : '#dce5fd' }}>
              <Upload size={22} style={{ color: dragging ? '#fff' : PRIMARY }} />
            </div>
            <div className="text-sm font-semibold text-gray-900 mb-1">Drop files here to upload</div>
            <div className="text-xs text-gray-400 mb-3">Supports PDF, DOCX, TXT · Max 10MB per file</div>
            <button className="text-xs font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
              Browse Files
            </button>
          </div>

          {/* Document list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Uploaded Documents</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {documents.map(doc => {
                const s = statusConfig[doc.status]
                const Icon = s.icon
                return (
                  <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: CREAM }}>
                      <FileText size={16} style={{ color: PRIMARY }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-400">
                        {doc.size} · {doc.chunks > 0 ? `${doc.chunks} chunks` : '—'} · {doc.uploaded}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: s.bg, color: s.color }}>
                        <Icon size={11} />
                        {s.label}
                      </span>
                      {doc.status === 'failed' && (
                        <button className="p-1 text-gray-300 hover:text-blue-500 transition">
                          <RefreshCw size={13} />
                        </button>
                      )}
                      <button className="p-1 text-gray-300 hover:text-red-400 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Test Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#dce5fd' }}>
              <Bot size={16} style={{ color: PRIMARY }} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Test AI Responses</h2>
              <p className="text-xs text-gray-400">Ask questions to test what your AI knows</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }}></div>
              Live
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f9fafb' }}>
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
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
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <input
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendTest()}
              className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
              placeholder="Ask your AI a question..."
            />
            <button
              onClick={sendTest}
              className="p-2.5 rounded-xl text-white hover:opacity-90 transition"
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
