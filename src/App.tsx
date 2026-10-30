import { useEffect, useRef, useState } from 'react';
import { useWebGL } from './hooks/useWebGL';
import { useResize } from './hooks/useResize';
import { WebGLCanvas } from './components/WebGLCanvas';
import { RotatePrompt } from './components/RotatePrompt';
import { ExperienceTitle } from './components/ExperienceTitle';
import { ExperienceError } from './components/ExperienceError';
import { HeaderMenu } from './components/HeaderMenu';
import { AgeGate } from './components/AgeGate';
import type { NavigationTab } from './types';

export function App() {
  const { width, height, isMobile } = useResize();
  const { containerRef, status, error, retry, changeTab } = useWebGL();
  const [entered, setEntered] = useState(false);
  const [gateVisible, setGateVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('experience');
  const enterTimer = useRef<number | null>(null);

  const enterExperience = () => {
    if (enterTimer.current !== null) return;
    let attempts = 0;
    const tryEnter = () => {
      const legacyGate = document.querySelector('.Container > .AgeGate');
      if (!legacyGate || attempts >= 60) {
        if (enterTimer.current !== null) window.clearInterval(enterTimer.current);
        enterTimer.current = null;
        return;
      }
      attempts += 1;
      legacyGate.querySelector<HTMLElement>('.action')?.click();
    };
    tryEnter();
    enterTimer.current = window.setInterval(tryEnter, 250);
  };

  useEffect(() => {
    const syncLegacyState = () => {
      const legacyHeader = document.querySelector('.Story > .HeaderMenu');
      const hasGate = Boolean(document.querySelector('.Container > .AgeGate'));
      if (!hasGate && enterTimer.current !== null) {
        window.clearInterval(enterTimer.current);
        enterTimer.current = null;
      }
      setGateVisible(hasGate);
      setEntered(Boolean(legacyHeader) && !hasGate);
      if (legacyHeader) {
        setActiveTab(
          legacyHeader.querySelector('.header__link.active')?.textContent?.toLowerCase().includes('collection')
            ? 'collection'
            : 'experience',
        );
      }
    };
    const observer = new MutationObserver(syncLegacyState);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    syncLegacyState();
    return () => {
      observer.disconnect();
      if (enterTimer.current !== null) window.clearInterval(enterTimer.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.experienceStatus = status;
    return () => {
      delete document.documentElement.dataset.experienceStatus;
    };
  }, [status]);

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1d1d1d',
      }}
    >
      {/* 3D WebGL Canvas Layer running native HydraX Engine */}
      <WebGLCanvas containerRef={containerRef} />

      {/* Rebranded Scene Intro Title */}
      <ExperienceTitle />

      {gateVisible ? (
        <AgeGate onEnter={enterExperience} />
      ) : null}

      {entered ? <HeaderMenu activeTab={activeTab} onSelectTab={changeTab} /> : null}

      <p className="sr-only" role="status" aria-live="polite">
        {status === 'loading' ? 'Loading interactive experience' : ''}
      </p>

      {status === 'error' && error ? <ExperienceError message={error} onRetry={retry} /> : null}

      {/* Orientation Warning for mobile landscape */}
      <RotatePrompt show={isMobile && width > height} />
    </main>
  );
}

export default App;
