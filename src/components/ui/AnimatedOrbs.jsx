import React, { useRef, useEffect, useState, useCallback } from 'react';
import './AnimatedOrbs.css';

/**
 * Animated gradient orbs that float and morph in the background.
 * They follow the cursor with a soft, delayed drift.
 */
export default function AnimatedOrbs() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const orbRefs = useRef([]);
  const rafRef = useRef(null);
  const positionsRef = useRef([
    { x: 30, y: 40 },
    { x: 70, y: 30 },
    { x: 50, y: 70 },
  ]);

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };

    const animate = () => {
      const mouse = mouseRef.current;
      const positions = positionsRef.current;

      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;

        // Each orb follows mouse with different delay/offset
        const offsetX = (i - 1) * 15;
        const offsetY = (i - 1) * 10;
        const targetX = mouse.x * 100 + offsetX;
        const targetY = mouse.y * 100 + offsetY;
        const speed = 0.01 + i * 0.005;

        positions[i].x += (targetX - positions[i].x) * speed;
        positions[i].y += (targetY - positions[i].y) * speed;

        orb.style.transform = `translate(${positions[i].x - 50}%, ${positions[i].y - 50}%) scale(1)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouse);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="animated-orbs-container" ref={containerRef}>
      <div
        className="animated-orb orb-1"
        ref={(el) => (orbRefs.current[0] = el)}
      />
      <div
        className="animated-orb orb-2"
        ref={(el) => (orbRefs.current[1] = el)}
      />
      <div
        className="animated-orb orb-3"
        ref={(el) => (orbRefs.current[2] = el)}
      />
    </div>
  );
}
