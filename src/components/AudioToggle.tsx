import React from 'react';

interface AudioToggleProps {
  isPlaying: boolean;
  frequencies: number[];
  onToggle: () => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({ isPlaying, frequencies, onToggle }) => {
  return (
    <div
      className="AudioToggle"
      data-variant="fixed"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 90,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        height: '24px',
      }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Mute audio' : 'Unmute audio'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle();
        }
      }}
    >
      {frequencies.map((freq, index) => {
        const height = isPlaying ? Math.max(4, Math.round(freq * 22)) : 4;
        return (
          <div
            key={index}
            style={{
              width: '3px',
              height: `${height}px`,
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              transition: 'height 0.1s ease',
            }}
          />
        );
      })}
    </div>
  );
};
