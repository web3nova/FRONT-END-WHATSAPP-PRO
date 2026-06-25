import React from 'react';
import { Link } from 'react-router-dom';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F8F4E8] text-[#4166F5] font-bold text-lg leading-none">B</div>
            <span className="text-xl font-bold text-[#050040] tracking-tight">BizAI</span>
        </Link>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Back to Home
        </Link>
      </nav>
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Documentation</h1>
        <p className="text-lg text-gray-600 max-w-lg mb-8">
          We're currently building out comprehensive guides, API references, and tutorials to help you get the most out of Biz AI. 
        </p>
        <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#F8F4E8] text-[#4166F5] font-semibold text-sm">
          Coming Soon
        </div>
      </main>
    </div>
  );
}
