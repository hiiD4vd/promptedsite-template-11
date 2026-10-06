import React from 'react';

interface LoaderViewProps {
  progress: number;
}

export const LoaderView: React.FC<LoaderViewProps> = ({ progress }) => {
  return (
    <div
      className="LoaderView"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1d1d1d',
        transition: 'opacity 0.6s ease',
        pointerEvents: progress >= 100 ? 'none' : 'auto',
        opacity: progress >= 100 ? 0 : 1,
      }}
    >
      <div className="logo" style={{ marginBottom: '32px' }}>
        <img
          src="/assets/images/logo.png"
          alt="Santioni Logo"
          style={{ width: '88px', height: 'auto', display: 'block' }}
        />
      </div>

      <div
        className="loading-bar"
        style={{
          width: '240px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          className="loading-bar__fill"
          style={{
            height: '100%',
            width: `${Math.min(100, progress)}%`,
            backgroundColor: '#ffffff',
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>

      <div
        className="body-bold"
        style={{
          marginTop: '16px',
          fontSize: '12px',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
};
