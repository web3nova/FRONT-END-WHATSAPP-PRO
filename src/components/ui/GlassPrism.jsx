import React, { useRef, useEffect, useState } from 'react';
import './GlassPrism.css';

export default function GlassPrism() {
  const prismRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // To store the current exact rotation values
  const currentRot = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    // Auto-rotation accumulator
    let autoRotateY = 0;
    let autoRotateX = 0;

    const handleMouseMove = (e) => {
      if (!isHovered) return;
      
      if (prismRef.current) {
        const rect = prismRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate offset from center (-1 to 1)
        mouseX = ((e.clientX - centerX) / (rect.width / 2));
        mouseY = ((e.clientY - centerY) / (rect.height / 2));
        
        // Clamp between -1 and 1 just in case
        mouseX = Math.max(-1, Math.min(1, mouseX));
        mouseY = Math.max(-1, Math.min(1, mouseY));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    let animationFrameId;

    const animate = () => {
      if (isHovered) {
        // Target rotation based on mouse (tilt effect)
        targetX = mouseY * -30; // Tilt up/down
        targetY = mouseX * 30;  // Tilt left/right
      } else {
        // Slowly auto rotate
        autoRotateY += 0.3;
        autoRotateX += 0.1;
        targetX = autoRotateX;
        targetY = autoRotateY;
      }

      // Smoothly interpolate current rotation towards target
      currentRot.current.x += (targetX - currentRot.current.x) * 0.1;
      currentRot.current.y += (targetY - currentRot.current.y) * 0.1;

      if (prismRef.current) {
        prismRef.current.style.transform = `rotateZ(-20deg) rotateX(${currentRot.current.x}deg) rotateY(${currentRot.current.y}deg)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  return (
    <div className="prism-scene">
      <div 
        className={`prism ${isHovered ? 'hovered' : ''}`} 
        ref={prismRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="prism-face front"></div>
        <div className="prism-face back"></div>
        <div className="prism-face right"></div>
        <div className="prism-face left"></div>
        <div className="prism-face top"></div>
        <div className="prism-face bottom"></div>
      </div>
    </div>
  );
}
