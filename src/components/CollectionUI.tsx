import React from 'react';
import type { ProductItem } from '../types';

export const PRODUCTS: ProductItem[] = [
  {
    id: 'mint',
    number: 'N.01',
    name: 'KINETIC TYPOGRAPHY & FLUID',
    subtitle: 'PROMPTEDSITE',
    abv: 'REACT + GLSL',
    volume: '500+ PROMPTS',
    color: '#34d399',
    bgColor: '#7c5cff',
  },
  {
    id: 'orange',
    number: 'N.02',
    name: 'CELESTIAL PARTICLES & SHADERS',
    subtitle: 'PROMPTEDSITE',
    abv: 'THREE.JS + VITE',
    volume: 'FULL SOURCE',
    color: '#38bdf8',
    bgColor: '#7c5cff',
  },
  {
    id: 'marshmallow',
    number: 'N.03',
    name: 'NEO-CINEMATIC PORTFOLIO SYSTEM',
    subtitle: 'PROMPTEDSITE',
    abv: 'WEBGL + HYDRAX',
    volume: 'AI-OPTIMIZED',
    color: '#fbbf24',
    bgColor: '#7c5cff',
  },
];

interface CollectionUIProps {
  currentIndex: number;
  onSelectProduct: (index: number) => void;
}

export const CollectionUI: React.FC<CollectionUIProps> = ({ currentIndex, onSelectProduct }) => {
  const currentProduct = PRODUCTS[currentIndex];

  const handlePrev = () => {
    onSelectProduct((currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  const handleNext = () => {
    onSelectProduct((currentIndex + 1) % PRODUCTS.length);
  };

  return (
    <div className="CollectionUI" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* Background Giant Typography */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <h1
          className="heading1"
          style={{
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: '1200px',
            lineHeight: 0.9,
            margin: 0,
            textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          }}
        >
          {currentProduct.name}
        </h1>
      </div>

      {/* Navigation Buttons: Left and Right */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '40px',
          transform: 'translateY(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          className="body-bold"
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          aria-label="Previous cocktail"
        >
          <span style={{ fontSize: '18px' }}>←</span>
          {PRODUCTS[(currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length].name.split(' ')[0]}
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '40px',
          transform: 'translateY(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={handleNext}
          className="body-bold"
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          aria-label="Next cocktail"
        >
          {PRODUCTS[(currentIndex + 1) % PRODUCTS.length].name.split(' ')[0]}
          <span style={{ fontSize: '18px' }}>→</span>
        </button>
      </div>

      {/* Bottom Product Details Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          color: '#ffffff',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div className="body-bold" style={{ fontSize: '12px' }}>{currentProduct.subtitle}</div>
          <div className="body-regular" style={{ fontSize: '11px', opacity: 0.8 }}>{currentProduct.number}</div>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.4)' }} />

        <div style={{ textAlign: 'left' }}>
          <div className="body-bold" style={{ fontSize: '12px' }}>{currentProduct.abv}</div>
          <div className="body-regular" style={{ fontSize: '11px', opacity: 0.8 }}>{currentProduct.volume}</div>
        </div>
      </div>
    </div>
  );
};
