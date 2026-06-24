import { useState } from 'react'
import {
  Search, Send, Bot, UserCheck, Phone, MoreHorizontal,
  Zap, CheckCheck, AlertCircle, FileText, ShoppingBag, ChevronLeft, X
} from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const conversations = [
  {
    id: 1,
    customer: 'Emeka Nwosu',
    phone: '+234 801 234 5678',
    avatar: 'EN',
    lastMessage: "I'll make the transfer now",
    time: '2m ago',
    unread: 1,
    aiHandling: true,
    stage: 'ordering',
    interest: 'Corset Dress',
    size: 'Size 12',
    budget: '₦80,000',
    delivery: 'July 15, 2026',
  },
  {
    id: 2,
    customer: 'Sarah Adeyemi',
    phone: '+234 802 345 6789',
    avatar: 'SA',
    lastMessage: 'What sizes are available for the bridal gown?',
    time: '15m ago',
    unread: 0,
    aiHandling: true,
    stage: 'gathering',
    interest: 'Bridal Gown',
    size: null,
    budget: null,
    delivery: null,
  },
  {
    id: 3,
    customer: 'David Okonkwo',
    phone: '+234 803 456 7890',
    avatar: 'DO',
    lastMessage: 'Can I see some native attire samples?',
    time: '1h ago',
    unread: 0,
    aiHandling: false,
    stage: 'gathering',
    interest: 'Native Attire',
    size: 'XL',
    budget: '₦45,000',
    delivery: null,
  },
  {
    id: 4,
    customer: 'Grace Eze',
    phone: '+234 804 567 8901',
    avatar: 'GE',
    lastMessage: 'Thank you! I got the confirmation.',
    time: '2h ago',
    unread: 0,
    aiHandling: true,
    stage: 'complete',
    interest: 'Senator Wear',
    size: 'M',
    budget: '₦50,000',
    delivery: 'Jun 30, 2026',
  },
  {
    id: 5,
    customer: 'Blessing Osei',
    phone: '+234 805 678 9012',
    avatar: 'BO',
    lastMessage: 'My budget is flexible, what do you recommend?',
    time: '3h ago',
    unread: 0,
    aiHandling: true,
    stage: 'gathering',
    interest: 'Bridal Gown',
    size: null,
    budget: null,
    delivery: 'August 10, 2026',
  },
]

const chatHistory = {
  1: [
    { id: 1, from: 'customer', text: "Hello, I need a corset dress for my wife's birthday", time: '10:32 AM', read: true },
    { id: 2, from: 'ai', text: "Hello! 👋 Welcome to Perfect Style Edits. I'd be happy to help you find the perfect corset dress!\n\nTo get you the best option, I have a few quick questions:\n• When is her birthday?\n• What size does she wear?\n• Do you have a budget in mind?", time: '10:32 AM', read: true },
    { id: 3, from: 'customer', text: 'Her birthday is July 15. She wears size 12. Budget is around 80k', time: '10:34 AM', read: true },
    { id: 4, from: 'ai', text: "Perfect! I've noted everything 📝\n\n✅ Delivery by: July 15\n✅ Size: 12\n✅ Budget: ₦80,000\n\nGreat news — our Corset Dress starts at exactly ₦80,000 and we can deliver well before July 15!\n\nWould you like me to generate a formal quotation?", time: '10:35 AM', read: true },
    { id: 5, from: 'customer', text: 'Yes please generate the quote', time: '10:36 AM', read: true },
    { id: 6, from: 'system', text: '📄 AI generated Quotation #QT-0089 · ₦80,000', time: '10:36 AM' },
    { id: 7, from: 'ai', text: "I've generated your quotation! 🎉\n\n📋 Quotation #QT-0089\n• Item: Corset Dress (Size 12)\n• Amount: ₦80,000\n• Ready by: July 10, 2026\n\nTo confirm your order, please pay a 50% deposit (₦40,000):\n\nAcc Name: Perfect Style Edits\nBank: GT Bank · 0123456789\n\nShall I confirm your order once payment is made?", time: '10:36 AM', read: true },
    { id: 8, from: 'customer', text: "I'll make the transfer now", time: '10:38 AM', read: false },
  ],
  2: [
    { id: 1, from: 'customer', text: 'Hi, I want to inquire about bridal gowns', time: '10:20 AM', read: true },
    { id: 2, from: 'ai', text: "Hello! 💍 Congratulations on your upcoming wedding! We have a beautiful collection of custom bridal gowns.\n\nWhat sizes are available? We make sizes 8–22, all fully customised to your measurements.\n\nWhen is your wedding date?", time: '10:20 AM', read: true },
    { id: 3, from: 'customer', text: 'What sizes are available for the bridal gown?', time: '10:21 AM', read: true },
  ],
  3: [
    { id: 1, from: 'customer', text: 'Good afternoon, I need native attire for an event', time: '9:15 AM', read: true },
    { id: 2, from: 'ai', text: "Good afternoon! 🎊 We make beautiful custom native attire for all occasions. \n\nWhat type of event is it? And do you have a preferred fabric or style in mind?", time: '9:15 AM', read: true },
    { id: 3, from: 'customer', text: 'It\'s a traditional wedding. XL size. Budget around 45k', time: '9:18 AM', read: true },
    { id: 4, from: 'ai', text: 'Perfect for a traditional wedding! We have amazing native attire options at ₦40,000–₦55,000 for XL.\n\nCan I see some native attire samples?', time: '9:19 AM', read: true },
    { id: 5, from: 'customer', text: 'Can I see some native attire samples?', time: '9:45 AM', read: true },
    { id: 6, from: 'system', text: '👤 Staff took over this conversation', time: '9:46 AM' },
  ],
  4: [
    { id: 1, from: 'customer', text: 'I need a senator wear for my husband', time: '8:10 AM', read: true },
    { id: 2, from: 'ai', text: 'Great choice! Our Senator Wear starts at ₦50,000. What size is your husband?', time: '8:10 AM', read: true },
    { id: 3, from: 'customer', text: 'Size M, budget 50k, need it by June 30', time: '8:12 AM', read: true },
    { id: 4, from: 'ai', text: 'Perfect! I\'ll generate a quotation for you right away.', time: '8:12 AM', read: true },
    { id: 5, from: 'system', text: '📄 AI generated Quotation #QT-0086 · ₦50,000', time: '8:13 AM' },
    { id: 6, from: 'system', text: '🛍️ Order #ORD-1044 created', time: '8:14 AM' },
    { id: 7, from: 'ai', text: 'Your order is confirmed! 🎉\n\nOrder #ORD-1044 · Senator Wear (M) · ₦50,000\nDelivery: June 30, 2026\n\nWe\'ll send you updates as we progress. Thank you!', time: '8:14 AM', read: true },
    { id: 8, from: 'customer', text: 'Thank you! I got the confirmation.', time: '8:20 AM', read: true },
  ],
  5: [
    { id: 1, from: 'customer', text: 'Hello, I need a bridal gown for August', time: '7:30 AM', read: true },
    { id: 2, from: 'ai', text: 'Hello! 💍 August is a wonderful time for a wedding! We\'d love to create your perfect gown.\n\nWhat\'s your size and do you have a style in mind?', time: '7:30 AM', read: true },
    { id: 3, from: 'customer', text: 'My budget is flexible, what do you recommend?', time: '7:45 AM', read: true },
  ],
}

