import React, { useState, useEffect } from 'react';
import './HeroImageFader.css';

const images = [
  "/black-employees-explaining-business-analytics.jpg", // Local image from public folder
  "https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?auto=format&fit=crop&w=1600&q=80", // Presenting at a meeting
  "/colleagues-reviewing-plans-tablet.jpg", // Local image from public folder
  "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1600&q=80"  // Working on a tablet
];

export default function HeroImageFader() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-fader-wrapper">
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Platform showcase ${idx + 1}`}
          className={`hero-fader-img ${idx === currentIndex ? 'hero-fader-img-active' : ''}`}
        />
      ))}
      {/* Dark overlay so text stays readable */}
      <div className="hero-fader-darken" />

      {/* Progress Indicators */}
      <div className="hero-fader-indicators">
        {images.map((_, idx) => (
          <div key={idx} className="hero-fader-indicator">
            <div 
              className={`hero-fader-indicator-progress ${idx === currentIndex ? 'active' : ''}`}
              key={`${idx}-${currentIndex === idx ? 'active' : 'inactive'}`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
