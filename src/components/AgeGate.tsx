import React, { useState } from 'react';

interface AgeGateProps {
  onAccept: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onAccept }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleYes = () => {
    setVisible(false);
    try {
      localStorage.setItem('promptedsite_gate', 'true');
    } catch {
      // storage unavailable
    }
    onAccept();

    // Trigger internal engine age gate button if present
    const internalButtons = document.querySelectorAll('#Stage .AgeGate .action, #Stage .action, #Stage button');
    internalButtons.forEach((b) => {
      const txt = b.textContent?.toLowerCase() || '';
      if (txt.includes('enter') || txt.includes('yes')) {
        (b as HTMLElement).click();
      }
    });
  };

  return (
    <div
      className="AgeGate"
      role="dialog"
      aria-modal="true"
      aria-label="Age Verification"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99,
        backgroundColor: 'rgba(29, 29, 29, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffffff',
      }}
    >
      <div
        className="intro"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <div className="top" style={{ marginBottom: '24px' }}>
          <h1 className="heading2" style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(36px, 8vw, 84px)' }}>
            PROMPTED
          </h1>
        </div>

        <div
          className="actions"
          style={{
            opacity: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            margin: '24px 0',
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            className="action"
            onClick={handleYes}
            aria-label="Enter PromptedSite Atelier"
            style={{
              opacity: 1,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '130px',
              height: '48px',
              border: '2px solid #ffffff',
              backgroundColor: 'transparent',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c5cff';
              e.currentTarget.style.color = '#7c5cff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.color = '#ffffff';
            }}
          >
            <span className="body-bold" style={{ fontSize: '14px', letterSpacing: '0.15em' }}>ENTER</span>
          </button>
        </div>

        <div className="bottom" style={{ marginTop: '24px' }}>
          <h2 className="heading2" style={{ margin: 0, textAlign: 'center', fontSize: 'clamp(36px, 8vw, 84px)' }}>
            SITE
          </h2>
        </div>
      </div>
    </div>
  );
};
