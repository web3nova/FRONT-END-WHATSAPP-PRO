import React, { useRef, useCallback } from 'react';

/**
 * Wraps children in a magnetic hover effect.
 * The element subtly follows the cursor when hovered, creating
 * a magnetic pull/push illusion.
 */
export default function MagneticButton({ children, strength = 0.3, className = '', style = {} }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    el.style.transition = 'transform 0.15s ease-out';
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'translate(0, 0) scale(1)';
    el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
