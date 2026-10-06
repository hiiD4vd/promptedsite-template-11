import React from 'react';

interface WebGLCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const WebGLCanvas: React.FC<WebGLCanvasProps> = ({ containerRef }) => {
  return (
    <div
      ref={containerRef}
      id="Stage"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    />
  );
};