const stages = [
  { key: 'gathering', label: 'Collecting Info', step: 1 },
  { key: 'quoting', label: 'Quoting', step: 2 },
  { key: 'ordering', label: 'Ordering', step: 3 },
  { key: 'complete', label: 'Complete', step: 4 },
]

const stageStep = { gathering: 1, quoting: 2, ordering: 3, complete: 4 }

export default function WhatsAppPage() {
  const [selectedId, setSelectedId] = useState(1)
  const [inputText, setInputText] = useState('')
  const [aiHandling, setAiHandling] = useState(true)
  const [filter, setFilter] = useState('all')
  const [mobilePanel, setMobilePanel] = useState('list')

  const selected = conversations.find(c => c.id === selectedId)
  const messages = chatHistory[selectedId] || []
  const currentStep = stageStep[selected?.stage] || 1

  const filteredConvs = conversations.filter(c => {
    if (filter === 'ai') return c.aiHandling
    if (filter === 'staff') return !c.aiHandling
    return true
  })

  const handleConvSelect = (id) => {
    setSelectedId(id)
    setMobilePanel('chat')
  }

  return (
    <div className="flex min-h-[600px] lg:h-[calc(100vh-64px-48px)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">

      {/* Left — Conversation List */}
      <div
        className={`${mobilePanel === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 flex-col border-r border-gray-100 flex-shrink-0`}
        style={{ background: CREAM }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">WhatsApp Inbox</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: PRIMARY }}>
              {conversations.filter(c => c.unread > 0).length} new
            </span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': PRIMARY }}
              placeholder="Search conversations..."
            />
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 mt-2">
            {[['all', 'All'], ['ai', 'AI'], ['staff', 'Staff']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition"
                style={filter === key ? { background: PRIMARY, color: '#fff' } : { background: 'white', color: '#6b7280' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(conv => (
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
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{conv.customer}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-1.5">{conv.lastMessage}</div>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
                      style={conv.aiHandling
                        ? { background: '#dce5fd', color: PRIMARY }
                        : { background: '#f3f4f6', color: '#6b7280' }}
                    >
                      {conv.aiHandling ? <Bot size={10} /> : <UserCheck size={10} />}
                      {conv.aiHandling ? 'AI' : 'Staff'}
                    </div>
                    {conv.unread > 0 && (
                      <span
                        className="text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
                        style={{ background: PRIMARY }}
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Middle — Chat Window */}
      <div className={`${mobilePanel === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0`}>
        {/* Chat header */}
        <div className="h-14 flex items-center justify-between px-3 lg:px-5 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-xl"
              onClick={() => setMobilePanel('list')}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: PRIMARY }}>
              {selected?.avatar}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{selected?.customer}</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Phone size={10} />
                {selected?.phone}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI toggle */}
            <button
              onClick={() => setAiHandling(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition"
              style={aiHandling
                ? { background: '#dce5fd', color: PRIMARY, borderColor: '#c7d2fb' }
                : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              {aiHandling ? <Bot size={13} /> : <UserCheck size={13} />}
              {aiHandling ? 'AI Handling' : 'Staff Handling'}
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition">
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: '#f9fafb' }}>
          {messages.map(msg => {
            if (msg.from === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                    {msg.text}
                  </span>
                </div>
              )
            }

            const isCustomer = msg.from === 'customer'
            return (
              <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[72%] ${isCustomer ? 'order-2' : ''}`}>
                  {!isCustomer && (
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <Bot size={11} style={{ color: PRIMARY }} />
                      <span className="text-xs font-medium" style={{ color: PRIMARY }}>AI Agent</span>
                    </div>
                  )}
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm"
                    style={isCustomer
                      ? { background: CREAM, color: '#1e293b', borderBottomLeftRadius: 4 }
                      : { background: PRIMARY, color: '#ffffff', borderBottomRightRadius: 4 }}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                    {!isCustomer && (
                      <CheckCheck size={12} className={msg.read ? 'text-blue-400' : 'text-gray-300'} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3 bg-white flex-shrink-0">
          {aiHandling && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <Bot size={13} style={{ color: PRIMARY }} />
              <span className="text-xs" style={{ color: PRIMARY }}>AI is handling this conversation · </span>
              <button
                onClick={() => setAiHandling(false)}
                className="text-xs font-semibold underline"
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
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setInputText('') } }}
              placeholder={aiHandling ? 'AI is responding automatically...' : 'Type a message...'}
              disabled={aiHandling}
              className="flex-1 resize-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: 100 }}
            />
            <button
              disabled={aiHandling || !inputText.trim()}
              className="p-2.5 rounded-xl text-white transition disabled:opacity-40 flex-shrink-0"
              style={{ background: PRIMARY }}
              onClick={() => setInputText('')}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right — Customer Context */}
      <div className="hidden xl:flex w-72 flex-col border-l border-gray-100 flex-shrink-0 overflow-y-auto" style={{ background: '#ffffff' }}>
        {/* Customer info */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: PRIMARY }}>
              {selected?.avatar}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{selected?.customer}</div>
              <div className="text-xs text-gray-400">{selected?.phone}</div>
              <div className="text-xs mt-0.5" style={{ color: PRIMARY }}>
                {conversations.indexOf(selected) === 0 ? 'New customer' : 'Returning customer'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Stage */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conversation Stage</div>
          <div className="space-y-2">
            {stages.map((stage, i) => {
              const done = currentStep > stage.step
              const active = currentStep === stage.step
              return (
                <div key={stage.key} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={done
                      ? { background: PRIMARY, color: '#fff' }
                      : active
                        ? { background: '#dce5fd', color: PRIMARY, border: `2px solid ${PRIMARY}` }
                        : { background: '#f1f5f9', color: '#9ca3af' }}
                  >
                    {done ? '✓' : stage.step}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: active ? PRIMARY : done ? '#374151' : '#9ca3af', fontWeight: active || done ? 600 : 400 }}
                  >
                    {stage.label}
                  </span>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full ml-auto animate-pulse" style={{ background: PRIMARY }}></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Extracted Info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Extracted Info</div>
          <div className="space-y-2">
            {[
              { label: 'Product', value: selected?.interest },
              { label: 'Size', value: selected?.size },
              { label: 'Budget', value: selected?.budget },
              { label: 'Delivery', value: selected?.delivery },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{item.label}</span>
                {item.value
                  ? <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                  : <span className="text-xs text-gray-300 italic">Not collected</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</div>
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              <FileText size={15} />
              Generate Quotation
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
              style={{ background: '#dce5fd', color: PRIMARY }}
            >
              <ShoppingBag size={15} />
              Create Order
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white transition hover:bg-gray-50"
              onClick={() => setAiHandling(false)}
            >
              <UserCheck size={15} />
              Escalate to Staff
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-100 bg-red-50 transition hover:bg-red-100"
            >
              <X size={15} />
              End Conversation
            </button>
          </div>
        </div>

        {/* AI confidence */}
        <div className="px-4 pb-4 mt-auto">
          <div className="rounded-xl p-3 border border-gray-100" style={{ background: CREAM }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} style={{ color: PRIMARY }} />
              <span className="text-xs font-semibold" style={{ color: PRIMARY }}>AI Confidence</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden mb-1">
              <div className="h-full rounded-full" style={{ width: '92%', background: PRIMARY }}></div>
            </div>
            <div className="text-xs text-gray-500">92% — Based on uploaded knowledge base</div>
          </div>
        </div>
      </div>

    </div>
  )
}
