import React from 'react';

export const FooterUI: React.FC = () => {
  return (
    <footer className="FooterUI" style={{ position: 'relative', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
      <div className="footer-group">
        <div className="footer-logo">
          <img src="/assets/images/footer_logo.svg" alt="PromptedSite Logo" style={{ width: '100%', maxWidth: '240px' }} />
        </div>

        <div className="footer-links">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="body-bold" style={{ fontSize: '13px' }}>PROMPTEDSITE</span>
            <span className="body-regular">The Motion Prompt Atelier</span>
            <span className="body-regular" style={{ opacity: 0.6 }}>500+ Curated Prompts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="body-bold" style={{ fontSize: '13px' }}>ATELIER</span>
            <span className="body-regular">WebGL & Three.js</span>
            <span className="body-regular">React Kinetics</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="body-bold" style={{ fontSize: '13px' }}>LEGAL</span>
            <a href="https://promptedsite.com" target="_blank" rel="noopener noreferrer" className="underline body-regular">promptedsite.com</a>
            <span className="body-regular" style={{ opacity: 0.6 }}>© 2025 All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
