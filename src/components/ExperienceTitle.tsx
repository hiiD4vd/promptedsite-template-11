import React, { useEffect, useRef } from 'react';

export const ExperienceTitle: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;

    const updatePosition = () => {
      const el = containerRef.current;
      if (el) {
        // Check if AgeGate is still active
        const gate = document.querySelector('.AgeGate') as HTMLElement | null;
        const isGateActive =
          gate &&
          window.getComputedStyle(gate).display !== 'none' &&
          window.getComputedStyle(gate).opacity !== '0';

        // Check if Collection tab is active
        const activeLink = document.querySelector('.header__link.active');
        const isCollection = activeLink?.textContent?.toLowerCase().includes('collection');

        if (isGateActive || isCollection) {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
        } else {
          // Read Hydra scroll position directly from Global.SCROLL
          const scrollY = (window as any).Global?.SCROLL?.y || 0;

          // Natural scroll up with the 3D scene (1px scroll = 1px translate)
          el.style.transform = `translate3d(0, ${-scrollY}px, 0)`;

          // Smooth fade out as it reaches the top
          // Fully visible at scroll 0, completely gone by scroll 450px
          const opacity = Math.max(0, 1 - scrollY / 450);
          el.style.opacity = String(opacity);
          el.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
        }
      }
      animId = requestAnimationFrame(updatePosition);
    };

    animId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ExperienceTitle"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 'clamp(48px, 8vh, 100px)',
        opacity: 0,
        willChange: 'transform, opacity',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'Charles Rosie Regular', serif",
          fontSize: 'clamp(14px, 2vw, 24px)',
          letterSpacing: '0.2em',
          color: '#ffffff',
          marginBottom: '10px',
          opacity: 0.8,
          textTransform: 'uppercase',
        }}
      >
        THE
      </span>
      <h1
        style={{
          fontFamily: "'Charles Rosie Regular', serif",
          fontSize: 'clamp(38px, 7.5vw, 110px)',
          letterSpacing: '0.04em',
          color: '#ffffff',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.05,
          textShadow: '0 0 35px rgba(255, 255, 255, 0.25)',
        }}
      >
        PROMPTED<br />EXPERIENCE
      </h1>
      <span
        style={{
          fontFamily: "'PPNikkeiMaru-Regular', sans-serif",
          fontSize: 'clamp(10px, 1.2vw, 13px)',
          letterSpacing: '0.3em',
          color: '#a78bfa',
          marginTop: '20px',
          textTransform: 'uppercase',
          opacity: 0.9,
        }}
      >
        THE MOTION PROMPT ATELIER
      </span>
    </div>
  );
};
