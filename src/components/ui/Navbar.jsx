import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MagneticButton from './MagneticButton';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`bp-navbar ${scrolled ? 'bp-navbar-scrolled' : ''}`}>
      <div className="bp-navbar-container">
        
        <div className="bp-nav-left">
          <Link to="/" className="bp-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F8F4E8', color: '#4166F5', fontWeight: 'bold', fontSize: '18px', lineHeight: '1' }}>B</div>
            <span className="bp-logo-text">BizAI</span>
          </Link>
          
          <div className="bp-nav-links">
            <div className="bp-nav-item">Features <span className="bp-chevron">▾</span></div>
            <div className="bp-nav-item">Integrations <span className="bp-chevron">▾</span></div>
            <div className="bp-nav-item">Pricing</div>
            <div className="bp-nav-item">Resources <span className="bp-chevron">▾</span></div>
            <div className="bp-nav-item">Docs</div>
          </div>
        </div>

        <div className="bp-nav-actions">
          <Link to="/login" className="bp-nav-login">Log in</Link>
          <MagneticButton strength={0.2}>
            <Link to="/signup" className="bp-btn bp-btn-primary">Get Started</Link>
          </MagneticButton>
        </div>
        
      </div>
    </nav>
  );
}
