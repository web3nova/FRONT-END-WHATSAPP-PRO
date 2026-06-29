import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Noise from './Noise';
import MagneticButton from './MagneticButton';
import HeroImageFader from './HeroImageFader';
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
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 Need help?", sender: "bot", time: "just now" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputValue, sender: "user", time: "just now" }]);
    setInputValue("");

    // Bot replies immediately
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "Thanks for your message! I'm an AI bot. How can I help you explore Biz AI today?",
        sender: "bot",
        time: "just now"
      }]);
    }, 500);
  };

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


      {/* Background Image Fader */}
      <HeroImageFader />

      {/* Noise Grain Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <Noise patternAlpha={12} patternRefreshInterval={3} />
      </div>

      {/* Minimalistic Hero */}
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
            Automate your WhatsApp customer support and manage orders directly from your dashboard. Complete business control with zero hidden messaging fees.
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

      {/* Chat Bot Section */}
      {!isChatOpen && (
        <>
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
                <div className="bp-chat-time">Biz AI</div>
              </div>
            </div>
          </div>
          <div className="bp-chat-button bp-float-delayed" onClick={() => setIsChatOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#fff" />
            </svg>
          </div>
        </>
      )}

      {isChatOpen && (
        <div className="bp-interactive-chat">
          <div className="bp-chat-header">
            <div className="bp-chat-header-info">
              <div className="bp-chat-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" fill="#fff" />
                  <circle cx="11" cy="12" r="2.5" fill="#000" />
                </svg>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#111' }}>Biz AI AI Bot</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Always active</p>
              </div>
            </div>
            <button className="bp-chat-close" onClick={() => setIsChatOpen(false)}>×</button>
          </div>
          <div className="bp-chat-messages" ref={messagesContainerRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`bp-chat-message-row ${msg.sender === 'user' ? 'bp-chat-row-user' : 'bp-chat-row-bot'}`}>
                <div className={`bp-chat-bubble ${msg.sender === 'user' ? 'bp-chat-bubble-user' : 'bp-chat-bubble-bot'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form className="bp-chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bp-chat-input"
            />
            <button type="submit" className="bp-chat-send-btn" disabled={!inputValue.trim()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Smooth Fade Transition removed as the hero is now a bounded card */}

    </section>
  );
}
