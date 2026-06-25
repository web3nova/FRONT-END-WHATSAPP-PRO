import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassPrism from './GlassPrism';
import Noise from './Noise';
import AnimatedOrbs from './AnimatedOrbs';
import FloatingParticles from './FloatingParticles';
import MagneticButton from './MagneticButton';
import { useScrollReveal } from '../../hooks/useAnimations';
import './BotpressHero.css';

/**
 * Typing animation for the hero title words.
 */
function AnimatedTitle() {
  const words = ['WhatsApp', 'Business', 'Automation'];
  const [currentWord, setCurrentWord] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    let timeout;

    if (!isDeleting && displayed === word) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setCurrentWord((prev) => (prev + 1) % words.length);
    } else {
      const speed = isDeleting ? 50 : 100;
      timeout = setTimeout(() => {
        setDisplayed(
          isDeleting ? word.substring(0, displayed.length - 1) : word.substring(0, displayed.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentWord, words]);

  return (
    <span className="bp-typed-word">
      {displayed}
      <span className="bp-cursor">|</span>
    </span>
  );
}

/**
 * Staggered reveal wrapper — each child animates in with a delay.
 */
function StaggerReveal({ children, className = '' }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <div ref={ref} className={`stagger-container ${isVisible ? 'stagger-visible' : ''} ${className}`}>
      {React.Children.map(children, (child, i) => (
        <div className="stagger-item" style={{ transitionDelay: `${i * 120}ms` }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export default function BotpressHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Parallax offsets based on cursor
  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 20;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 20;

  return (
    <section className="bp-hero">

      {/* Layer 0: Animated gradient orbs */}
      <AnimatedOrbs />

      {/* Layer 1: Noise grain overlay */}
      <div className="bp-hero-bg">
        <Noise patternAlpha={12} patternRefreshInterval={3} />
      </div>

      {/* Layer 2: Floating particles that react to cursor */}
      <FloatingParticles count={50} color="rgba(0,0,0,0.06)" connectDistance={100} />

      {/* Layer 3: Glass Prism — parallax shifted */}
      <div
        className="bp-prism-wrapper"
        style={{
          transform: `translate(calc(-50% + ${parallaxX * 0.6}px), calc(-50% + ${parallaxY * 0.6}px))`,
        }}
      >
        <GlassPrism />
      </div>

      {/* Content */}
      <div className="bp-hero-container">
        <StaggerReveal className="bp-hero-content">
          <div className="bp-badge bp-badge-animated">
            <span className="bp-badge-tag">NEW</span>
            Now with our own WhatsApp automation <span className="bp-badge-arrow">→</span>
          </div>

          <h1 className="bp-hero-title">
            The enterprise-grade <AnimatedTitle /><br />
            agent platform.
          </h1>

          <p className="bp-hero-subtitle">
            Automate your WhatsApp customer support and manage orders directly from your<br />
            dashboard. Complete business control with zero hidden messaging fees.
          </p>

          <div className="bp-hero-actions">
            <MagneticButton strength={0.25}>
              <Link to="/signup" className="bp-btn bp-btn-primary bp-btn-large bp-btn-glow">
                Try for free <span className="bp-btn-arrow">→</span>
              </Link>
            </MagneticButton>
          </div>
        </StaggerReveal>
      </div>

      {/* Floating Chat Widget Mockup */}
      <div
        className="bp-chat-widget bp-float"
        style={{
          transform: `translate(${parallaxX * -0.3}px, ${parallaxY * -0.3}px)`,
        }}
      >
        <div className="bp-chat-content">
          <div className="bp-chat-avatar bp-pulse-ring">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="#fff" />
              <circle cx="11" cy="12" r="2.5" fill="#000" />
            </svg>
          </div>
          <div className="bp-chat-text">
            <div className="bp-chat-msg">Hi! 👋 Need help?</div>
            <div className="bp-chat-time">Web3Nova - a few moments ago</div>
          </div>
        </div>
      </div>

      <div className="bp-chat-button bp-float-delayed">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#fff" />
        </svg>
      </div>

    </section>
  );
}
