import { useState } from 'react'
import { Globe, Eye, Edit2, CheckCircle, ExternalLink, Palette, Image, Type, Layout, ToggleLeft, ToggleRight, Plus } from 'lucide-react'

const PRIMARY = '#4166F5'
const CREAM = '#F8F4E8'

const sections = [
  { id: 1, name: 'Hero Section', desc: 'Main banner with headline and CTA', active: true },
  { id: 2, name: 'Featured Products', desc: 'Showcase your top products', active: true },
  { id: 3, name: 'About Us', desc: 'Tell your story and brand values', active: true },
  { id: 4, name: 'Gallery', desc: 'Photo gallery of your work', active: false },
  { id: 5, name: 'Testimonials', desc: 'Customer reviews and feedback', active: true },
  { id: 6, name: 'Contact / WhatsApp CTA', desc: 'Let customers reach you', active: true },
]

const pages = [
  { name: 'Home', path: '/', status: 'published' },
  { name: 'Shop / Products', path: '/shop', status: 'published' },
  { name: 'About', path: '/about', status: 'published' },
  { name: 'Contact', path: '/contact', status: 'published' },
  { name: 'Blog', path: '/blog', status: 'draft' },
]

const sectionIcons = { 0: Layout, 1: Image, 2: Type, 3: Image, 4: Type, 5: Globe }

export default function Website() {
  const [activeSections, setActiveSections] = useState(sections.map(s => s.active))
  const [tab, setTab] = useState('pages')

  const toggle = (i) => setActiveSections(prev => prev.map((v, idx) => idx === i ? !v : v))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your storefront at perfectstyleedits.web3nova.com</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition"
          >
            <Eye size={15} /> Preview
          </a>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition" style={{ background: PRIMARY }}>
            <Globe size={15} /> Publish Changes
          </button>
        </div>
      </div>

      {/* Domain card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: CREAM }}>
            <Globe size={20} style={{ color: PRIMARY }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">perfectstyleedits.web3nova.com</div>
            <div className="text-xs text-gray-400 mt-0.5">Free subdomain · Upgrade to use a custom domain</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: PRIMARY }}>
            <CheckCircle size={14} /> Live
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90" style={{ background: PRIMARY }}>
            <ExternalLink size={12} /> Visit Site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left - controls */}
        <div className="col-span-1 space-y-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
            {['pages', 'sections', 'design'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition"
                style={tab === t ? { background: PRIMARY, color: '#fff' } : { color: '#9ca3af' }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'pages' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Pages</span>
                <button className="text-gray-400 hover:text-blue-500 transition"><Plus size={15} /></button>
              </div>
              <div className="divide-y divide-gray-50">
                {pages.map(p => (
                  <div key={p.name} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.path}</div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={p.status === 'published' ? { background: '#dce5fd', color: PRIMARY } : { background: CREAM, color: '#92400e' }}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'sections' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Home Page Sections</span>
              </div>
              <div className="divide-y divide-gray-50">
                {sections.map((s, i) => {
                  const Icon = sectionIcons[i] || Layout
                  return (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CREAM }}>
                        <Icon size={13} style={{ color: PRIMARY }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-400 truncate">{s.desc}</div>
                      </div>
                      <button onClick={() => toggle(i)} className="flex-shrink-0">
                        {activeSections[i]
                          ? <ToggleRight size={22} style={{ color: PRIMARY }} />
                          : <ToggleLeft size={22} className="text-gray-300" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand Colors</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Primary', color: PRIMARY },
                    { label: 'Background', color: CREAM },
                    { label: 'Accent', color: '#1e3fc2' },
                    { label: 'Text', color: '#1e293b' },
                  ].map(c => (
                    <div key={c.label} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg border border-gray-100 cursor-pointer" style={{ background: c.color }}></div>
                      <span className="text-xs text-gray-500">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Font</div>
                <select className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-gray-50">
                  <option>Inter (Default)</option>
                  <option>Poppins</option>
                  <option>Playfair Display</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Style</div>
                <div className="grid grid-cols-3 gap-2">
                  {['Modern', 'Classic', 'Bold'].map(s => (
                    <button
                      key={s}
                      className="py-2 text-xs font-medium rounded-lg border transition"
                      style={s === 'Modern' ? { background: PRIMARY, color: '#fff', borderColor: PRIMARY } : { borderColor: '#e5e7eb', color: '#6b7280' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right - website preview mockup */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 mx-3 bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-400">
              perfectstyleedits.web3nova.com
            </div>
            <ExternalLink size={13} className="text-gray-400" />
          </div>

          {/* Mockup content */}
          <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
            {/* Nav */}
            <div className="flex items-center justify-between px-8 py-3 border-b border-gray-100">
              <div className="font-bold text-sm" style={{ color: PRIMARY }}>Perfect Style Edits</div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Home</span><span>Shop</span><span>About</span><span>Contact</span>
              </div>
              <button className="text-xs text-white px-3 py-1.5 rounded-lg" style={{ background: PRIMARY }}>Order Now</button>
            </div>

            {/* Hero */}
            <div className="px-8 py-10 text-center" style={{ background: CREAM }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: PRIMARY }}>Custom Made & Ready To Wear</div>
              <div className="text-2xl font-bold text-gray-900 mb-3">Perfect Style Edits</div>
              <div className="text-sm text-gray-500 mb-5">Fashion that tells your story. Bespoke designs crafted with love.</div>
              <button className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl" style={{ background: PRIMARY }}>Order Now</button>
            </div>

            {/* Products */}
            <div className="px-8 py-6">
              <div className="text-center mb-4">
                <div className="text-sm font-bold text-gray-900">Featured Products</div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['Bridal Gown', 'Corset Dress', 'Senator Wear', 'Native Attire'].map((name, i) => (
                  <div key={name} className="rounded-xl overflow-hidden border border-gray-100">
                    <div className="h-20 flex items-center justify-center text-xl" style={{ background: CREAM }}>
                      {['👗', '👗', '👔', '🧣'][i]}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-900">{name}</div>
                      <div className="text-xs" style={{ color: PRIMARY }}>From ₦{[60, 80, 50, 40][i]}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="mx-8 mb-6 rounded-xl p-5 text-center" style={{ background: PRIMARY }}>
              <div className="text-sm font-bold text-white mb-1">Order via WhatsApp</div>
              <div className="text-xs text-blue-200 mb-3">Our AI assistant is available 24/7 to take your order</div>
              <button className="text-xs font-semibold text-white border border-white border-opacity-40 px-4 py-2 rounded-lg">
                Chat with us on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
