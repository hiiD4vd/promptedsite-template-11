import React, { useState } from 'react';

export const CookieBanner: React.FC = () => {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className="CookieBanner" role="region" aria-label="Cookie consent">
      <div className="cookie__background" />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p className="body-regular" style={{ fontSize: '12px', margin: 0, color: '#121212' }}>
          We use cookies to improve your experience and deliver personalized content.{' '}
          <a
            href="#privacy"
            className="privacy-link"
            style={{ color: '#121212', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </p>

        <div className="cookie-banner-buttons" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            className="body-bold"
            onClick={() => setAccepted(true)}
            style={{
              padding: '6px 14px',
              backgroundColor: '#121212',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'uppercase',
            }}
          >
            Accept
          </button>

          <button
            type="button"
            className="body-bold"
            onClick={() => setAccepted(true)}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              color: '#121212',
              border: '1px solid #121212',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'uppercase',
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};
