import React from 'react';
import type { NavigationTab } from '../types';

interface HeaderMenuProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({ activeTab, onSelectTab }) => {
  return (
    <>
      {/* Top Left Brand Logo */}
      <header
        style={{
          position: 'fixed',
          top: '25px',
          left: '25px',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('experience');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff' }}
        >
          {/* PromptedSite Monogram Spark */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c5cff 0%, #1e1b4b 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(124, 92, 255, 0.4)',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-1px' }}>PS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1.1 }}>PROMPTEDSITE</span>
            <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.2em', opacity: 0.6, textTransform: 'uppercase' }}>Atelier</span>
          </div>
        </a>
      </header>

      {/* Top Right Navigation Pill */}
      <nav className="HeaderMenu" aria-label="Main Navigation">
        <div className="header__background" />
        <div className="header__content">
          <button
            type="button"
            className={`header__link ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => onSelectTab('experience')}
            style={{ background: 'none', border: 'none' }}
          >
            <span>EXPERIENCE</span>
          </button>

          <div className="header__ornament" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
              <path
                d="M 14 0 C 14 3.5, 18 6, 23 6 C 18 6, 14 8.5, 14 12 C 14 8.5, 10 6, 5 6 C 10 6, 14 3.5, 14 0 Z"
                fill="#A78BFA"
              />
            </svg>
          </div>

          <button
            type="button"
            className={`header__link ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => onSelectTab('collection')}
            style={{ background: 'none', border: 'none' }}
          >
            <span>COLLECTION</span>
          </button>
        </div>
      </nav>
    </>
  );
};
