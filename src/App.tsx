import { useEffect } from 'react';
import { useWebGL } from './hooks/useWebGL';
import { useAudio } from './hooks/useAudio';
import { useResize } from './hooks/useResize';
import { WebGLCanvas } from './components/WebGLCanvas';
import { RotatePrompt } from './components/RotatePrompt';
import { ExperienceTitle } from './components/ExperienceTitle';

export function App() {
  const { isMobile } = useResize();
  const { containerRef } = useWebGL();
  const { initAudio } = useAudio();

  useEffect(() => {
    // When user clicks anywhere (especially YES on AgeGate), enable AudioContext
    const handleFirstInteraction = () => {
      initAudio();
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [initAudio]);

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

      {/* Orientation Warning for mobile landscape */}
      <RotatePrompt show={isMobile && window.innerWidth > window.innerHeight} />
    </main>
  );
}

export default App;
