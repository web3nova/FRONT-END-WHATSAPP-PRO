import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook that reveals elements when they scroll into view using IntersectionObserver.
 * Returns a ref to attach and a boolean indicating visibility.
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

/**
 * Hook for parallax scrolling effect.
 * Returns a ref and a style object that translates the element on scroll.
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.innerHeight - rect.top;
      setOffset(scrolled * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return [ref, { transform: `translateY(${offset}px)` }];
}

/**
 * Hook that tracks cursor position relative to an element for tilt effects.
 */
export function useTilt(maxTilt = 8) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } });

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * maxTilt * 2,
      y: (x - 0.5) * -maxTilt * 2,
      shine: { x: x * 100, y: y * 100 },
    });
  }, [maxTilt]);

  const handleLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } });
  }, []);

  const style = {
    transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
    transition: tilt.x === 0 ? 'transform 0.6s ease' : 'transform 0.1s ease-out',
  };

  const shineStyle = {
    background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.15), transparent 60%)`,
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    zIndex: 5,
  };

  return { ref, style, shineStyle, handleMove, handleLeave };
}
