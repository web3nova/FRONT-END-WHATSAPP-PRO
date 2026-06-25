import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, MessageSquareCode } from 'lucide-react';

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Close on ESC & click outside (mobile overlay)
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    function onClickOutside(e) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpen(false);
    }

    if (menuOpen) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <section className="bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] w-full bg-no-repeat bg-cover bg-center text-sm pb-44 min-h-screen">
        {/* Semi-transparent overlay to ensure text is readable over the Unsplash image */}
        <div className="w-full min-h-screen bg-white/80 backdrop-blur-sm pb-44">
          <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full relative z-10">
            <Link to="/" aria-label="Web3Nova home" className="flex items-center gap-2">
              <MessageSquareCode size={32} className="text-[#050040]" />
              <span className="text-xl font-bold text-[#050040]">Web3Nova AI</span>
            </Link>

            <div
              id="menu"
              ref={menuRef}
              className={[
                'max-md:absolute max-md:top-0 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-screen max-md:bg-white/95 max-md:backdrop-blur-md',
                'flex items-center gap-8 font-medium text-[#050040]',
                'max-md:flex-col max-md:justify-center z-50',
                menuOpen ? 'max-md:w-full' : 'max-md:w-0',
              ].join(' ')}
              aria-hidden={!menuOpen}
            >
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>

              <div className="relative group flex items-center gap-1 cursor-pointer">
                <span>Products</span>
                <ChevronDown size={18} />
                <div className="absolute bg-white font-normal flex flex-col gap-2 w-max rounded-lg p-4 top-10 left-0 opacity-0 -translate-y-4 pointer-events-none group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-slate-100">
                  <a href="#" className="hover:translate-x-1 hover:text-blue-600 transition-all">AI Chatbot</a>
                  <a href="#" className="hover:translate-x-1 hover:text-blue-600 transition-all">Knowledge Base</a>
                  <a href="#" className="hover:translate-x-1 hover:text-blue-600 transition-all">Analytics Dashboard</a>
                </div>
              </div>

              <a href="#" className="hover:text-blue-600 transition-colors">Stories</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>

              <button
                onClick={() => setMenuOpen(false)}
                className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition absolute top-4 right-4"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <Link to="/signup" className="hidden md:block bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-full font-medium transition">
              Get Started
            </Link>

            <button
              id="open-menu"
              onClick={() => setMenuOpen(true)}
              className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition z-10"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </nav>

          <div className="flex items-center gap-2 border border-slate-300 hover:border-slate-400/70 rounded-full w-max mx-auto px-4 py-2 mt-40 md:mt-32 bg-white/50 backdrop-blur transition-all">
            <span className="text-[#050040] font-medium">New: WhatsApp API integration live</span>
            <button className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800">
              <span>Read more</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <h5 className="text-4xl md:text-7xl font-semibold tracking-tight max-w-[900px] text-center mx-auto mt-8 text-[#050040]">
            Automate customer support with AI
          </h5>

          <p className="text-sm md:text-base mx-auto max-w-2xl text-center mt-6 max-md:px-4 text-slate-700 leading-relaxed">
            Build sleek, consistent conversational experiences without wrestling with complex logic. Our AI handles the heavy lifting so your business can serve Web3Nova customers 24/7.
          </p>

          <div className="mx-auto w-full flex items-center justify-center gap-4 mt-8">
            <Link to="/signup" className="bg-slate-800 hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get Started
            </Link>
            <Link to="/login" className="flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-100/50 rounded-full px-8 py-3.5 text-[#050040] font-medium transition">
              <span>Log In</span>
              <ChevronRight size={16} className="opacity-70" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
