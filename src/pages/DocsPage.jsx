import React from 'react';
import { Link } from 'react-router-dom';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#4166F5] flex flex-col">
      <nav className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
            <img src="/BizIq.png" alt="BizIQ" className="h-8 w-auto" />
        </Link>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Back to Home
        </Link>
      </nav>
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Documentation</h1>
        <p className="text-lg text-white/80 max-w-lg mb-8">
          We're currently building out comprehensive guides, API references, and tutorials to help you get the most out of Biz AI. 
        </p>
        <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-[#4166F5] font-semibold text-sm">
          Coming Soon
        </div>
      </main>
    </div>
  );
}
