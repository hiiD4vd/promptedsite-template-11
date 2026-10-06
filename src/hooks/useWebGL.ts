import { useEffect, useRef, useState } from 'react';
import { WebGLApp } from '../engine/WebGLApp';
import type { NavigationTab } from '../types';

export function useWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = WebGLApp.getInstance();

    app
      .init(containerRef.current, (progress) => {
        setLoadProgress(progress);
        if (progress >= 100) {
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        // Fallback or error logging
        console.warn('WebGL initialization:', err);
      });

    return () => {
      // Teardown on unmount
      app.destroy();
    };
  }, []);

  const changeTab = (tab: NavigationTab) => {
    WebGLApp.getInstance().setTab(tab);
  };

  const selectProduct = (index: number) => {
    WebGLApp.getInstance().selectProduct(index);
  };

  return {
    containerRef,
    isLoaded,
    loadProgress,
    changeTab,
    selectProduct,
  };
}
