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
            <img src="/BizIq8.png" alt="BizIQ" style={{ height: '32px', width: 'auto' }} />
          </Link>
          
          <div className="bp-nav-links">
            <a href="#features" className="bp-nav-item" onClick={(e) => {
              const el = document.getElementById('features');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}>Features</a>
            <a href="#integrations" className="bp-nav-item" onClick={(e) => {
              const el = document.getElementById('integrations');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}>Integrations</a>
            <a href="#pricing" className="bp-nav-item" onClick={(e) => {
              const el = document.getElementById('pricing');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}>Pricing</a>
            <a href="https://wa.me/2348029545794" target="_blank" rel="noreferrer" className="bp-nav-item">Contact Us</a>
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
